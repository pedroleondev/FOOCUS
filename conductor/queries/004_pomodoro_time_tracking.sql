-- ==========================================
-- MIGRATION: 004_pomodoro_time_tracking
-- Track: pomodoro_time_tracking_20260208
-- Description: Sistema de Pomodoro e tracking de tempo
-- ==========================================

-- Tabela de sessões Pomodoro
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Associação com tarefas (opcional)
  task_id UUID REFERENCES micro_tasks,
  objective_id UUID REFERENCES objectives,
  sub_objective_id UUID REFERENCES sub_objectives,
  
  -- Timer info
  mode TEXT CHECK (mode IN ('work', 'short_break', 'long_break')) NOT NULL,
  planned_duration INTEGER NOT NULL, -- em segundos
  actual_duration INTEGER, -- em segundos (pode ser menor se interrompido)
  
  -- Session status
  status TEXT CHECK (status IN ('in_progress', 'completed', 'cancelled', 'paused')) DEFAULT 'in_progress',
  completed BOOLEAN DEFAULT FALSE,
  
  -- Metrics
  pause_count INTEGER DEFAULT 0,
  pause_duration INTEGER DEFAULT 0, -- tempo total em pausa (segundos)
  distraction_count INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Context
  notes TEXT,
  xp_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de time entries (para tracking contínuo além de Pomodoro)
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  task_id UUID REFERENCES micro_tasks,
  objective_id UUID REFERENCES objectives,
  pomodoro_session_id UUID REFERENCES pomodoro_sessions,
  
  -- Time tracking
  description TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER, -- calculado automaticamente
  
  -- Categorization
  entry_type TEXT CHECK (entry_type IN ('pomodoro', 'manual', 'automatic')) DEFAULT 'pomodoro',
  billable BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estatísticas de produtividade (cache)
CREATE TABLE IF NOT EXISTS productivity_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Date period
  stat_date DATE NOT NULL,
  period_type TEXT CHECK (period_type IN ('daily', 'weekly', 'monthly')) NOT NULL,
  
  -- Pomodoro metrics
  total_pomodoros INTEGER DEFAULT 0,
  completed_pomodoros INTEGER DEFAULT 0,
  cancelled_pomodoros INTEGER DEFAULT 0,
  total_focus_minutes INTEGER DEFAULT 0,
  
  -- Break metrics
  total_breaks INTEGER DEFAULT 0,
  total_break_minutes INTEGER DEFAULT 0,
  
  -- Efficiency
  completion_rate DECIMAL(5,2) DEFAULT 0, -- porcentagem
  average_pomodoro_duration INTEGER, -- em minutos
  
  -- Procrastination detection
  procrastination_score INTEGER DEFAULT 0, -- 0-100
  distraction_count INTEGER DEFAULT 0,
  pause_count INTEGER DEFAULT 0,
  
  -- Streak
  current_streak INTEGER DEFAULT 0,
  is_productive_day BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, stat_date, period_type)
);

