-- Drop the existing function to avoid return type conflicts
DROP FUNCTION IF EXISTS get_user_tickets();

-- Create a function to get tickets for the currently authenticated user
CREATE OR REPLACE FUNCTION get_user_tickets()
RETURNS TABLE (
  id UUID,
  ticket_id TEXT,
  ticket_type TEXT,
  subject TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  comment_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.ticket_id,
    t.ticket_type,
    t.subject,
    t.description,
    t.status,
    t.priority,
    t.created_at,
    t.updated_at,
    (SELECT COUNT(*) FROM support_ticket_comments c WHERE c.ticket_id = t.id AND c.is_internal = FALSE) as comment_count
  FROM
    support_tickets t
  WHERE
    t.user_id = auth.uid()
  ORDER BY
    t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_tickets() TO authenticated;
