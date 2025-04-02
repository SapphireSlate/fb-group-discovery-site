-- Additional Row Level Security policies

-- Votes policies (these were missing in the original schema)
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add votes"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users));

CREATE POLICY "Users can modify their own votes"
  ON votes FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can delete their own votes"
  ON votes FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Reviews additional policies for update/delete
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Groups policy for delete
CREATE POLICY "Users can delete their own groups"
  ON groups FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = submitted_by));

-- Make sure admin users can manage all content
CREATE POLICY "Admins can manage all content"
  ON groups FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all votes"
  ON votes FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all categories"
  ON categories FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all tags"
  ON tags FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin'); 