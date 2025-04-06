-- Create badges table for achievement badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,  -- SVG or URL to badge image
  level INTEGER NOT NULL DEFAULT 1,  -- For badges with multiple levels (bronze, silver, gold)
  points INTEGER NOT NULL DEFAULT 0,  -- Points awarded for this badge
  category TEXT NOT NULL, -- e.g., 'contribution', 'moderation', 'engagement'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  requirements TEXT,  -- JSON string describing how to earn this badge
  display_order INTEGER NOT NULL DEFAULT 0  -- For controlling display order
);

-- Create user_badges table for tracking which users have which badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  level INTEGER NOT NULL DEFAULT 1,  -- Current level of this badge for this user
  times_awarded INTEGER NOT NULL DEFAULT 1,  -- How many times user has earned this badge
  
  -- Ensure a user can't have the same badge multiple times
  CONSTRAINT user_badges_user_badge_unique UNIQUE (user_id, badge_id)
);

-- Create index for faster badge lookups per user
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- Create reputation_history table for tracking reputation changes
CREATE TABLE IF NOT EXISTS reputation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,  -- Can be positive or negative
  reason TEXT NOT NULL,  -- Description of why points were awarded/deducted
  source_type TEXT NOT NULL,  -- e.g., 'review', 'group_submission', 'report', 'vote'
  source_id UUID,  -- ID of the source object (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster reputation history lookups
CREATE INDEX IF NOT EXISTS idx_reputation_history_user_id ON reputation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_history_created_at ON reputation_history(created_at);

-- Alter users table to add reputation-related fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reputation_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS reputation_level INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS badges_count INTEGER NOT NULL DEFAULT 0;

-- Create or replace a function to recalculate a user's total reputation
CREATE OR REPLACE FUNCTION recalculate_user_reputation(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_points INTEGER;
BEGIN
  -- Sum all reputation points from history
  SELECT COALESCE(SUM(points), 0) INTO total_points
  FROM reputation_history
  WHERE user_id = p_user_id;
  
  -- Update the user's reputation_points
  UPDATE users
  SET reputation_points = total_points,
      -- Calculate level: 1 + floor(sqrt(points/100))
      -- This creates a progression where higher levels require more points
      reputation_level = 1 + floor(sqrt(total_points::float / 100))
  WHERE id = p_user_id;
  
  RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Create or replace a function to recalculate a user's badge count
CREATE OR REPLACE FUNCTION recalculate_user_badges_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  badge_count INTEGER;
BEGIN
  -- Count the user's badges
  SELECT COUNT(*) INTO badge_count
  FROM user_badges
  WHERE user_id = p_user_id;
  
  -- Update the user's badges_count
  UPDATE users
  SET badges_count = badge_count
  WHERE id = p_user_id;
  
  RETURN badge_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the badges_count whenever user_badges changes
CREATE OR REPLACE FUNCTION update_badges_count_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- If a badge was added or removed, update the count
  IF TG_OP = 'INSERT' THEN
    PERFORM recalculate_user_badges_count(NEW.user_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM recalculate_user_badges_count(OLD.user_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_badges_after_change
AFTER INSERT OR DELETE ON user_badges
FOR EACH ROW
EXECUTE FUNCTION update_badges_count_trigger();

-- Create a trigger to update reputation points whenever reputation_history changes
CREATE OR REPLACE FUNCTION update_reputation_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- If reputation was added or removed, update the total
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    IF TG_OP = 'INSERT' THEN
      PERFORM recalculate_user_reputation(NEW.user_id);
    ELSE
      PERFORM recalculate_user_reputation(OLD.user_id);
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reputation_history_after_change
AFTER INSERT OR DELETE ON reputation_history
FOR EACH ROW
EXECUTE FUNCTION update_reputation_trigger();

-- Add RLS policies for badges table
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Everyone can view badges
CREATE POLICY "Allow viewing badges for all users" 
ON badges FOR SELECT 
TO authenticated 
USING (true);

-- Only admins can create/update/delete badges
CREATE POLICY "Allow admin to manage badges" 
ON badges FOR ALL 
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

-- Add RLS policies for user_badges table
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Everyone can view who has which badges
CREATE POLICY "Allow viewing user badges for all users" 
ON user_badges FOR SELECT 
TO authenticated 
USING (true);

-- Only admins can create/update/delete user badges
CREATE POLICY "Allow admin to manage user badges" 
ON user_badges FOR ALL 
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

-- Add RLS policies for reputation_history table
ALTER TABLE reputation_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own reputation history
CREATE POLICY "Allow users to view their own reputation history" 
ON reputation_history FOR SELECT 
TO authenticated 
USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

-- Admins can view all reputation history
CREATE POLICY "Allow admins to view all reputation history" 
ON reputation_history FOR SELECT 
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

-- Only backend can insert/update reputation history
CREATE POLICY "Allow backend to manage reputation history" 
ON reputation_history FOR ALL 
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

-- Create a view for user reputation leaderboard
CREATE OR REPLACE VIEW reputation_leaderboard AS
SELECT
  u.id,
  u.display_name,
  u.avatar_url,
  u.reputation_points,
  u.reputation_level,
  u.badges_count,
  COUNT(r.id) AS reviews_count,
  COUNT(g.id) AS groups_submitted_count,
  ROW_NUMBER() OVER (ORDER BY u.reputation_points DESC) AS rank
FROM
  users u
LEFT JOIN
  reviews r ON u.id = r.user_id
LEFT JOIN
  groups g ON u.id = g.submitted_by
GROUP BY
  u.id, u.display_name, u.avatar_url, u.reputation_points, u.reputation_level, u.badges_count
ORDER BY
  u.reputation_points DESC;

-- Insert some default badges
INSERT INTO badges (name, description, icon, level, points, category, requirements, display_order)
VALUES
  ('Newcomer', 'Welcome to the community!', 'badge-newcomer.svg', 1, 5, 'membership', '{"action": "join"}', 1),
  ('Group Finder', 'Submitted your first group', 'badge-group-finder.svg', 1, 10, 'contribution', '{"action": "submit_group", "count": 1}', 2),
  ('Group Guru', 'Submitted 5 groups', 'badge-group-guru.svg', 1, 25, 'contribution', '{"action": "submit_group", "count": 5}', 3),
  ('Group Expert', 'Submitted 25 groups', 'badge-group-expert.svg', 2, 100, 'contribution', '{"action": "submit_group", "count": 25}', 4),
  ('Group Master', 'Submitted 100 groups', 'badge-group-master.svg', 3, 500, 'contribution', '{"action": "submit_group", "count": 100}', 5),
  
  ('First Review', 'Wrote your first review', 'badge-first-review.svg', 1, 10, 'contribution', '{"action": "write_review", "count": 1}', 6),
  ('Reviewer', 'Wrote 5 reviews', 'badge-reviewer.svg', 1, 25, 'contribution', '{"action": "write_review", "count": 5}', 7),
  ('Expert Reviewer', 'Wrote 25 reviews', 'badge-expert-reviewer.svg', 2, 100, 'contribution', '{"action": "write_review", "count": 25}', 8),
  ('Master Reviewer', 'Wrote 100 reviews', 'badge-master-reviewer.svg', 3, 500, 'contribution', '{"action": "write_review", "count": 100}', 9),
  
  ('Helpful Voter', 'Cast 10 votes on groups', 'badge-helpful-voter.svg', 1, 15, 'engagement', '{"action": "vote", "count": 10}', 10),
  ('Active Voter', 'Cast 50 votes on groups', 'badge-active-voter.svg', 2, 50, 'engagement', '{"action": "vote", "count": 50}', 11),
  
  ('Quality Guardian', 'Reported your first inappropriate group', 'badge-quality-guardian.svg', 1, 5, 'moderation', '{"action": "report_group", "count": 1}', 12),
  ('Group Watcher', 'Reported 5 inappropriate groups', 'badge-group-watcher.svg', 2, 25, 'moderation', '{"action": "report_group", "count": 5}', 13),
  
  ('Profile Perfectionist', 'Completed your user profile', 'badge-profile-perfectionist.svg', 1, 5, 'profile', '{"action": "complete_profile"}', 14),
  
  ('Rising Star', 'Reached 100 reputation points', 'badge-rising-star.svg', 1, 0, 'reputation', '{"action": "reputation", "minimum": 100}', 15),
  ('Community Star', 'Reached 500 reputation points', 'badge-community-star.svg', 2, 0, 'reputation', '{"action": "reputation", "minimum": 500}', 16),
  ('Community Leader', 'Reached 1000 reputation points', 'badge-community-leader.svg', 3, 0, 'reputation', '{"action": "reputation", "minimum": 1000}', 17);
  
ON CONFLICT (id) DO NOTHING; 