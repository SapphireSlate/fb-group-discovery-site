-- Add verification status type and columns to groups table
ALTER TABLE public.groups 
    ADD COLUMN verification_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    ADD COLUMN verified_by UUID REFERENCES auth.users(id) DEFAULT NULL,
    ADD COLUMN verification_notes TEXT DEFAULT NULL,
    ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'rejected', 'needs_review', 'flagged'));

-- Create an index on verification_status for faster queries
CREATE INDEX idx_groups_verification_status ON public.groups(verification_status);

-- Update existing groups based on is_verified to maintain backward compatibility
UPDATE public.groups 
SET verification_status = CASE 
    WHEN is_verified = true THEN 'verified'
    ELSE 'pending'
END;

-- Create verification logs table to track history of verifications
CREATE TABLE public.verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected', 'needs_review', 'flagged')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on verification_logs
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for verification_logs
CREATE POLICY "Allow admins to view verification logs"
    ON public.verification_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Allow admins to insert verification logs"
    ON public.verification_logs
    FOR INSERT
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
    verification_status
ORDER BY 
    count DESC;

-- Grant permissions
GRANT SELECT ON public.verification_stats TO authenticated;
GRANT SELECT, INSERT ON public.verification_logs TO authenticated; 