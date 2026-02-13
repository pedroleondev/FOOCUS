import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  daily_quests_completed: number;
  total_habits_completed: number;
  total_objectives_completed: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_icon: string;
  badge_description: string | null;
  earned_at: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface XpHistory {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  description: string | null;
  created_at: string;
}

export interface DailyQuest {
  id: string;
  user_id: string;
  quest_type: string;
  target_count: number;
  current_count: number;
  xp_reward: number;
  completed: boolean;
  quest_date: string;
  created_at: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
  xpForNext: number;
  progress: number;
}

// Sistema de níveis do FOOCUS
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Iniciante' },
  { level: 2, xp: 100, title: 'Aprendiz' },
  { level: 3, xp: 300, title: 'Disciplinado' },
  { level: 4, xp: 600, title: 'Focado' },
  { level: 5, xp: 1000, title: 'Produtivo' },
  { level: 6, xp: 1500, title: 'Mestre' },
  { level: 7, xp: 2100, title: 'Especialista' },
  { level: 8, xp: 2800, title: 'Expert' },
  { level: 9, xp: 3600, title: 'Mestre Produtivo' },
  { level: 10, xp: 4500, title: 'Lenda' },
  { level: 11, xp: 5500, title: 'Grande Mestre' },
  { level: 12, xp: 6600, title: 'Mito' },
  { level: 13, xp: 7800, title: 'Lendário' },
  { level: 14, xp: 9100, title: 'Imortal' },
  { level: 15, xp: 10500, title: 'Deus da Produtividade' },
];

// Conquistas disponíveis
const AVAILABLE_BADGES = [
  {
    id: 'first_habit',
    name: 'Primeiro Passo',
    icon: '🌱',
    description: 'Complete seu primeiro hábito',
    rarity: 'common' as const,
  },
  {
    id: 'streak_7',
    name: 'Semana Perfeita',
    icon: '🔥',
    description: 'Mantenha uma sequência de 7 dias',
    rarity: 'common' as const,
  },
  {
    id: 'streak_30',
    name: 'Mês de Fogo',
    icon: '📅',
    description: 'Mantenha uma sequência de 30 dias',
    rarity: 'rare' as const,
  },
  {
    id: 'level_5',
    name: 'Produtivo',
    icon: '⚡',
    description: 'Alcance o nível 5',
    rarity: 'common' as const,
  },
  {
    id: 'level_10',
    name: 'Lenda',
    icon: '👑',
    description: 'Alcance o nível 10',
    rarity: 'epic' as const,
  },
  {
    id: 'objective_5',
    name: 'Conquistador',
    icon: '🏆',
    description: 'Complete 5 objetivos',
    rarity: 'common' as const,
  },
  {
    id: 'habits_50',
    name: 'Hábito em Dia',
    icon: '✅',
    description: 'Complete 50 hábitos no total',
    rarity: 'rare' as const,
  },
  {
    id: 'early_bird',
    name: 'Madrugador',
    icon: '🌅',
    description: 'Complete um hábito antes das 6h',
    rarity: 'common' as const,
  },
  {
    id: 'night_owl',
    name: 'Coruja',
    icon: '🦉',
    description: 'Complete um hábito após as 22h',
    rarity: 'common' as const,
  },
  {
    id: 'perfect_day',
    name: 'Dia Perfeito',
    icon: '⭐',
    description: 'Complete todas as missões do dia',
    rarity: 'rare' as const,
  },
];

