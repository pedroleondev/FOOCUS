-- Migration: Remove FK constraints for development mode (RLS disabled)
-- This allows inserts with any user_id when authentication is disabled

-- Remove FK constraints to allow development without auth
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_user_id_fkey;
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_user_id_fkey;
ALTER TABLE daily_routines DROP CONSTRAINT IF EXISTS daily_routines_user_id_fkey;

-- Note: To restore FK constraints in production, run:
-- ALTER TABLE tasks ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE habits ADD CONSTRAINT habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE goals ADD CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE daily_routines ADD CONSTRAINT daily_routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
