import React, { useState } from 'react';
import { Plus, Target, Repeat, CheckSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import { CreateHabitModal } from '../modals/CreateHabitModal';
import { CreateGoalModal } from '../modals/CreateGoalModal';

interface QuickAction {
  id: 'task' | 'habit' | 'goal';
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'task',
    label: 'Tarefa',
    icon: <CheckSquare className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
  },
  {
    id: 'habit',
    label: 'Hábito',
    icon: <Repeat className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 hover:bg-orange-200',
  },
  {
    id: 'goal',
    label: 'Objetivo',
    icon: <Target className="h-5 w-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 hover:bg-emerald-200',
  },
];

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'task' | 'habit' | 'goal' | null>(null);

  const handleActionClick = (actionId: 'task' | 'habit' | 'goal') => {
    setActiveModal(actionId);
    setIsOpen(false);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      {/* Floating Action Button Container - Positioned above mobile navigation */}
      <div className="fixed right-6 bottom-24 z-50 flex flex-col items-end gap-3">
        {/* Quick Actions Menu */}
        {isOpen && (
          <div className="animate-in slide-in-from-bottom-2 mb-2 flex flex-col items-end gap-2 duration-200">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                className={cn(
                  'flex items-center gap-3 rounded-full px-4 py-3 shadow-lg transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  'border-border border bg-white',
                  action.bgColor
                )}
              >
                <span className={cn('text-sm font-medium', action.color)}>{action.label}</span>
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    action.bgColor
                  )}
                >
                  {action.icon}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB Button */}
        <Button
          data-testid="fab-button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'h-14 min-h-[56px] w-14 min-w-[56px] rounded-full shadow-xl transition-all duration-300',
            'touch-manipulation hover:scale-110 active:scale-95',
            'fixed right-6 bottom-24 md:right-8 md:bottom-28',
            isOpen
              ? 'bg-destructive hover:bg-destructive/90 rotate-45'
              : 'bg-primary hover:bg-primary/90'
          )}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu de ações'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Plus className="h-6 w-6" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Backdrop when menu is open */}
      {isOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-40 bg-black/20 backdrop-blur-sm duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modals */}
      {activeModal === 'task' && <CreateTaskModal isOpen={true} onClose={handleCloseModal} />}
      {activeModal === 'habit' && <CreateHabitModal isOpen={true} onClose={handleCloseModal} />}
      {activeModal === 'goal' && <CreateGoalModal isOpen={true} onClose={handleCloseModal} />}
    </>
  );
};
