import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Tables } from '@/supabase_types';
import { CreateGoalModal } from '../modals/CreateGoalModal';

type Goal = Tables<'goals'>;

export const GoalsView: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const getProgress = (goal: Goal) => {
    if (!goal.target_value || goal.target_value === 0) return 0;
    return Math.round(((goal.current_value || 0) / goal.target_value) * 100);
  };

  const getCategoryIcon = (category: string) => {
    if (category?.includes('saude')) return 'fitness_center';
    if (category?.includes('educacao')) return 'school';
    if (category?.includes('carreira')) return 'work';
    if (category?.includes('financeiro')) return 'attach_money';
    return 'flag';
  };

  const getCategoryColor = (category: string) => {
    if (category?.includes('saude')) return 'bg-emerald-100 text-emerald-600';
    if (category?.includes('educacao')) return 'bg-blue-100 text-blue-600';
    if (category?.includes('carreira')) return 'bg-purple-100 text-purple-600';
    if (category?.includes('financeiro')) return 'bg-green-100 text-green-600';
    return 'bg-orange-100 text-orange-600';
  };

  if (loading && goals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 md:pb-0">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Meus Objetivos</h1>
          <p className="text-slate-500 font-medium mt-1">Transforme sonhos em metas acionáveis.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-black flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl shadow-emerald-500/20"
        >
          <span className="material-symbols-rounded">add</span>
          NOVO OBJETIVO
        </button>
      </header>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Nenhum objetivo criado ainda.</p>
          <p className="text-slate-400 text-sm mt-2">Clique em &ldquo;NOVO OBJETIVO&rdquo; para começar!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {goals.map(goal => (
            <div key={goal.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
              <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 ${getCategoryColor(goal.category)}`}>
                <span className="material-symbols-rounded text-4xl">
                  {getCategoryIcon(goal.category)}
                </span>
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {goal.category || 'Geral'}
                    </p>
                    <h3 className="text-2xl font-black text-slate-800">{goal.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-800">{getProgress(goal)}%</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso</p>
                  </div>
                </div>
                
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                    style={{ width: `${getProgress(goal)}%` }}
                  >
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                    <span className="material-symbols-rounded text-lg">data_exploration</span>
                    Métrica: <strong className="text-slate-800">{goal.current_value || 0}/{goal.target_value} {goal.metric}</strong>
                  </span>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    goal.status === 'on-track' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                  }`}
                  >
                    {goal.status === 'on-track' ? 'No Prazo' : 'Atrasado'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Use the same CreateGoalModal as FAB */}
      <CreateGoalModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchGoals(); // Refresh after closing
        }} 
      />
    </div>
  );
};