export const useGamification = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [xpHistory, setXpHistory] = useState<XpHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = '00000000-0000-0000-0000-000000000000'; // Dev user

  // Buscar dados do usuário
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      if (statsData) {
        setUserStats(statsData);
      } else {
        // Criar stats iniciais
        await initializeUserStats();
      }

      // Buscar conquistas
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      setAchievements(achievementsData || []);

      // Buscar missões diárias
      const today = new Date().toISOString().split('T')[0];
      const { data: questsData } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('user_id', userId)
        .eq('quest_date', today);

      if (!questsData || questsData.length === 0) {
        // Gerar missões do dia
        await generateDailyQuests();
      } else {
        setDailyQuests(questsData);
      }

      // Buscar histórico de XP (últimos 7 dias)
      const { data: xpData } = await supabase
        .from('xp_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      setXpHistory(xpData || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('[useGamification] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Inicializar stats do usuário
  const initializeUserStats = async () => {
    const { data, error } = await supabase
      .from('user_stats')
      .insert({
        id: userId,
        total_xp: 0,
        current_level: 1,
        current_streak: 0,
        longest_streak: 0,
      })
      .select()
      .single();

    if (error) throw error;
    setUserStats(data);
  };

  // Gerar missões diárias
  const generateDailyQuests = async () => {
    const today = new Date().toISOString().split('T')[0];
    const quests = [
      {
        user_id: userId,
        quest_type: 'complete_habits',
        target_count: 3,
        current_count: 0,
        xp_reward: 50,
        completed: false,
        quest_date: today,
      },
      {
        user_id: userId,
        quest_type: 'complete_objectives',
        target_count: 1,
        current_count: 0,
        xp_reward: 100,
        completed: false,
        quest_date: today,
      },
      {
        user_id: userId,
        quest_type: 'maintain_streak',
        target_count: 1,
        current_count: 0,
        xp_reward: 25,
        completed: false,
        quest_date: today,
      },
    ];

    const { data, error } = await supabase.from('daily_quests').insert(quests).select();

    if (error) throw error;
    setDailyQuests(data || []);
  };

  // Adicionar XP
  const addXp = async (amount: number, source: string, description?: string) => {
    try {
      // Registrar no histórico
      const { error: xpError } = await supabase.from('xp_history').insert({
        user_id: userId,
        amount,
        source,
        description,
      });

      if (xpError) throw xpError;

      // Atualizar total
      const newTotalXp = (userStats?.total_xp || 0) + amount;
      const newLevel = calculateLevel(newTotalXp);

      const { error: statsError } = await supabase
        .from('user_stats')
        .update({
          total_xp: newTotalXp,
          current_level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (statsError) throw statsError;

      // Atualizar estado local
      setUserStats(prev =>
        prev
          ? {
              ...prev,
              total_xp: newTotalXp,
              current_level: newLevel,
            }
          : null
      );

      // Verificar se subiu de nível
      if (newLevel > (userStats?.current_level || 1)) {
        await checkLevelUpAchievements(newLevel);
      }

      return { success: true, leveledUp: newLevel > (userStats?.current_level || 1) };
    } catch (err: unknown) {
      console.error('[addXp] Error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  // Calcular nível baseado no XP
  const calculateLevel = (xp: number): number => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i].xp) {
        return LEVEL_THRESHOLDS[i].level;
      }
    }
    return 1;
  };

  // Obter informações do nível atual
  const getLevelInfo = (xp: number = userStats?.total_xp || 0): LevelInfo => {
    const currentLevel = calculateLevel(xp);
    const currentThreshold = LEVEL_THRESHOLDS.find(l => l.level === currentLevel)!;
    const nextThreshold = LEVEL_THRESHOLDS.find(l => l.level === currentLevel + 1);

    const xpForNext = nextThreshold ? nextThreshold.xp - currentThreshold.xp : 1000;
    const xpInCurrentLevel = xp - currentThreshold.xp;
    const progress = nextThreshold ? (xpInCurrentLevel / xpForNext) * 100 : 100;

    return {
      level: currentLevel,
      title: currentThreshold.title,
      xpRequired: currentThreshold.xp,
      xpForNext,
      progress: Math.min(progress, 100),
    };
  };

  // Verificar e conceder conquistas
  const checkAndAwardAchievements = async () => {
    const earnedBadgeIds = achievements.map(a => a.badge_id);
    const newAchievements: typeof AVAILABLE_BADGES = [];

    // Verificar cada conquista
    for (const badge of AVAILABLE_BADGES) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let shouldAward = false;

      switch (badge.id) {
        case 'first_habit':
          shouldAward = (userStats?.total_habits_completed || 0) >= 1;
          break;
        case 'streak_7':
          shouldAward = (userStats?.longest_streak || 0) >= 7;
          break;
        case 'streak_30':
          shouldAward = (userStats?.longest_streak || 0) >= 30;
          break;
        case 'level_5':
          shouldAward = (userStats?.current_level || 1) >= 5;
          break;
        case 'level_10':
          shouldAward = (userStats?.current_level || 1) >= 10;
          break;
        case 'habits_50':
          shouldAward = (userStats?.total_habits_completed || 0) >= 50;
          break;
      }

      if (shouldAward) {
        newAchievements.push(badge);
      }
    }

    // Inserir novas conquistas
    for (const badge of newAchievements) {
      await supabase.from('achievements').insert({
        user_id: userId,
        badge_id: badge.id,
        badge_name: badge.name,
        badge_icon: badge.icon,
        badge_description: badge.description,
        rarity: badge.rarity,
      });
    }

    if (newAchievements.length > 0) {
      await fetchUserData(); // Recarregar dados
    }

    return newAchievements;
  };

  // Verificar conquistas de nível
  const checkLevelUpAchievements = async (level: number) => {
    const earnedBadgeIds = achievements.map(a => a.badge_id);

    if (level >= 5 && !earnedBadgeIds.includes('level_5')) {
      await awardBadge('level_5');
    }
    if (level >= 10 && !earnedBadgeIds.includes('level_10')) {
      await awardBadge('level_10');
    }
  };

  // Conceder uma conquista específica
  const awardBadge = async (badgeId: string) => {
    const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
    if (!badge) return;

    await supabase.from('achievements').insert({
      user_id: userId,
      badge_id: badge.id,
      badge_name: badge.name,
      badge_icon: badge.icon,
      badge_description: badge.description,
      rarity: badge.rarity,
    });
  };

  // Atualizar progresso de missão
  const updateQuestProgress = async (questType: string, increment: number = 1) => {
    const quest = dailyQuests.find(q => q.quest_type === questType && !q.completed);
    if (!quest) return;

    const newCount = quest.current_count + increment;
    const completed = newCount >= quest.target_count;

    const { error } = await supabase
      .from('daily_quests')
      .update({
        current_count: newCount,
        completed,
      })
      .eq('id', quest.id);

    if (error) throw error;

    // Se completou, dar XP
    if (completed && !quest.completed) {
      await addXp(quest.xp_reward, 'quest_completed', `Missão completada: ${questType}`);
    }

    await fetchUserData();
  };

  // Incrementar contador de hábitos completados
  const incrementHabitCount = async () => {
    const { error } = await supabase
      .from('user_stats')
      .update({
        total_habits_completed: (userStats?.total_habits_completed || 0) + 1,
      })
      .eq('user_id', userId);

    if (error) throw error;

    await updateQuestProgress('complete_habits');
    await checkAndAwardAchievements();
  };

  // Atualizar streak
  const updateStreak = async () => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = userStats?.last_active_date;

    let newStreak = userStats?.current_streak || 0;

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        // Dia seguinte, incrementar streak
        newStreak += 1;
      } else if (diffDays > 1) {
        // Quebrou a streak
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, userStats?.longest_streak || 0);

    const { error } = await supabase
      .from('user_stats')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_active_date: today,
      })
      .eq('user_id', userId);

    if (error) throw error;

    // Bonus de streak
    if (newStreak > 1) {
      const bonusXp = Math.min(newStreak * 5, 50); // Max 50 XP
      await addXp(bonusXp, 'streak_bonus', `Bônus de streak: ${newStreak} dias`);
    }

    await checkAndAwardAchievements();
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    userStats,
    achievements,
    dailyQuests,
    xpHistory,
    loading,
    error,
    levelInfo: getLevelInfo(),
    addXp,
    checkAndAwardAchievements,
    updateQuestProgress,
    incrementHabitCount,
    updateStreak,
    refreshData: fetchUserData,
  };
};
