import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/services/supabaseClient';
import { cn } from '@/lib/utils';

// Fixed user ID since RLS is disabled
const FIXED_USER_ID = '00000000-0000-0000-0000-000000000001';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Trabalho', 'Pessoal', 'Saúde', 'Estudo', 'Casa', 'Outro'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      console.log('[CreateTask] Creating task with fixed userId:', FIXED_USER_ID);
      
      const { error } = await supabase.from('tasks').insert({
        title: title.trim(),
        category: category || 'Geral',
        completed: false,
        user_id: FIXED_USER_ID,
      });

      if (error) {
        console.error('[CreateTask] Supabase error:', error);
        throw error;
      }
      
      console.log('[CreateTask] Success!');
      setTitle('');
      setCategory('');
      onClose();
      window.location.reload();
    } catch (error: unknown) {
      console.error('[CreateTask] Error:', error);
      alert('Erro ao criar tarefa: ' + (error instanceof Error ? error.message : 'Tente novamente'));
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
            <h2 className="text-xl font-bold">Nova Tarefa</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione uma nova tarefa para hoje
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
            <Label htmlFor="title">O que precisa ser feito?</Label>
            <Input
              id="title"
              placeholder="Ex: Revisar relatório, fazer exercícios..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'min-h-[44px] px-4 py-2 text-sm font-medium rounded-full transition-all touch-manipulation',
                    category === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  )}
                  aria-pressed={category === cat}
                >
                  {cat}
                </button>
              ))}
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
              className="flex-1 h-12"
              disabled={!title.trim() || loading}
            >
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Tarefa
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
