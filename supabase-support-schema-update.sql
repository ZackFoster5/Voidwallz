-- Add admin role column to profiles (if you have a profiles table)
-- Or we can use user_metadata in auth.users for admin role

-- Create support_ticket_attachments table for file uploads
CREATE TABLE IF NOT EXISTS support_ticket_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for attachments
CREATE INDEX IF NOT EXISTS idx_support_ticket_attachments_ticket_id ON support_ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_attachments_uploaded_by ON support_ticket_attachments(uploaded_by);

-- Create support_ticket_comments table for admin-user communication
CREATE TABLE IF NOT EXISTS support_ticket_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  comment TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes only visible to admins
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_ticket_id ON support_ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_user_id ON support_ticket_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_created_at ON support_ticket_comments(created_at DESC);

-- Enable RLS on new tables
ALTER TABLE support_ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attachments
CREATE POLICY "Users can view attachments for their tickets" ON support_ticket_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_ticket_attachments.ticket_id
      AND (support_tickets.user_id = auth.uid() OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'))
    )
  );

CREATE POLICY "Users can upload attachments to their tickets" ON support_ticket_attachments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND (support_tickets.user_id = auth.uid() OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'))
    )
  );

CREATE POLICY "Users can delete their own attachments" ON support_ticket_attachments
  FOR DELETE
  USING (uploaded_by = auth.uid());

-- RLS Policies for comments
CREATE POLICY "Users can view comments on their tickets" ON support_ticket_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_ticket_comments.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "Users can add comments to their tickets" ON support_ticket_comments
  FOR INSERT
  WITH CHECK (
    (user_id = auth.uid() AND is_admin = FALSE AND is_internal = FALSE)
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "Users can update their own comments" ON support_ticket_comments
  FOR UPDATE
  USING (user_id = auth.uid() OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Create trigger for comments updated_at
CREATE OR REPLACE FUNCTION update_support_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_support_comment_updated_at
  BEFORE UPDATE ON support_ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_support_comment_updated_at();

-- Update support_tickets RLS policies to allow admins full access
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
CREATE POLICY "Users can view their own tickets or admins can view all" ON support_tickets
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IS NULL
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );

DROP POLICY IF EXISTS "Users can update their own tickets" ON support_tickets;
CREATE POLICY "Users can update their own tickets or admins can update all" ON support_tickets
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );

-- Create admin-only policy for updating ticket status
CREATE POLICY "Admins can update any ticket" ON support_tickets
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Create a helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'role' = 'admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Create view for admin ticket dashboard
CREATE OR REPLACE VIEW admin_ticket_dashboard AS
SELECT
  t.id,
  t.user_email,
  t.user_name,
  t.ticket_type,
  t.subject,
  t.description,
  t.status,
  t.priority,
  t.created_at,
  t.updated_at,
  t.resolved_at,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT a.id) as attachment_count,
  EXTRACT(EPOCH FROM (COALESCE(t.resolved_at, NOW()) - t.created_at)) as time_to_resolve_seconds
FROM support_tickets t
LEFT JOIN support_ticket_comments c ON c.ticket_id = t.id
LEFT JOIN support_ticket_attachments a ON a.ticket_id = t.id
GROUP BY t.id, t.user_email, t.user_name, t.ticket_type, t.subject, t.description, t.status, t.priority, t.created_at, t.updated_at, t.resolved_at;

-- Grant access to the admin dashboard view
GRANT SELECT ON admin_ticket_dashboard TO authenticated;

-- Create view for user ticket history
CREATE OR REPLACE VIEW user_ticket_history AS
SELECT
  t.id,
  t.ticket_type,
  t.subject,
  t.description,
  t.status,
  t.priority,
  t.created_at,
  t.updated_at,
  t.resolved_at,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT a.id) as attachment_count
FROM support_tickets t
LEFT JOIN support_ticket_comments c ON c.ticket_id = t.id AND c.is_internal = FALSE
LEFT JOIN support_ticket_attachments a ON a.ticket_id = t.id
WHERE t.user_id = auth.uid()
GROUP BY t.id, t.ticket_type, t.subject, t.description, t.status, t.priority, t.created_at, t.updated_at, t.resolved_at
ORDER BY t.created_at DESC;

-- Grant access to the user history view
GRANT SELECT ON user_ticket_history TO authenticated;

-- Create storage bucket for ticket attachments (if not exists)
-- Run this in Supabase Storage UI or via API:
-- Bucket name: 'support-attachments'
-- Public: false
-- File size limit: 5MB
-- Allowed MIME types: image/*, application/pdf, text/plain

-- Note: To make a user an admin, run:
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(
--   COALESCE(raw_user_meta_data, '{}'::jsonb),
--   '{role}',
--   '"admin"'
-- )
-- WHERE email = 'your-admin-email@example.com';
