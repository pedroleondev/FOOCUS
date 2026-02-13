-- ==========================================
-- MIGRATION: 001_gamification_system
-- Track: mobile_first_redesign_20260208
-- Description: Cria tabelas de gamificação (XP, conquistas, missões diárias)
-- ==========================================

-- Tabela de estatísticas do usuário
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID REFERENCES auth.users PRIMARY KEY,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  daily_quests_completed INTEGER DEFAULT 0,
  total_habits_completed INTEGER DEFAULT 0,
  total_objectives_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conquistas/badges
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

-- Histórico de XP
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'habit_completed', 'objective_completed', 'streak_bonus', 'pomodoro_completed', etc
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Missões diárias
CREATE TABLE IF NOT EXISTS daily_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  quest_type TEXT NOT NULL, -- 'complete_habits', 'complete_objectives', 'maintain_streak', 'complete_pomodoros'
  target_count INTEGER NOT NULL,
  current_count INTEGER DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  quest_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Níveis e thresholds
CREATE TABLE IF NOT EXISTS level_thresholds (
  level INTEGER PRIMARY KEY,
  xp_required INTEGER NOT NULL,
  title TEXT NOT NULL
);

-- Inserir thresholds padrão
INSERT INTO level_thresholds (level, xp_required, title) VALUES
  (1, 0, 'Iniciante'),
  (2, 100, 'Aprendiz'),
  (3, 300, 'Disciplinado'),
  (4, 600, 'Focado'),
  (5, 1000, 'Produtivo'),
  (6, 1500, 'Mestre'),
  (7, 2100, 'Especialista'),
  (8, 2800, 'Expert'),
  (9, 3600, 'Mestre Produtivo'),
  (10, 4500, 'Lenda'),
  (11, 5500, 'Produtividade Nível 11'),
  (12, 6600, 'Produtividade Nível 12'),
  (13, 7800, 'Produtividade Nível 13'),
  (14, 9100, 'Produtividade Nível 14'),
  (15, 10500, 'Produtividade Nível 15'),
  (16, 12000, 'Produtividade Nível 16'),
  (17, 13600, 'Produtividade Nível 17'),
  (18, 15300, 'Produtividade Nível 18'),
  (19, 17100, 'Produtividade Nível 19'),
  (20, 19000, 'Lenda Suprema')
ON CONFLICT (level) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user ON user_stats(id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_badge ON achievements(user_id, badge_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_user ON xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_user_date ON xp_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_quests_user ON daily_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_quests_user_date ON daily_quests(user_id, quest_date);
CREATE INDEX IF NOT EXISTS idx_daily_quests_date ON daily_quests(quest_date);

-- Row Level Security (RLS)
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can only see their own stats"
  ON user_stats FOR ALL
  USING (id = auth.uid());

CREATE POLICY "Users can only see their own achievements"
  ON achievements FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only see their own XP history"
  ON xp_history FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only see their own daily quests"
  ON daily_quests FOR ALL
  USING (user_id = auth.uid());

-- Função para calcular nível atual
CREATE OR REPLACE FUNCTION get_user_level(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  user_xp INTEGER;
  user_level INTEGER;
BEGIN
  SELECT total_xp INTO user_xp FROM user_stats WHERE id = user_uuid;
  
  SELECT level INTO user_level
  FROM level_thresholds
  WHERE xp_required <= user_xp
  ORDER BY level DESC
  LIMIT 1;
  
  RETURN COALESCE(user_level, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para adicionar XP e atualizar nível
CREATE OR REPLACE FUNCTION add_xp(
  user_uuid UUID,
  xp_amount INTEGER,
  xp_source TEXT,
  xp_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  new_total INTEGER;
  new_level INTEGER;
BEGIN
  -- Inserir no histórico
  INSERT INTO xp_history (user_id, amount, source, description)
  VALUES (user_uuid, xp_amount, xp_source, xp_description);
  
  -- Atualizar total
  UPDATE user_stats
  SET 
    total_xp = total_xp + xp_amount,
    updated_at = NOW()
  WHERE id = user_uuid
  RETURNING total_xp INTO new_total;
  
  -- Verificar se subiu de nível
  SELECT level INTO new_level
  FROM level_thresholds
  WHERE xp_required <= new_total
  ORDER BY level DESC
  LIMIT 1;
  
  IF new_level IS NOT NULL THEN
    UPDATE user_stats
    SET current_level = new_level
    WHERE id = user_uuid AND current_level < new_level;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar user_stats automaticamente
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_stats();

-- Comentários
COMMENT ON TABLE user_stats IS 'Estatísticas de gamificação do usuário (XP, nível, streaks)';
COMMENT ON TABLE achievements IS 'Conquistas e badges desbloqueados pelo usuário';
COMMENT ON TABLE xp_history IS 'Histórico de ganho de XP';
COMMENT ON TABLE daily_quests IS 'Missões diárias de gamificação';
COMMENT ON TABLE level_thresholds IS 'Tabela de níveis e XP necessário para cada um';
