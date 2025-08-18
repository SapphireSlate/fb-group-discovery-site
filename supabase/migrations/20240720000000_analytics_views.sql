-- Create views and functions for advanced analytics

-- 1. Group growth trends - tracks group metrics over time
CREATE OR REPLACE VIEW public.group_growth_analytics AS
SELECT
    DATE_TRUNC('day', g.submitted_at)::DATE AS date,
    COUNT(g.id) AS new_groups,
    SUM(g.view_count) AS total_views,
    ROUND(AVG(g.average_rating), 2) AS avg_rating,
    SUM(g.upvotes) AS total_upvotes,
    SUM(g.downvotes) AS total_downvotes,
    COUNT(CASE WHEN g.verification_status = 'verified' THEN 1 END) AS verified_groups
FROM
    public.groups g
GROUP BY
    DATE_TRUNC('day', g.submitted_at)::DATE
ORDER BY
    date;

-- 2. Category popularity analytics
CREATE OR REPLACE VIEW public.category_analytics AS
SELECT
    c.id AS category_id,
    c.name AS category_name,
    COUNT(g.id) AS group_count,
    SUM(g.view_count) AS total_views,
    ROUND(AVG(g.average_rating), 2) AS avg_rating,
    SUM(g.upvotes) AS total_upvotes,
    SUM(g.downvotes) AS total_downvotes,
    COUNT(DISTINCT g.submitted_by) AS unique_contributors,
    COUNT(CASE WHEN g.verification_status = 'verified' THEN 1 END) AS verified_groups
FROM
    public.categories c
LEFT JOIN
    public.groups g ON c.id = g.category_id
GROUP BY
    c.id, c.name
ORDER BY
    group_count DESC;

-- 3. User engagement analytics
CREATE OR REPLACE VIEW public.user_engagement_analytics AS
SELECT
    DATE_TRUNC('day', u.created_at)::DATE AS date,
    COUNT(u.id) AS new_users,
    COUNT(DISTINCT g.id) AS groups_submitted,
    COUNT(DISTINCT r.id) AS reviews_submitted,
    COUNT(DISTINCT (v.user_id, v.group_id)) AS votes_cast,
    ROUND(COUNT(DISTINCT r.id)::NUMERIC / NULLIF(COUNT(DISTINCT u.id), 0), 2) AS reviews_per_user,
    ROUND(COUNT(DISTINCT (v.user_id, v.group_id))::NUMERIC / NULLIF(COUNT(DISTINCT u.id), 0), 2) AS votes_per_user
FROM
    public.users u
LEFT JOIN
    public.groups g ON u.id = g.submitted_by
LEFT JOIN
    public.reviews r ON u.id = r.user_id
LEFT JOIN
    public.votes v ON u.id = v.user_id
GROUP BY
    DATE_TRUNC('day', u.created_at)::DATE
ORDER BY
    date;

-- 4. Tag popularity analytics
CREATE OR REPLACE VIEW public.tag_analytics AS
SELECT
    t.id AS tag_id,
    t.name AS tag_name,
    COUNT(gt.group_id) AS group_count,
    SUM(g.view_count) AS total_views,
    ROUND(AVG(g.average_rating), 2) AS avg_rating,
    ROUND(SUM(g.upvotes - g.downvotes)::NUMERIC / NULLIF(COUNT(gt.group_id), 0), 2) AS avg_net_votes
FROM
    public.tags t
LEFT JOIN
    public.groups_tags gt ON t.id = gt.tag_id
LEFT JOIN
    public.groups g ON gt.group_id = g.id
GROUP BY
    t.id, t.name
ORDER BY
    group_count DESC;

-- 5. Review sentiment analytics (basic)
CREATE OR REPLACE VIEW public.review_analytics AS
SELECT
    DATE_TRUNC('day', r.created_at)::DATE AS date,
    COUNT(r.id) AS review_count,
    ROUND(AVG(r.rating), 2) AS avg_rating,
    COUNT(CASE WHEN r.rating >= 4 THEN 1 END) AS positive_reviews,
    COUNT(CASE WHEN r.rating <= 2 THEN 1 END) AS negative_reviews,
    COUNT(CASE WHEN r.rating = 3 THEN 1 END) AS neutral_reviews,
    ROUND(COUNT(CASE WHEN r.rating >= 4 THEN 1 END)::NUMERIC / NULLIF(COUNT(r.id), 0) * 100, 2) AS positive_percentage
