-- Migration: Gamification System Tables
-- Cria tabelas para sistema de gamificação do FOOCUS

-- 1. Tabela de estatísticas do usuário
CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    daily_quests_completed INTEGER DEFAULT 0,
    total_habits_completed INTEGER DEFAULT 0,
    total_objectives_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Tabela de conquistas/badges
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    badge_description TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common'
);

-- 3. Histórico de XP
CREATE TABLE IF NOT EXISTS public.xp_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source TEXT NOT NULL, -- 'habit_completed', 'objective_completed', 'streak_bonus', etc
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Missões diárias
CREATE TABLE IF NOT EXISTS public.daily_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_type TEXT NOT NULL, -- 'complete_habits', 'complete_objectives', 'maintain_streak'
    target_count INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    xp_reward INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    quest_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own stats" ON public.user_stats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own achievements" ON public.achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own xp history" ON public.xp_history
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own daily quests" ON public.daily_quests
    FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default user stats for development user
INSERT INTO public.user_stats (user_id, total_xp, current_level)
VALUES ('00000000-0000-0000-0000-000000000000', 0, 1)
ON CONFLICT (user_id) DO NOTHING;
