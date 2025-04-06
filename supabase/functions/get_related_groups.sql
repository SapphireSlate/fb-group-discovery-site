-- Function to get related groups ordered by relevance score
-- This function finds groups related to a given group based on:
-- 1. Shared tags (highest weight)
-- 2. Same category (medium weight)
-- 3. Similar rating range (lowest weight)

CREATE OR REPLACE FUNCTION get_related_groups(
  p_group_id UUID,                -- Target group ID
  p_category_id UUID,             -- Target group's category ID
  p_tag_ids UUID[],               -- Array of tag IDs from the target group
  p_min_rating NUMERIC DEFAULT 0, -- Minimum rating threshold
  p_max_rating NUMERIC DEFAULT 5, -- Maximum rating threshold
  p_limit INT DEFAULT 5           -- Number of results to return
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  url TEXT,
  screenshot_url TEXT,
  average_rating NUMERIC,
  category_id UUID,
  category_name TEXT,
  tags JSONB,
  relevance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH 
  -- Count shared tags for each group
  tag_matches AS (
    SELECT 
      gt.group_id,
      COUNT(*) AS shared_tag_count
    FROM 
      groups_tags gt
    WHERE 
      gt.tag_id = ANY(p_tag_ids)
      AND gt.group_id != p_group_id
    GROUP BY 
      gt.group_id
  ),
  -- Calculate relevance score and get group details
  scored_groups AS (
    SELECT
      g.id,
      g.name,
      g.description,
      g.url,
      g.screenshot_url,
      g.average_rating,
      g.category_id,
      c.name AS category_name,
      -- Calculate relevance score:
      -- 3 points for each shared tag
      -- 2 points for same category
      -- 1 point for similar rating (within range)
      COALESCE(tm.shared_tag_count, 0) * 3 +
      CASE WHEN g.category_id = p_category_id THEN 2 ELSE 0 END +
      CASE WHEN g.average_rating BETWEEN p_min_rating AND p_max_rating THEN 1 ELSE 0 END
      AS relevance_score,
      -- For ordering by most recently added when scores are equal
      g.created_at
    FROM
      groups g
    LEFT JOIN
      categories c ON g.category_id = c.id
    LEFT JOIN
      tag_matches tm ON g.id = tm.group_id
    WHERE
      g.id != p_group_id
      -- Must have at least one matching criterion (shared tag, same category, or similar rating)
      AND (
        tm.group_id IS NOT NULL
        OR g.category_id = p_category_id
        OR g.average_rating BETWEEN p_min_rating AND p_max_rating
      )
      -- Only include active/approved groups
      AND g.status = 'active'
  ),
  -- Get tag information for each group
  group_tags AS (
    SELECT
      gt.group_id,
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'name', t.name
        )
      ) AS tags
    FROM
      groups_tags gt
    JOIN
      tags t ON gt.tag_id = t.id
    WHERE
      gt.group_id IN (SELECT id FROM scored_groups)
    GROUP BY
      gt.group_id
  )
  -- Final query with all information
  SELECT
    sg.id,
    sg.name,
    sg.description,
    sg.url,
    sg.screenshot_url,
    sg.average_rating,
    sg.category_id,
    sg.category_name,
    COALESCE(gt.tags, '[]'::jsonb) AS tags,
    sg.relevance_score
  FROM
    scored_groups sg
  LEFT JOIN
    group_tags gt ON sg.id = gt.group_id
  WHERE
    sg.relevance_score > 0  -- Must have at least some relevance
  ORDER BY
    sg.relevance_score DESC, -- Most relevant first
    sg.created_at DESC       -- Then most recent
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql; 