-- Migration: Create habit_checkins table for daily tracking
-- This enables proper streak calculation and XP rewards

CREATE TABLE IF NOT EXISTS public.habit_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    checkin_date DATE NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    xp_earned INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(habit_id, checkin_date)
);

-- Enable RLS
ALTER TABLE public.habit_checkins ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage their own checkins" ON public.habit_checkins
    FOR ALL USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_habit_checkins_user_date 
    ON public.habit_checkins(user_id, checkin_date);

CREATE INDEX IF NOT EXISTS idx_habit_checkins_habit 
    ON public.habit_checkins(habit_id);
