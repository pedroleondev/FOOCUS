-- Migration: Objectives Hierarchy System
-- Cria tabelas para objetivos, sub-objetivos e micro-tarefas

-- 1. Objetivos principais
CREATE TABLE IF NOT EXISTS public.objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
    due_date DATE,
    progress_percentage INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sub-objetivos
CREATE TABLE IF NOT EXISTS public.sub_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    order_index INTEGER,
    xp_reward INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Micro-tarefas (menor nível)
CREATE TABLE IF NOT EXISTS public.micro_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_objective_id UUID NOT NULL REFERENCES public.sub_objectives(id) ON DELETE CASCADE,
    objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    estimated_minutes INTEGER,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')) DEFAULT 'pending',
    assigned_date DATE,
    completed_at TIMESTAMPTZ,
    xp_reward INTEGER DEFAULT 5,
    order_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own objectives" ON public.objectives
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sub_objectives" ON public.sub_objectives
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM public.objectives WHERE id = sub_objectives.objective_id
    ));

CREATE POLICY "Users can manage their own micro_tasks" ON public.micro_tasks
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM public.objectives WHERE id = micro_tasks.objective_id
    ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_objectives_updated_at ON public.objectives;
CREATE TRIGGER update_objectives_updated_at
    BEFORE UPDATE ON public.objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_objectives_user_status ON public.objectives(user_id, status);
CREATE INDEX IF NOT EXISTS idx_sub_objectives_objective ON public.sub_objectives(objective_id);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_sub_objective ON public.micro_tasks(sub_objective_id);