-- Tabela de configurações do Pomodoro por usuário
CREATE TABLE IF NOT EXISTS pomodoro_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  
  -- Durações (em segundos)
  work_duration INTEGER DEFAULT 1500, -- 25 min
  short_break_duration INTEGER DEFAULT 300, -- 5 min
  long_break_duration INTEGER DEFAULT 900, -- 15 min
  pomodoros_until_long_break INTEGER DEFAULT 4,
  
  -- Comportamento
  auto_start_breaks BOOLEAN DEFAULT FALSE,
  auto_start_pomodoros BOOLEAN DEFAULT FALSE,
  
  -- Notificações
  sound_enabled BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  
  -- Alertas
  alert_before_end INTEGER DEFAULT 0, -- segundos antes (0 = desligado)
  
  -- Visual
  show_timer_in_title BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task ON pomodoro_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_objective ON pomodoro_sessions(objective_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_started ON pomodoro_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_started ON pomodoro_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_completed ON pomodoro_sessions(user_id, completed, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_started ON time_entries(started_at);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_started ON time_entries(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_productivity_stats_user ON productivity_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_stats_date ON productivity_stats(stat_date);
CREATE INDEX IF NOT EXISTS idx_productivity_stats_user_date ON productivity_stats(user_id, stat_date DESC);

-- Row Level Security
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage their own pomodoro sessions"
  ON pomodoro_sessions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only manage their own time entries"
  ON time_entries FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only see their own productivity stats"
  ON productivity_stats FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only manage their own pomodoro config"
  ON pomodoro_configs FOR ALL
  USING (user_id = auth.uid());

-- Função para completar sessão Pomodoro
CREATE OR REPLACE FUNCTION complete_pomodoro_session(session_uuid UUID)
RETURNS VOID AS $$
DECLARE
  session_record pomodoro_sessions%ROWTYPE;
  xp_amount INTEGER;
BEGIN
  SELECT * INTO session_record FROM pomodoro_sessions WHERE id = session_uuid;
  
  -- Calcular XP base
  xp_amount := 10; -- XP base
  
  -- Bônus por completar sem pausas
  IF session_record.pause_count = 0 THEN
    xp_amount := xp_amount + 5;
  END IF;
  
  -- Bônus por modo
  IF session_record.mode = 'work' THEN
    xp_amount := xp_amount + 5;
  END IF;
  
  -- Atualizar sessão
  UPDATE pomodoro_sessions
  SET 
    status = 'completed',
    completed = TRUE,
    actual_duration = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER,
    completed_at = NOW(),
    xp_earned = xp_amount
  WHERE id = session_uuid;
  
  -- Dar XP
  PERFORM add_xp(
    session_record.user_id,
    xp_amount,
    'pomodoro_completed',
    'Pomodoro ' || session_record.mode || ' completado'
  );
  
  -- Atualizar tempo na tarefa/objetivo
  IF session_record.task_id IS NOT NULL THEN
    UPDATE micro_tasks
    SET 
      time_spent_minutes = COALESCE(time_spent_minutes, 0) + (session_record.planned_duration / 60),
      status = CASE WHEN status = 'pending' THEN 'in_progress' ELSE status END,
      updated_at = NOW()
    WHERE id = session_record.task_id;
  END IF;
  
  IF session_record.objective_id IS NOT NULL THEN
    UPDATE objectives
    SET 
      time_spent_minutes = COALESCE(time_spent_minutes, 0) + (session_record.planned_duration / 60),
      updated_at = NOW()
    WHERE id = session_record.objective_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular estatísticas do dia
CREATE OR REPLACE FUNCTION calculate_daily_stats(user_uuid UUID, calc_date DATE)
RETURNS VOID AS $$
DECLARE
  total_poms INTEGER;
  completed_poms INTEGER;
  cancelled_poms INTEGER;
  focus_minutes INTEGER;
  comp_rate DECIMAL(5,2);
  proc_score INTEGER;
BEGIN
  -- Calcular métricas do dia
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN completed = TRUE THEN 1 END),
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END),
    COALESCE(SUM(CASE WHEN completed = TRUE THEN actual_duration ELSE 0 END), 0) / 60
  INTO total_poms, completed_poms, cancelled_poms, focus_minutes
  FROM pomodoro_sessions
  WHERE user_id = user_uuid
    AND DATE(started_at) = calc_date
    AND mode = 'work';
  
  -- Taxa de conclusão
  IF total_poms > 0 THEN
    comp_rate := (completed_poms::DECIMAL / total_poms) * 100;
  ELSE
    comp_rate := 0;
  END IF;
  
  -- Score de procrastinação (simplificado)
  SELECT COALESCE(AVG(
    CASE 
      WHEN pause_count > 3 THEN 30
      WHEN pause_count > 1 THEN 15
      ELSE 0
    END + 
    CASE 
      WHEN status = 'cancelled' THEN 40
      ELSE 0
    END
  ), 0)::INTEGER INTO proc_score
  FROM pomodoro_sessions
  WHERE user_id = user_uuid
    AND DATE(started_at) = calc_date;
  
  -- Inserir ou atualizar stats
  INSERT INTO productivity_stats (
    user_id, stat_date, period_type,
    total_pomodoros, completed_pomodoros, cancelled_pomodoros,
    total_focus_minutes, completion_rate, procrastination_score,
    is_productive_day
  )
  VALUES (
    user_uuid, calc_date, 'daily',
    total_poms, completed_poms, cancelled_poms,
    focus_minutes, comp_rate, proc_score,
    completed_poms >= 4 -- Considera produtivo se completou 4+ pomodoros
  )
  ON CONFLICT (user_id, stat_date, period_type)
  DO UPDATE SET
    total_pomodoros = EXCLUDED.total_pomodoros,
    completed_pomodoros = EXCLUDED.completed_pomodoros,
    cancelled_pomodoros = EXCLUDED.cancelled_pomodoros,
    total_focus_minutes = EXCLUDED.total_focus_minutes,
    completion_rate = EXCLUDED.completion_rate,
    procrastination_score = EXCLUDED.procrastination_score,
    is_productive_day = EXCLUDED.is_productive_day,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter tempo total gasto em um objetivo
CREATE OR REPLACE FUNCTION get_objective_time_spent(objective_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  pomodoro_minutes INTEGER;
  manual_minutes INTEGER;
BEGIN
  -- Tempo de pomodoros
  SELECT COALESCE(SUM(actual_duration), 0) / 60
  INTO pomodoro_minutes
  FROM pomodoro_sessions
  WHERE objective_id = objective_uuid
    AND completed = TRUE;
  
  -- Tempo de entradas manuais
  SELECT COALESCE(SUM(duration_minutes), 0)
  INTO manual_minutes
  FROM time_entries
  WHERE objective_id = objective_uuid;
  
  RETURN COALESCE(pomodoro_minutes, 0) + COALESCE(manual_minutes, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para resumo diário
CREATE OR REPLACE VIEW daily_pomodoro_summary AS
SELECT 
  user_id,
  DATE(started_at) as date,
  COUNT(*) FILTER (WHERE mode = 'work') as work_sessions,
  COUNT(*) FILTER (WHERE mode = 'work' AND completed = TRUE) as completed_work_sessions,
  COALESCE(SUM(actual_duration) FILTER (WHERE mode = 'work' AND completed = TRUE), 0) / 60 as focus_minutes,
  COUNT(*) FILTER (WHERE mode IN ('short_break', 'long_break')) as break_sessions,
  AVG(pause_count)::INTEGER as avg_pauses
FROM pomodoro_sessions
GROUP BY user_id, DATE(started_at)
ORDER BY date DESC;

-- Trigger para criar config padrão do usuário
CREATE OR REPLACE FUNCTION create_default_pomodoro_config()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pomodoro_configs (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_pomodoro ON auth.users;
CREATE TRIGGER on_auth_user_created_pomodoro
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_pomodoro_config();

-- Comentários
COMMENT ON TABLE pomodoro_sessions IS 'Sessões de Pomodoro do usuário';
COMMENT ON TABLE time_entries IS 'Entradas de tempo (tracking contínuo)';
COMMENT ON TABLE productivity_stats IS 'Estatísticas de produtividade (cache)';
COMMENT ON TABLE pomodoro_configs IS 'Configurações personalizadas do Pomodoro';
COMMENT ON VIEW daily_pomodoro_summary IS 'Resumo diário de sessões Pomodoro';
