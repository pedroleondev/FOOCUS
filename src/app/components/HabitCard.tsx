import React, { useState } from 'react';
import { Tables } from '@/supabase_types';
import { DaySelector } from './DaySelector';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Flame, Trophy, MoreVertical, Edit2, Trash2 } from 'lucide-react';

type Habit = Tables<'habits'>;

interface HabitCardProps {
  habit: Habit;
  isCheckedToday: boolean;
  streak: number;
  bestStreak: number;
  completedDays: number[];
  onCheckIn: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isCheckedToday,
  streak,
  bestStreak,
  completedDays,
  onCheckIn,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleCheckIn = () => {
    if (!isCheckedToday) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 200);
      onCheckIn();
    }
  };

  const frequency = (habit.frequency as string[]) || [];
  const frequencyDays = frequency
    .map((f: string) => {
      const dayMap: { [key: string]: number } = {
        '0': 0,
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
      };
      return dayMap[f] ?? parseInt(f, 10);
    })
    .filter((d: number) => !isNaN(d) && d >= 0 && d <= 6);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-2xl">{habit.icon || '✓'}</span>
            <h3 className="text-lg font-bold text-slate-800">{habit.title}</h3>
          </div>
          {habit.goal_description && (
            <p className="text-sm text-slate-500">{habit.goal_description}</p>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute top-full right-0 z-50 mt-1 min-w-[140px] rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
                <button
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Streak Info */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-orange-600">
          <Flame className="h-4 w-4 fill-orange-500" />
          <span className="text-sm font-bold">{streak} dias</span>
        </div>
        {bestStreak > 0 && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">Recorde: {bestStreak}</span>
          </div>
        )}
      </div>

      {/* Day Selector */}
      <div className="mb-4">
        <DaySelector
          selectedDays={frequencyDays}
          completedDays={completedDays}
          onChange={() => {}}
          variant="display"
        />
      </div>

      {/* Check-in Button */}
      <Button
        onClick={handleCheckIn}
        disabled={isCheckedToday}
        className={cn(
          'h-14 w-full rounded-2xl text-base font-bold transition-all duration-200',
          isCheckedToday
            ? 'cursor-default bg-emerald-100 text-emerald-700'
            : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 active:scale-95',
          isPressed && 'scale-95'
        )}
      >
        {isCheckedToday ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Concluído Hoje!
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Fazer Check-in
            <span className="text-emerald-200">+10 XP</span>
          </span>
        )}
      </Button>
    </div>
  );
};
