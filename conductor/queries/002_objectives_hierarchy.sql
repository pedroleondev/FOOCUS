-- ==========================================
-- MIGRATION: 002_objectives_hierarchy
-- Track: mobile_first_redesign_20260208
-- Description: Cria hierarquia de objetivos (objetivos → sub-objetivos → micro-tarefas)
-- ==========================================

-- Objetivos principais
CREATE TABLE IF NOT EXISTS objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
  due_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  xp_reward INTEGER DEFAULT 50,
  estimated_minutes INTEGER, -- tempo estimado para completar
  time_spent_minutes INTEGER DEFAULT 0, -- tempo real gasto
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sub-objetivos
CREATE TABLE IF NOT EXISTS sub_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID REFERENCES objectives ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  order_index INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 20,
  estimated_minutes INTEGER,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Micro-tarefas (menor nível)
CREATE TABLE IF NOT EXISTS micro_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sub_objective_id UUID REFERENCES sub_objectives ON DELETE CASCADE NOT NULL,
  objective_id UUID REFERENCES objectives ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_minutes INTEGER,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')) DEFAULT 'pending',
  assigned_date DATE, -- data atribuída (para distribuição automática)
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_reward INTEGER DEFAULT 5,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_objectives_user ON objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_objectives_user_status ON objectives(user_id, status);
CREATE INDEX IF NOT EXISTS idx_objectives_due_date ON objectives(due_date);
CREATE INDEX IF NOT EXISTS idx_objectives_priority ON objectives(user_id, priority);

CREATE INDEX IF NOT EXISTS idx_sub_objectives_objective ON sub_objectives(objective_id);
CREATE INDEX IF NOT EXISTS idx_sub_objectives_user ON sub_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_objectives_status ON sub_objectives(user_id, status);

CREATE INDEX IF NOT EXISTS idx_micro_tasks_sub_objective ON micro_tasks(sub_objective_id);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_objective ON micro_tasks(objective_id);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_user ON micro_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_assigned_date ON micro_tasks(assigned_date);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_status ON micro_tasks(user_id, status);

-- Row Level Security (RLS)
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can only manage their own objectives"
  ON objectives FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only manage their own sub_objectives"
  ON sub_objectives FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only manage their own micro_tasks"
  ON micro_tasks FOR ALL
  USING (user_id = auth.uid());

-- Função para atualizar progresso do objetivo pai
CREATE OR REPLACE FUNCTION update_objective_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_micro_tasks INTEGER;
  completed_micro_tasks INTEGER;
  sub_objective_progress DECIMAL;
  objective_progress DECIMAL;
BEGIN
  -- Se foi uma micro-task atualizada
  IF TG_TABLE_NAME = 'micro_tasks' THEN
    -- Calcular progresso do sub-objetivo
    SELECT 
      COUNT(*),
      COUNT(CASE WHEN status = 'completed' THEN 1 END)
    INTO total_micro_tasks, completed_micro_tasks
    FROM micro_tasks
    WHERE sub_objective_id = NEW.sub_objective_id;
    
    IF total_micro_tasks > 0 THEN
      sub_objective_progress := (completed_micro_tasks::DECIMAL / total_micro_tasks) * 100;
      
      UPDATE sub_objectives
      SET 
        status = CASE 
          WHEN completed_micro_tasks = total_micro_tasks THEN 'completed'
          WHEN completed_micro_tasks > 0 THEN 'in_progress'
          ELSE 'pending'
        END,
        updated_at = NOW()
      WHERE id = NEW.sub_objective_id;
    END IF;
    
    -- Atualizar progresso do objetivo principal
    SELECT COALESCE(AVG(
      CASE 
        WHEN so.status = 'completed' THEN 100
        WHEN so.status = 'in_progress' THEN 50
        ELSE 0
      END
    ), 0) INTO objective_progress
    FROM sub_objectives so
    WHERE so.objective_id = NEW.objective_id;
    
    UPDATE objectives
    SET 
      progress_percentage = ROUND(objective_progress),
      status = CASE 
        WHEN objective_progress = 100 THEN 'completed'
        WHEN objective_progress > 0 THEN 'active'
        ELSE 'active'
      END,
      updated_at = NOW()
    WHERE id = NEW.objective_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para atualização automática de progresso
DROP TRIGGER IF EXISTS on_micro_task_updated ON micro_tasks;
CREATE TRIGGER on_micro_task_updated
  AFTER UPDATE ON micro_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_objective_progress();

-- Função para completar objetivo e dar XP
CREATE OR REPLACE FUNCTION complete_objective(objective_uuid UUID)
RETURNS VOID AS $$
DECLARE
  obj_record objectives%ROWTYPE;
BEGIN
  SELECT * INTO obj_record FROM objectives WHERE id = objective_uuid;
  
  -- Marcar como completo
  UPDATE objectives
  SET 
    status = 'completed',
    progress_percentage = 100,
    updated_at = NOW()
  WHERE id = objective_uuid;
  
  -- Dar XP
  PERFORM add_xp(
    obj_record.user_id,
    obj_record.xp_reward,
    'objective_completed',
    'Objetivo completado: ' || obj_record.title
  );
  
  -- Atualizar estatísticas
  UPDATE user_stats
  SET total_objectives_completed = total_objectives_completed + 1
  WHERE id = obj_record.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para completar micro-task
CREATE OR REPLACE FUNCTION complete_micro_task(task_uuid UUID)
RETURNS VOID AS $$
DECLARE
  task_record micro_tasks%ROWTYPE;
BEGIN
  SELECT * INTO task_record FROM micro_tasks WHERE id = task_uuid;
  
  UPDATE micro_tasks
  SET 
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = task_uuid;
  
  -- Dar XP
  PERFORM add_xp(
    task_record.user_id,
    task_record.xp_reward,
    'micro_task_completed',
    'Tarefa completada: ' || task_record.title
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE objectives IS 'Objetivos principais do usuário';
COMMENT ON TABLE sub_objectives IS 'Sub-objetivos que compõem um objetivo principal';
COMMENT ON TABLE micro_tasks IS 'Micro-tarefas executáveis dentro de sub-objetivos';
