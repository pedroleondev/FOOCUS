import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/services/supabaseClient';
import { MobileHeader } from '../components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Target,
  Flag,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateGoalModal } from '../modals/CreateGoalModal';

interface Objective {
  id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'archived';
  due_date: string | null;
  progress_percentage: number;
  xp_reward: number;
  created_at: string;
}

export const ObjectivesView: React.FC = () => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userId = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setObjectives(data || []);
    } catch (err) {
      console.error('Error fetching objectives:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredObjectives = objectives.filter(obj => {
    if (filter === 'all') return obj.status !== 'archived';
    return obj.status === filter;
  });

  const stats = {
    total: objectives.length,
    active: objectives.filter(o => o.status === 'active').length,
    completed: objectives.filter(o => o.status === 'completed').length,
    highPriority: objectives.filter(o => o.priority === 'high' && o.status === 'active').length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <MobileHeader title="Objetivos" subtitle="Seus grandes passos" />

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-200" />
                <span className="text-xs text-indigo-200">Ativos</span>
              </div>
              <p className="text-3xl font-black">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-200" />
                <span className="text-xs text-emerald-200">Completados</span>
              </div>
              <p className="text-3xl font-black">{stats.completed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
                filter === f
                  ? 'bg-slate-800 text-white shadow-lg'
                  : 'border border-slate-200 bg-white text-slate-600'
              )}
            >
              {f === 'all' && 'Todos'}
              {f === 'active' && 'Ativos'}
              {f === 'completed' && 'Concluídos'}
            </button>
          ))}
        </div>

        {/* Objectives List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Seus Objetivos</h2>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-10 rounded-full bg-emerald-500 px-4 text-white hover:bg-emerald-600"
            >
              <Plus className="mr-1 h-4 w-4" />
              Novo
            </Button>
          </div>

          {filteredObjectives.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Flag className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-700">Nenhum objetivo</h3>
              <p className="mb-4 text-sm text-slate-500">Crie seu primeiro objetivo</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Objetivo
              </Button>
            </div>
          ) : (
            filteredObjectives.map(objective => (
              <Link
                key={objective.id}
                to={`/objetivos/${objective.id}`}
                className="block rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-[10px] font-bold uppercase',
                          getPriorityColor(objective.priority)
                        )}
                      >
                        {objective.priority}
                      </span>
                      {objective.status === 'completed' && (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700 uppercase">
                          Concluído
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{objective.title}</h3>
                    {objective.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {objective.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Progresso</span>
                    <span className="font-bold text-slate-700">
                      {objective.progress_percentage}%
                    </span>
                  </div>
                  <Progress value={objective.progress_percentage} className="h-2" />
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  {objective.due_date ? (
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(objective.due_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Sem prazo</span>
                  )}
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                    +{objective.xp_reward} XP
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CreateGoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchObjectives();
          }}
        />
      )}
    </div>
  );
};
