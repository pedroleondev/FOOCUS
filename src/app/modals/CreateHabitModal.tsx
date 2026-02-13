import React, { useState } from 'react';
import { X, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/services/supabaseClient';
import { cn } from '@/lib/utils';

// Fixed user ID since RLS is disabled
const FIXED_USER_ID = '00000000-0000-0000-0000-000000000001';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [streakGoal, setStreakGoal] = useState(21);
  const [loading, setLoading] = useState(false);

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedDays.length === 0) return;

    setLoading(true);
    try {
      console.log('[CreateHabit] Creating habit with fixed userId:', FIXED_USER_ID);
      
      const { error } = await supabase.from('habits').insert({
        title: title.trim(),
        frequency: selectedDays.map(d => daysOfWeek[d]),
        streak_goal: streakGoal,
        current_streak: 0,
        best_streak: 0,
        total_completions: 0,
        history: [],
        user_id: FIXED_USER_ID,
      });

      if (error) {
        console.error('[CreateHabit] Supabase error:', error);
        throw error;
      }
      
      console.log('[CreateHabit] Success!');
      setTitle('');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setStreakGoal(21);
      onClose();
      window.location.reload();
    } catch (error: unknown) {
      console.error('[CreateHabit] Error:', error);
      alert('Erro ao criar hábito: ' + (error instanceof Error ? error.message : 'Tente novamente'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Novo Hábito</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Crie um hábito para desenvolver
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full touch-manipulation"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Qual hábito você quer criar?</Label>
            <Input
              id="title"
              placeholder="Ex: Meditar 10 min, ler 20 páginas..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Frequência</Label>
            <div className="flex justify-between gap-1.5">
              {daysOfWeek.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={cn(
                    'min-w-[44px] min-h-[44px] w-11 h-11 rounded-full text-sm font-medium transition-all touch-manipulation',
                    selectedDays.includes(index)
                      ? 'bg-orange-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                  aria-pressed={selectedDays.includes(index)}
                  aria-label={`${selectedDays.includes(index) ? 'Desmarcar' : 'Marcar'} ${day}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Meta de sequência</Label>
              <span className="text-sm font-medium text-orange-600">{streakGoal} dias</span>
            </div>
            <input
              type="range"
              min="7"
              max="100"
              value={streakGoal}
              onChange={(e) => setStreakGoal(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>7 dias</span>
              <span>100 dias</span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-12"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 bg-orange-500 hover:bg-orange-600"
              disabled={!title.trim() || selectedDays.length === 0 || loading}
            >
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <>
                  <Repeat className="w-4 h-4 mr-2" />
                  Criar Hábito
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
