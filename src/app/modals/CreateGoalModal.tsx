import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/services/supabaseClient';
import { cn } from '@/lib/utils';

// Fixed user ID since RLS is disabled
const FIXED_USER_ID = '00000000-0000-0000-0000-000000000001';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { id: 'saude', label: 'Saúde', color: 'bg-red-100 text-red-600' },
  { id: 'carreira', label: 'Carreira', color: 'bg-blue-100 text-blue-600' },
  { id: 'pessoal', label: 'Pessoal', color: 'bg-purple-100 text-purple-600' },
  { id: 'financeiro', label: 'Financeiro', color: 'bg-green-100 text-green-600' },
  { id: 'educacao', label: 'Educação', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'outro', label: 'Outro', color: 'bg-gray-100 text-gray-600' },
];

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('pessoal');
  const [targetValue, setTargetValue] = useState('');
  const [metric, setMetric] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      console.log('[CreateGoal] Creating goal with fixed userId:', FIXED_USER_ID);
      
      const { error } = await supabase.from('goals').insert({
        title: title.trim(),
        description: description.trim(),
        category,
        target_value: Number(targetValue) || 100,
        current_value: 0,
        metric: metric || 'unidades',
        deadline: deadline || null,
        status: 'on-track',
        user_id: FIXED_USER_ID,
      });

      if (error) {
        console.error('[CreateGoal] Supabase error:', error);
        throw error;
      }
      
      console.log('[CreateGoal] Success!');
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('pessoal');
      setTargetValue('');
      setMetric('');
      setDeadline('');
      onClose();
      window.location.reload();
    } catch (error: unknown) {
      console.error('[CreateGoal] Error:', error);
      alert('Erro ao criar objetivo: ' + (error instanceof Error ? error.message : 'Tente novamente'));
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
      
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background">
          <div>
            <h2 className="text-xl font-bold">Novo Objetivo</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Defina um objetivo para alcançar
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
            <Label htmlFor="title">Qual seu objetivo?</Label>
            <Input
              id="title"
              placeholder="Ex: Correr 5km, Aprender inglês..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              placeholder="Detalhes sobre o objetivo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg transition-all touch-manipulation',
                    category === cat.id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                  )}
                  aria-pressed={category === cat.id}
                >
                  <span className={cn('px-3 py-1.5 rounded-md', cat.color)}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">Meta numérica</Label>
              <Input
                id="targetValue"
                type="number"
                placeholder="Ex: 100"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metric">Unidade</Label>
              <Input
                id="metric"
                placeholder="Ex: dias, km, horas"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Data limite (opcional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-12"
            />
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
              className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600"
              disabled={!title.trim() || loading}
            >
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Criar Objetivo
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
