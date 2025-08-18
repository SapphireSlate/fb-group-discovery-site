-- Create a reports table for storing user reports about groups
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT reports_status_check CHECK (status IN ('pending', 'in_review', 'resolved', 'dismissed'))
);

-- Index for faster queries on group_id
CREATE INDEX IF NOT EXISTS idx_reports_group_id ON reports(group_id);

-- Index for faster queries on user_id
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Add RLS policies for the reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create reports
CREATE POLICY "Enable insert for authenticated users" 
ON reports FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow users to view their own reports
CREATE POLICY "Enable read access for users own reports" 
ON reports FOR SELECT 
TO authenticated 
USING (user_id = auth.uid() OR resolved_by = auth.uid());

-- Allow users to update their own pending reports
CREATE POLICY "Enable update for users own pending reports" 
ON reports FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Allow admins to read all reports
CREATE POLICY "Enable read access for admins" 
ON reports FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND (
      users.role = 'admin'
      OR users.email LIKE '%@example.com' -- Simplified admin check, replace with actual domain
    )
  )
);

-- Allow admins to update any report
CREATE POLICY "Enable update for admins" 
ON reports FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND (
      users.role = 'admin'
      OR users.email LIKE '%@example.com' -- Simplified admin check, replace with actual domain
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND (
      users.role = 'admin'
      OR users.email LIKE '%@example.com' -- Simplified admin check, replace with actual domain
    )
  )
);

-- Add report_counts view for easier reporting
CREATE OR REPLACE VIEW report_counts AS
SELECT 
  group_id, 
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'in_review') AS in_review_count,
  COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_count,
  COUNT(*) FILTER (WHERE status = 'dismissed') AS dismissed_count,
  COUNT(*) AS total_count
FROM reports
GROUP BY group_id; 