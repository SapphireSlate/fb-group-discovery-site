-- This migration creates the email_preferences table
-- to store user preferences for email notifications

-- Create the email_preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  welcome_email BOOLEAN NOT NULL DEFAULT TRUE,
  group_approved BOOLEAN NOT NULL DEFAULT TRUE,
  new_review BOOLEAN NOT NULL DEFAULT TRUE,
  reputation_milestone BOOLEAN NOT NULL DEFAULT TRUE,
  new_badge BOOLEAN NOT NULL DEFAULT TRUE,
  new_report BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view their own email preferences
CREATE POLICY "Users can view their own email preferences"
  ON email_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own email preferences
CREATE POLICY "Users can update their own email preferences"
  ON email_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to insert their own email preferences
CREATE POLICY "Users can insert their own email preferences"
  ON email_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to manage all email preferences
CREATE POLICY "Service role can manage all email preferences"
  ON email_preferences
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER set_email_preferences_updated_at
BEFORE UPDATE ON email_preferences
FOR EACH ROW
EXECUTE FUNCTION update_email_preferences_updated_at();

-- Create a function to handle new user registration and create default email preferences
CREATE OR REPLACE FUNCTION handle_new_user_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically create default email preferences for new users
CREATE TRIGGER on_auth_user_created_email_prefs
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_email_preferences(); 