FROM
    public.reviews r
GROUP BY
    DATE_TRUNC('day', r.created_at)::DATE
ORDER BY
    date;

-- 6. Overall platform analytics function
CREATE OR REPLACE FUNCTION public.get_platform_analytics(
    p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    metric TEXT,
    value NUMERIC,
    change_percentage NUMERIC
) 
LANGUAGE plpgsql
AS $$
DECLARE
    current_start_date DATE;
    previous_start_date DATE;
BEGIN
    current_start_date := CURRENT_DATE - p_days_back * INTERVAL '1 day';
    previous_start_date := current_start_date - p_days_back * INTERVAL '1 day';
    
    RETURN QUERY
    
    -- Total users
    SELECT 
        'total_users'::TEXT AS metric,
        COUNT(id)::NUMERIC AS value,
        ROUND((COUNT(id) - 
               (SELECT COUNT(id) FROM public.users WHERE created_at < current_start_date)
              )::NUMERIC / 
              NULLIF((SELECT COUNT(id) FROM public.users WHERE created_at < current_start_date), 0) * 100, 2) AS change_percentage
    FROM public.users
    
    UNION ALL
    
    -- Total groups
    SELECT 
        'total_groups'::TEXT AS metric,
        COUNT(id)::NUMERIC AS value,
        ROUND((COUNT(id) - 
               (SELECT COUNT(id) FROM public.groups WHERE submitted_at < current_start_date)
              )::NUMERIC / 
              NULLIF((SELECT COUNT(id) FROM public.groups WHERE submitted_at < current_start_date), 0) * 100, 2) AS change_percentage
    FROM public.groups
    
    UNION ALL
    
    -- Total reviews
    SELECT 
        'total_reviews'::TEXT AS metric,
        COUNT(id)::NUMERIC AS value,
        ROUND((COUNT(id) - 
               (SELECT COUNT(id) FROM public.reviews WHERE created_at < current_start_date)
              )::NUMERIC / 
              NULLIF((SELECT COUNT(id) FROM public.reviews WHERE created_at < current_start_date), 0) * 100, 2) AS change_percentage
    FROM public.reviews
    
    UNION ALL
    
    -- Average rating
    SELECT 
        'average_rating'::TEXT AS metric,
        ROUND(AVG(average_rating), 2) AS value,
        ROUND((AVG(average_rating) - 
               (SELECT AVG(average_rating) FROM public.groups WHERE submitted_at < current_start_date)
              ) / 
              NULLIF((SELECT AVG(average_rating) FROM public.groups WHERE submitted_at < current_start_date), 0) * 100, 2) AS change_percentage
    FROM public.groups
    
    UNION ALL
    
    -- Active users (users who created content in the last p_days_back days)
    SELECT 
        'active_users'::TEXT AS metric,
        COUNT(DISTINCT u.id)::NUMERIC AS value,
        ROUND((COUNT(DISTINCT u.id) - 
               (SELECT COUNT(DISTINCT u.id) 
                FROM public.users u
                LEFT JOIN public.groups g ON u.id = g.submitted_by
                LEFT JOIN public.reviews r ON u.id = r.user_id
                LEFT JOIN public.votes v ON u.id = v.user_id
                WHERE (g.submitted_at BETWEEN previous_start_date AND current_start_date)
                   OR (r.created_at BETWEEN previous_start_date AND current_start_date)
                   OR (v.created_at BETWEEN previous_start_date AND current_start_date))
              )::NUMERIC / 
              NULLIF((SELECT COUNT(DISTINCT u.id) 
                     FROM public.users u
                     LEFT JOIN public.groups g ON u.id = g.submitted_by
                     LEFT JOIN public.reviews r ON u.id = r.user_id
                     LEFT JOIN public.votes v ON u.id = v.user_id
                     WHERE (g.submitted_at BETWEEN previous_start_date AND current_start_date)
                        OR (r.created_at BETWEEN previous_start_date AND current_start_date)
                        OR (v.created_at BETWEEN previous_start_date AND current_start_date)), 0) * 100, 2) AS change_percentage
    FROM public.users u
    LEFT JOIN public.groups g ON u.id = g.submitted_by
    LEFT JOIN public.reviews r ON u.id = r.user_id
    LEFT JOIN public.votes v ON u.id = v.user_id
    WHERE (g.submitted_at BETWEEN current_start_date AND CURRENT_DATE)
       OR (r.created_at BETWEEN current_start_date AND CURRENT_DATE)
       OR (v.created_at BETWEEN current_start_date AND CURRENT_DATE);
