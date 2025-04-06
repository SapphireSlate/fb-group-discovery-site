-- Create view for reputation leaderboard
CREATE OR REPLACE VIEW reputation_leaderboard AS
SELECT 
  u.id,
  u.username,
  u.first_name,
  u.last_name,
  u.avatar_url,
  u.reputation_points,
  u.reputation_level,
  u.badges_count,
  COUNT(DISTINCT g.id) AS groups_submitted,
  COUNT(DISTINCT r.id) AS reviews_written,
  COUNT(DISTINCT v.id) AS votes_cast,
  COUNT(DISTINCT ub.id) AS unique_badges,
  SUM(CASE WHEN rh.created_at > NOW() - INTERVAL '7 days' THEN rh.points ELSE 0 END) AS points_last_week,
  ROW_NUMBER() OVER (ORDER BY u.reputation_points DESC) AS rank
FROM 
  users u
LEFT JOIN 
  groups g ON u.id = g.submitted_by
LEFT JOIN 
  reviews r ON u.id = r.user_id
LEFT JOIN 
  votes v ON u.id = v.user_id
LEFT JOIN 
  user_badges ub ON u.id = ub.user_id
LEFT JOIN 
  reputation_history rh ON u.id = rh.user_id
GROUP BY 
  u.id, u.username, u.first_name, u.last_name, u.avatar_url, 
  u.reputation_points, u.reputation_level, u.badges_count
ORDER BY 
  u.reputation_points DESC;

-- Create a trigger to update the badges_count in users table
CREATE OR REPLACE FUNCTION update_user_badges_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users
    SET badges_count = badges_count + 1
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users
    SET badges_count = badges_count - 1
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_badges_count_trigger
AFTER INSERT OR DELETE ON user_badges
FOR EACH ROW
EXECUTE FUNCTION update_user_badges_count();

-- Create a trigger to update reputation points in users table
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users
    SET reputation_points = reputation_points + NEW.points
    WHERE id = NEW.user_id;
    
    -- Update reputation level based on points
    UPDATE users
    SET reputation_level = 
      CASE 
        WHEN reputation_points >= 10000 THEN 5
        WHEN reputation_points >= 5000 THEN 4
        WHEN reputation_points >= 1000 THEN 3
        WHEN reputation_points >= 500 THEN 2
        WHEN reputation_points >= 100 THEN 1
        ELSE 0
      END
    WHERE id = NEW.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_reputation_trigger
AFTER INSERT ON reputation_history
FOR EACH ROW
EXECUTE FUNCTION update_user_reputation(); 