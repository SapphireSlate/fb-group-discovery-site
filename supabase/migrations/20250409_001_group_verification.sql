-- Add verification fields to groups table
ALTER TABLE public.groups
ADD COLUMN verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN verified_by UUID REFERENCES public.users(id),
ADD COLUMN verification_notes TEXT,
ADD COLUMN verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected', 'needs_review', 'flagged')) DEFAULT 'pending';

-- Create index for faster verification queries
CREATE INDEX idx_group_verification_status ON public.groups(verification_status);

-- Update existing groups to have a verification status
UPDATE public.groups
SET verification_status = CASE
    WHEN is_verified = true THEN 'verified'
    ELSE 'pending'
END;

-- Create verification_logs table to track verification history
CREATE TABLE public.verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.groups(id) NOT NULL,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected', 'needs_review', 'flagged')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add Row Level Security for verification_logs table
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view verification logs
CREATE POLICY "Admin users can view verification logs" 
ON public.verification_logs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Only admins can insert verification logs
CREATE POLICY "Admin users can insert verification logs" 
ON public.verification_logs FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Create verification_stats view
CREATE OR REPLACE VIEW public.verification_stats AS
SELECT 
    verification_status,
    COUNT(*) as count,
    MAX(verification_date) as last_verification_date
FROM 
    public.groups
GROUP BY 
    verification_status;

-- Grant permissions
GRANT SELECT ON public.verification_stats TO service_role, authenticated;
GRANT SELECT, INSERT ON public.verification_logs TO service_role, authenticated; 