END;
$$;

-- 7. Analytics for trending groups
CREATE OR REPLACE FUNCTION public.get_trending_groups(
    p_days_back INTEGER DEFAULT 7,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    group_id UUID,
    group_name TEXT,
    view_count INTEGER,
    view_growth_percentage NUMERIC,
    upvotes INTEGER,
    downvotes INTEGER,
    vote_growth_percentage NUMERIC,
    review_count BIGINT,
    review_growth_percentage NUMERIC,
    trend_score NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH current_stats AS (
        SELECT 
            g.id,
            g.name,
            g.view_count,
            g.upvotes,
            g.downvotes,
            COUNT(r.id) AS review_count,
            -- Use view_count as base for trend score, plus weighted recent activity
            g.view_count + (g.upvotes - g.downvotes) * 2 + COUNT(r.id) * 3 AS base_score
        FROM 
            public.groups g
        LEFT JOIN 
            public.reviews r ON g.id = r.group_id AND r.created_at > CURRENT_DATE - p_days_back * INTERVAL '1 day'
        GROUP BY 
            g.id, g.name
    ),
    previous_stats AS (
        SELECT 
            g.id,
            COALESCE(g.view_count, 0) AS old_view_count,
            COALESCE(g.upvotes, 0) - COALESCE(g.downvotes, 0) AS old_net_votes,
            COUNT(r.id) AS old_review_count
        FROM 
            public.groups g
        LEFT JOIN 
            public.reviews r ON g.id = r.group_id AND r.created_at BETWEEN 
                CURRENT_DATE - (p_days_back * 2) * INTERVAL '1 day' AND 
                CURRENT_DATE - p_days_back * INTERVAL '1 day'
        GROUP BY 
            g.id
    )
    SELECT 
        cs.id AS group_id,
        cs.name AS group_name,
        cs.view_count,
        CASE 
            WHEN ps.old_view_count = 0 THEN 100
            ELSE ROUND((cs.view_count - ps.old_view_count)::NUMERIC / NULLIF(ps.old_view_count, 0) * 100, 2)
        END AS view_growth_percentage,
        cs.upvotes,
        cs.downvotes,
        CASE 
            WHEN ps.old_net_votes = 0 THEN 100
            ELSE ROUND(((cs.upvotes - cs.downvotes) - ps.old_net_votes)::NUMERIC / NULLIF(ABS(ps.old_net_votes), 0) * 100, 2)
        END AS vote_growth_percentage,
        cs.review_count,
        CASE 
            WHEN ps.old_review_count = 0 THEN 100
            ELSE ROUND((cs.review_count - ps.old_review_count)::NUMERIC / NULLIF(ps.old_review_count, 0) * 100, 2)
        END AS review_growth_percentage,
        -- Trend score is weighted based on growth percentages and base engagement
        ROUND(cs.base_score * (1 + 
            CASE WHEN (cs.view_count - ps.old_view_count) < 0 THEN 0 ELSE (cs.view_count - ps.old_view_count) END / 100.0 +
            CASE WHEN ((cs.upvotes - cs.downvotes) - ps.old_net_votes) < 0 THEN 0 ELSE ((cs.upvotes - cs.downvotes) - ps.old_net_votes) END / 10.0 +
            CASE WHEN (cs.review_count - ps.old_review_count) < 0 THEN 0 ELSE (cs.review_count - ps.old_review_count) END / 5.0
        ), 2) AS trend_score
    FROM 
        current_stats cs
    LEFT JOIN 
        previous_stats ps ON cs.id = ps.id
    ORDER BY 
        trend_score DESC
    LIMIT p_limit;
END;
$$;

-- Grant permissions for authenticated users
GRANT EXECUTE ON FUNCTION public.get_platform_analytics(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_groups(INTEGER, INTEGER) TO authenticated;
GRANT SELECT ON public.group_growth_analytics TO authenticated;
GRANT SELECT ON public.category_analytics TO authenticated;
GRANT SELECT ON public.user_engagement_analytics TO authenticated;
GRANT SELECT ON public.tag_analytics TO authenticated;
GRANT SELECT ON public.review_analytics TO authenticated; 