import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Tables } from '@/supabase_types';
import { MobileHeader } from '../components/MobileHeader';
import { HabitCard } from '../components/HabitCard';
import { CreateHabitModal } from '../modals/CreateHabitModal';
import { useGamification } from '@/hooks/useGamification';
import { Button } from '@/components/ui/button';
import { Plus, Flame, Trophy, Calendar } from 'lucide-react';

type Habit = Tables<'habits'>;

interface HabitCheckin {
  habit_id: string;
  checkin_date: string;
}

export const HabitsView: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkins, setCheckins] = useState<HabitCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addXp, incrementHabitCount, updateStreak, updateQuestProgress } = useGamification();

  const userId = '00000000-0000-0000-0000-000000000000';
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchHabits();
    fetchCheckins();
  }, []);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckins = async () => {
    try {
      const { data, error } = await supabase
        .from('habit_checkins')
        .select('habit_id, checkin_date')
        .eq('user_id', userId)
        .gte(
          'checkin_date',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        );

      if (error) throw error;
      setCheckins(data || []);
    } catch (err) {
      console.error('Error fetching checkins:', err);
    }
  };

  const isCheckedToday = (habitId: string) => {
    return checkins.some(c => c.habit_id === habitId && c.checkin_date === today);
  };

  const getHabitStreak = (habitId: string) => {
    const habitCheckins = checkins
      .filter(c => c.habit_id === habitId)
      .map(c => c.checkin_date)
      .sort();

    if (habitCheckins.length === 0) return 0;

    let streak = 0;
    const todayDate = new Date(today);

    // Check backwards from today
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (habitCheckins.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  };

  const getCompletedDaysForHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit?.history) return [];

    // Parse history array and return day indices for current week
    const history = habit.history as boolean[];
    const completedDays: number[] = [];

    history.forEach((completed, index) => {
      if (completed) {
        // Map index to day of week (0-6)
        completedDays.push(index % 7);
      }
    });

    return completedDays;
  };

  const handleCheckIn = async (habit: Habit) => {
    if (isCheckedToday(habit.id)) return;

    try {
      // Insert checkin
      const { error: checkinError } = await supabase.from('habit_checkins').insert({
        habit_id: habit.id,
        user_id: userId,
        checkin_date: today,
        completed: true,
        xp_earned: 10,
      });

      if (checkinError) throw checkinError;

      // Update habit streak
      const newStreak = (habit.current_streak || 0) + 1;
      const bestStreak = Math.max(newStreak, habit.best_streak || 0);

      // Update history
      const history = (habit.history as boolean[]) || [];
      history.push(true);

      const { error: updateError } = await supabase
        .from('habits')
        .update({
          current_streak: newStreak,
          best_streak: bestStreak,
          total_completions: (habit.total_completions || 0) + 1,
          history: history.slice(-30), // Keep last 30 entries
        })
        .eq('id', habit.id);

      if (updateError) throw updateError;

      // Gamification rewards
      await addXp(10, 'habit_completed', `Hábito completado: ${habit.title}`);
      await incrementHabitCount();
      await updateStreak();
      await updateQuestProgress('complete_habits');

      // Refresh data
      await fetchHabits();
      await fetchCheckins();
    } catch (err) {
      console.error('Error checking in:', err);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Tem certeza que deseja excluir este hábito?')) return;

    try {
      const { error } = await supabase.from('habits').delete().eq('id', habitId);
      if (error) throw error;
      await fetchHabits();
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  // Calculate stats
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => isCheckedToday(h.id)).length;
  const totalStreak = habits.reduce((acc, h) => acc + (h.current_streak || 0), 0);
  const bestStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);
  const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <MobileHeader title="Meus Hábitos" subtitle="Crie e mantenha consistência" />

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Stats Card */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="mb-1 flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4 text-emerald-200" />
              </div>
              <p className="text-2xl font-black">
                {completedToday}/{totalHabits}
              </p>
              <p className="text-xs font-medium text-emerald-200">Hoje</p>
            </div>
            <div className="border-x border-white/20">
              <div className="mb-1 flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-orange-300" />
              </div>
              <p className="text-2xl font-black">{totalStreak}</p>
              <p className="text-xs font-medium text-emerald-200">Streaks</p>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-300" />
              </div>
              <p className="text-2xl font-black">{bestStreak}</p>
              <p className="text-xs font-medium text-emerald-200">Recorde</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-emerald-100">Progresso do dia</span>
              <span className="font-bold">{Math.round(completionRate)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Seus Hábitos</h2>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-10 rounded-full bg-emerald-500 px-4 text-white hover:bg-emerald-600"
            >
              <Plus className="mr-1 h-4 w-4" />
              Novo
            </Button>
          </div>

          {habits.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-700">Nenhum hábito ainda</h3>
              <p className="mb-4 text-sm text-slate-500">
                Crie seu primeiro hábito para começar sua jornada
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Hábito
              </Button>
            </div>
          ) : (
            habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCheckedToday={isCheckedToday(habit.id)}
                streak={getHabitStreak(habit.id)}
                bestStreak={habit.best_streak || 0}
                completedDays={getCompletedDaysForHabit(habit.id)}
                onCheckIn={() => handleCheckIn(habit)}
                onEdit={() => {
                  /* TODO: Implement edit */
                }}
                onDelete={() => handleDeleteHabit(habit.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <CreateHabitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchHabits();
          }}
        />
      )}
    </div>
  );
};
