-- ==========================================
-- MIGRATION: 003_habit_tracker_enhanced
-- Track: mobile_first_redesign_20260208
-- Description: Melhorias no habit tracker (check-ins, streaks, ícones)
-- ==========================================

-- Adicionar novas colunas na tabela habits existente
ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '✓',
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10;

-- Tabela de check-ins diários
CREATE TABLE IF NOT EXISTS habit_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  checkin_date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  xp_earned INTEGER DEFAULT 10,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, checkin_date)
);

-- Tabela de streaks históricos
CREATE TABLE IF NOT EXISTS habit_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  length INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_habit_checkins_habit ON habit_checkins(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_user ON habit_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_user_date ON habit_checkins(user_id, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_date ON habit_checkins(checkin_date);

CREATE INDEX IF NOT EXISTS idx_habit_streaks_habit ON habit_streaks(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_streaks_user ON habit_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_streaks_current ON habit_streaks(habit_id, is_current);

-- Row Level Security
ALTER TABLE habit_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage their own habit checkins"
  ON habit_checkins FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only manage their own habit streaks"
  ON habit_streaks FOR ALL
  USING (user_id = auth.uid());

-- Função para fazer check-in de hábito
CREATE OR REPLACE FUNCTION checkin_habit(
  habit_uuid UUID,
  checkin_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  habit_record habits%ROWTYPE;
  yesterday DATE;
  last_checkin DATE;
  current_streak INTEGER;
  new_best_streak INTEGER;
BEGIN
  SELECT * INTO habit_record FROM habits WHERE id = habit_uuid;
  yesterday := CURRENT_DATE - INTERVAL '1 day';
  
  -- Verificar último checkin
  SELECT MAX(checkin_date) INTO last_checkin
  FROM habit_checkins
  WHERE habit_id = habit_uuid;
  
  -- Calcular novo streak
  IF last_checkin = yesterday THEN
    current_streak := habit_record.streak_count + 1;
  ELSIF last_checkin = CURRENT_DATE THEN
    current_streak := habit_record.streak_count; -- já fez checkin hoje
  ELSE
    current_streak := 1; -- streak quebrado, começar novo
  END IF;
  
  -- Atualizar best streak
  new_best_streak := GREATEST(habit_record.best_streak, current_streak);
  
  -- Inserir checkin
  INSERT INTO habit_checkins (habit_id, user_id, checkin_date, notes)
  VALUES (habit_uuid, habit_record.user_id, CURRENT_DATE, checkin_notes)
  ON CONFLICT (habit_id, checkin_date) 
  DO UPDATE SET 
    completed = TRUE,
    notes = EXCLUDED.notes;
  
  -- Atualizar hábito
  UPDATE habits
  SET 
    streak_count = current_streak,
    best_streak = new_best_streak,
    updated_at = NOW()
  WHERE id = habit_uuid;
  
  -- Dar XP
  PERFORM add_xp(
    habit_record.user_id,
    habit_record.xp_reward,
    'habit_checkin',
    'Check-in de hábito: ' || habit_record.title
  );
  
  -- Verificar conquistas de streak
  IF current_streak IN (7, 30, 60, 90, 180, 365) THEN
    INSERT INTO achievements (user_id, badge_id, badge_name, badge_icon, badge_description, rarity)
    VALUES (
      habit_record.user_id,
      'streak_' || current_streak,
      'Streak de ' || current_streak || ' dias',
      '🔥',
      'Manteve um hábito por ' || current_streak || ' dias consecutivos',
      CASE 
        WHEN current_streak >= 365 THEN 'legendary'
        WHEN current_streak >= 180 THEN 'epic'
        WHEN current_streak >= 90 THEN 'rare'
        ELSE 'common'
      END
    )
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para desfazer check-in
CREATE OR REPLACE FUNCTION undo_checkin(habit_uuid UUID, checkin_date DATE)
RETURNS VOID AS $$
DECLARE
  habit_record habits%ROWTYPE;
BEGIN
  SELECT * INTO habit_record FROM habits WHERE id = habit_uuid;
  
  -- Remover checkin
  DELETE FROM habit_checkins
  WHERE habit_id = habit_uuid AND checkin_date = checkin_date;
  
  -- Recalcular streak
  WITH streak_calc AS (
    SELECT 
      checkin_date,
      checkin_date - (ROW_NUMBER() OVER (ORDER BY checkin_date))::INTEGER AS grp
    FROM habit_checkins
    WHERE habit_id = habit_uuid
      AND checkin_date <= CURRENT_DATE
    ORDER BY checkin_date DESC
    LIMIT 1
  )
  SELECT COUNT(*) INTO habit_record.streak_count
  FROM streak_calc
  WHERE grp = (SELECT grp FROM streak_calc LIMIT 1);
  
  -- Atualizar hábito
  UPDATE habits
  SET 
    streak_count = COALESCE(habit_record.streak_count, 0),
    updated_at = NOW()
  WHERE id = habit_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter check-ins do mês
CREATE OR REPLACE FUNCTION get_habit_checkins_month(
  habit_uuid UUID,
  year_month TEXT -- formato: '2026-02'
)
RETURNS TABLE (
  checkin_date DATE,
  completed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hc.checkin_date,
    hc.completed
  FROM habit_checkins hc
  WHERE hc.habit_id = habit_uuid
    AND TO_CHAR(hc.checkin_date, 'YYYY-MM') = year_month
  ORDER BY hc.checkin_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para estatísticas de hábitos
CREATE OR REPLACE VIEW habit_stats AS
SELECT 
  h.id as habit_id,
  h.user_id,
  h.title as habit_name,
  h.streak_count,
  h.best_streak,
  COUNT(hc.id) as total_checkins,
  COUNT(CASE WHEN hc.checkin_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as checkins_last_30_days,
  MAX(hc.checkin_date) as last_checkin_date
FROM habits h
LEFT JOIN habit_checkins hc ON h.id = hc.habit_id
GROUP BY h.id, h.user_id, h.title, h.streak_count, h.best_streak;

-- Comentários
COMMENT ON TABLE habit_checkins IS 'Check-ins diários de hábitos';
COMMENT ON TABLE habit_streaks IS 'Histórico de streaks de hábitos';
COMMENT ON VIEW habit_stats IS 'View com estatísticas agregadas de hábitos';
