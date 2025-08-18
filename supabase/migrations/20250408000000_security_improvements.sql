-- Row Level Security Policies for FB Group Discovery Site

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Users Policies

-- Anyone can view user profiles
CREATE POLICY "Public users are viewable"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- Groups Policies

-- Anyone can view active groups
CREATE POLICY "Active groups are viewable by everyone"
  ON groups FOR SELECT
  USING (status = 'active');

-- Authenticated users can create groups
CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users));

-- Users can update their own groups
CREATE POLICY "Users can update own groups"
  ON groups FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = submitted_by));

-- Users can delete their own groups
CREATE POLICY "Users can delete own groups"
  ON groups FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = submitted_by));

-- Categories Policies

-- Anyone can view categories
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Only admins can create/update/delete categories
CREATE POLICY "Only admins can create categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

CREATE POLICY "Only admins can update categories"
  ON categories FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

CREATE POLICY "Only admins can delete categories"
  ON categories FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Tags Policies

-- Anyone can view tags
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

-- Authenticated users can create tags
CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users));

-- Only admins can update or delete tags
CREATE POLICY "Only admins can update tags"
  ON tags FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

CREATE POLICY "Only admins can delete tags"
  ON tags FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Reviews Policies

-- Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users));

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Votes Policies

-- Anyone can view votes
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

-- Authenticated users can create votes
CREATE POLICY "Authenticated users can create votes"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users));

-- Users can update their own votes
CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Reports Policies

-- Only admins can view all reports
CREATE POLICY "Only admins can view all reports"
  ON reports FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_id FROM public.users WHERE id = user_id
    )
  );

-- Authenticated users can create reports
CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users));

-- Only admins can update reports (change status)
CREATE POLICY "Only admins can update reports"
  ON reports FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Only admins can delete reports
CREATE POLICY "Only admins can delete reports"
  ON reports FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Reputation History Policies

-- Users can view their own reputation history
CREATE POLICY "Users can view their own reputation history"
  ON reputation_history FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Admin can view all reputation history
CREATE POLICY "Admins can view all reputation history"
  ON reputation_history FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- System can insert reputation history (automated)
CREATE POLICY "System can insert reputation history"
  ON reputation_history FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users));

-- Only admins can update/delete reputation history
CREATE POLICY "Only admins can update reputation history"
  ON reputation_history FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

CREATE POLICY "Only admins can delete reputation history"
  ON reputation_history FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Email Preferences Policies

-- Users can view their own email preferences
CREATE POLICY "Users can view their own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Admins can view all email preferences
CREATE POLICY "Admins can view all email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Users can insert their own email preferences
CREATE POLICY "Users can insert their own email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Users can update their own email preferences
CREATE POLICY "Users can update their own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Only admins can delete email preferences
CREATE POLICY "Only admins can delete email preferences"
  ON email_preferences FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Badges and User Badges Policies

-- Anyone can view badges
CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (true);

-- Only admins can create/update/delete badges
CREATE POLICY "Only admins can create badges"
  ON badges FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));
  
CREATE POLICY "Only admins can update badges"
  ON badges FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));
  
CREATE POLICY "Only admins can delete badges"
  ON badges FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Anyone can view user badges
CREATE POLICY "User badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

-- Only system/admin can insert user badges
CREATE POLICY "Only system can insert user badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Only system/admin can remove user badges
CREATE POLICY "Only system can delete user badges"
  ON user_badges FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Groups Tags Junction Policies

-- Anyone can view group tags
CREATE POLICY "Group tags are viewable by everyone"
  ON groups_tags FOR SELECT
  USING (true);

-- Users can insert tags to their own groups
CREATE POLICY "Users can add tags to own groups"
  ON groups_tags FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT u.auth_id 
      FROM public.users u
      JOIN public.groups g ON g.submitted_by = u.id
      WHERE g.id = group_id
    )
  );

-- Users can delete tags from their own groups
CREATE POLICY "Users can remove tags from own groups"
  ON groups_tags FOR DELETE
  USING (
    auth.uid() IN (
      SELECT u.auth_id 
      FROM public.users u
      JOIN public.groups g ON g.submitted_by = u.id
      WHERE g.id = group_id
    )
  );

-- Security Functions

