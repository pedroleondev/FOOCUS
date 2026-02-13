-- Create tables for FOOCUS

-- 1. Goals
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline DATE,
    metric TEXT NOT NULL,
    current_value NUMERIC DEFAULT 0,
    target_value NUMERIC NOT NULL,
    category TEXT,
    status TEXT CHECK (status IN ('on-track', 'delayed', 'completed')) DEFAULT 'on-track',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habits
CREATE TABLE public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    goal_description TEXT,
    icon TEXT,
    color TEXT,
    frequency TEXT[] DEFAULT '{}', -- ['D', 'S', 'T'...]
    preferred_time TIME,
    reminders_enabled BOOLEAN DEFAULT FALSE,
    streak_goal INTEGER DEFAULT 21,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    history JSONB DEFAULT '[]', -- Array of booleans or dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tasks
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Daily Routines
CREATE TABLE public.daily_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    time_start TIME NOT NULL,
    title TEXT NOT NULL,
    duration TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_routines ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own habits" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own daily routines" ON public.daily_routines
    FOR ALL USING (auth.uid() = user_id);
