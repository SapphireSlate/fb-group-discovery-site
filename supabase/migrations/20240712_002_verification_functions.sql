-- Create function to calculate verification times
CREATE OR REPLACE FUNCTION public.get_verification_times()
RETURNS TABLE (
    status text,
    avg_verification_hours numeric,
    min_verification_hours numeric,
    max_verification_hours numeric,
    verification_count bigint
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.verification_status,
        ROUND(AVG(EXTRACT(EPOCH FROM (g.verification_date - g.submitted_at)) / 3600)::numeric, 2) AS avg_verification_hours,
        ROUND(MIN(EXTRACT(EPOCH FROM (g.verification_date - g.submitted_at)) / 3600)::numeric, 2) AS min_verification_hours,
        ROUND(MAX(EXTRACT(EPOCH FROM (g.verification_date - g.submitted_at)) / 3600)::numeric, 2) AS max_verification_hours,
        COUNT(g.id) AS verification_count
    FROM 
        public.groups g
    WHERE 
        g.verification_date IS NOT NULL
        AND g.submitted_at IS NOT NULL
    GROUP BY 
        g.verification_status
    ORDER BY 
        verification_count DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_verification_times() TO authenticated; 