-- Create a table to track API requests for rate limiting
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  last_request_at TIMESTAMPTZ DEFAULT NOW(),
  reset_at TIMESTAMPTZ DEFAULT NOW() + interval '1 hour'
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_ip_endpoint ON api_rate_limits(ip, endpoint);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(client_ip TEXT, api_endpoint TEXT, max_requests INTEGER DEFAULT 100)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  current_reset TIMESTAMPTZ;
BEGIN
  -- Get current rate limit record
  SELECT request_count, reset_at INTO current_count, current_reset
  FROM api_rate_limits
  WHERE ip = client_ip AND endpoint = api_endpoint
  FOR UPDATE;
  
  -- If no record exists, create one and allow request
  IF current_count IS NULL THEN
    INSERT INTO api_rate_limits (ip, endpoint)
    VALUES (client_ip, api_endpoint);
    RETURN TRUE;
  END IF;
  
  -- If reset time has passed, reset counter
  IF NOW() > current_reset THEN
    UPDATE api_rate_limits
    SET request_count = 1,
        last_request_at = NOW(),
        reset_at = NOW() + interval '1 hour'
    WHERE ip = client_ip AND endpoint = api_endpoint;
    RETURN TRUE;
  END IF;
  
  -- Check if limit exceeded
  IF current_count >= max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  UPDATE api_rate_limits
  SET request_count = request_count + 1,
      last_request_at = NOW()
  WHERE ip = client_ip AND endpoint = api_endpoint;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to detect and prevent SQL injection
CREATE OR REPLACE FUNCTION is_sql_injection(input_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic SQL injection patterns to check
  RETURN input_text ~* '(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|WHERE)(\s|$)' OR
         input_text ~* '(\s|^)(OR|AND)(\s+)(\d+|''.*'')(\s*)=(\s*)(\d+|''.*'')' OR
         input_text ~* ';(\s*)(\n*)(\s*)(SELECT|INSERT|UPDATE|DELETE|DROP)' OR
         input_text ~* '--' OR
         input_text ~* '/\*.*\*/' OR
         input_text ~* '\b(xp_cmdshell|exec\s+master|sp_configure)\b';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a table for security audit logs
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_entity ON security_audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action ON security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at);

-- Create function to add an audit log
CREATE OR REPLACE FUNCTION log_security_event(
  user_id UUID,
  action TEXT,
  entity TEXT,
  entity_id UUID,
  details JSONB DEFAULT NULL,
  ip_address TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO security_audit_logs(user_id, action, entity, entity_id, details, ip_address, user_agent)
  VALUES (user_id, action, entity, entity_id, details, ip_address, user_agent)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to log changes to sensitive data
CREATE OR REPLACE FUNCTION audit_sensitive_data_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
  log_details JSONB;
BEGIN
  -- Get the current user
  SELECT id INTO user_id FROM users WHERE auth_id = auth.uid();
  
  -- Create details JSON
  IF TG_OP = 'UPDATE' THEN
    log_details = jsonb_build_object(
      'operation', TG_OP,
      'old_data', row_to_json(OLD)::jsonb,
      'new_data', row_to_json(NEW)::jsonb,
      'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(row_to_json(NEW)::jsonb)
        WHERE NOT row_to_json(OLD)::jsonb ? key OR row_to_json(OLD)::jsonb->key IS DISTINCT FROM value
      )
    );
  ELSIF TG_OP = 'INSERT' THEN
    log_details = jsonb_build_object(
      'operation', TG_OP,
      'data', row_to_json(NEW)::jsonb
    );
  ELSIF TG_OP = 'DELETE' THEN
    log_details = jsonb_build_object(
      'operation', TG_OP,
      'data', row_to_json(OLD)::jsonb
    );
  END IF;
  
  -- Log the event
  PERFORM log_security_event(
    user_id,
    TG_OP,
    TG_TABLE_NAME::TEXT,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    log_details
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_sensitive_data_changes();

CREATE TRIGGER groups_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON groups
FOR EACH ROW EXECUTE FUNCTION audit_sensitive_data_changes();

CREATE TRIGGER reports_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON reports
FOR EACH ROW EXECUTE FUNCTION audit_sensitive_data_changes(); 