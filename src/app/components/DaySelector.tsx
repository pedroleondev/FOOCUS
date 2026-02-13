import React from 'react';
import { cn } from '@/lib/utils';

interface DaySelectorProps {
  selectedDays: number[]; // 0 = Domingo, 1 = Segunda, etc
  onChange: (days: number[]) => void;
  variant?: 'creation' | 'display';
  completedDays?: number[]; // Para visualização de dias completados
}

const WEEK_DAYS = [
  { short: 'D', full: 'Dom', index: 0 },
  { short: 'S', full: 'Seg', index: 1 },
  { short: 'T', full: 'Ter', index: 2 },
  { short: 'Q', full: 'Qua', index: 3 },
  { short: 'Q', full: 'Qui', index: 4 },
  { short: 'S', full: 'Sex', index: 5 },
  { short: 'S', full: 'Sáb', index: 6 },
];

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onChange,
  variant = 'creation',
  completedDays = [],
}) => {
  const toggleDay = (dayIndex: number) => {
    if (variant === 'display') return; // Não permite toggle no modo display

    if (selectedDays.includes(dayIndex)) {
      onChange(selectedDays.filter(d => d !== dayIndex));
    } else {
      onChange([...selectedDays, dayIndex].sort());
    }
  };

  const isSelected = (dayIndex: number) => selectedDays.includes(dayIndex);
  const isCompleted = (dayIndex: number) => completedDays.includes(dayIndex);

  return (
    <div className="flex justify-center gap-2">
      {WEEK_DAYS.map(day => {
        const selected = isSelected(day.index);
        const completed = isCompleted(day.index);

        return (
          <button
            key={day.index}
            onClick={() => toggleDay(day.index)}
            disabled={variant === 'display'}
            className={cn(
              'flex flex-col items-center gap-1.5 transition-all duration-200',
              variant === 'creation' && 'cursor-pointer',
              variant === 'display' && 'cursor-default'
            )}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase">{day.full}</span>
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold transition-all duration-200',
                completed && 'scale-105 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
                selected &&
                  !completed &&
                  'border-2 border-emerald-500 bg-emerald-100 text-emerald-700',
                !selected &&
                  !completed &&
                  'border-2 border-transparent bg-slate-100 text-slate-400 hover:bg-slate-200'
              )}
            >
              {completed ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                day.short
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
