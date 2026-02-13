-- Migration: Add development user support for RLS disabled mode
-- This migration creates a development user that can be used when auth is disabled

-- Insert a development user into auth.users if not exists
-- Note: This requires admin access to the Supabase project
-- For local development, you may need to run this manually in the Supabase dashboard

-- Alternative approach: Create a function to bypass FK check for development
CREATE OR REPLACE FUNCTION check_user_exists()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow the special development UUID
  IF NEW.user_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
    RETURN NEW;
  END IF;
  
  -- Check if user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
    RAISE EXCEPTION 'User % does not exist in auth.users', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist (for idempotency)
DROP TRIGGER IF EXISTS check_user_exists_tasks ON tasks;
DROP TRIGGER IF EXISTS check_user_exists_habits ON habits;
DROP TRIGGER IF EXISTS check_user_exists_goals ON goals;
DROP TRIGGER IF EXISTS check_user_exists_daily_routines ON daily_routines;

-- Create triggers that use the function
CREATE TRIGGER check_user_exists_tasks
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION check_user_exists();

CREATE TRIGGER check_user_exists_habits
  BEFORE INSERT OR UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION check_user_exists();

CREATE TRIGGER check_user_exists_goals
  BEFORE INSERT OR UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION check_user_exists();

CREATE TRIGGER check_user_exists_daily_routines
  BEFORE INSERT OR UPDATE ON daily_routines
  FOR EACH ROW EXECUTE FUNCTION check_user_exists();
