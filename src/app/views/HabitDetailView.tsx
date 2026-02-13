import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabaseClient';
import { Tables } from '@/supabase_types';
import { 
  Target, 
  Flame, 
  TrendingUp,
  Plus,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  ChevronLeft,
  Dumbbell,
  BookOpen,
  Brain,
  Droplets,
  Code,
  Sun,
  Moon,
  Heart,
  Music,
  Bike,
  Coffee,
  Apple,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mapa de ícones (igual ao HabitsView)
const iconMap: Record<string, React.ElementType> = {
  'academia': Dumbbell,
  'exercicio': Dumbbell,
  'treino': Dumbbell,
  'corrida': Dumbbell,
  'leitura': BookOpen,
  'livro': BookOpen,
  'estudo': BookOpen,
  'tecnica': Code,
  'code': Code,
  'programação': Code,
  'meditação': Brain,
  'mindfulness': Brain,
  'yoga': Brain,
  'água': Droplets,
  'hidratacao': Droplets,
  'agua': Droplets,
  'dieta': Apple,
  'alimentação': Apple,
  'comida': Apple,
  'café': Coffee,
  'cafe': Coffee,
  'manha': Sun,
  'manhã': Sun,
  'noite': Moon,
  'bike': Bike,
  'bicicleta': Bike,
  'musica': Music,
  'música': Music,
  'arte': Palette,
  'draw': Palette,
  'saude': Heart,
  'saúde': Heart,
  'default': Target
};

const colorMap: Record<string, { bg: string; text: string; light: string; border: string }> = {
  'academia': { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' },
  'exercicio': { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200' },
  'leitura': { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-200' },
  'estudo': { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200' },
  'meditação': { bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-200' },
  'água': { bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-200' },
  'default': { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' }
};

const getHabitIcon = (title: string): React.ElementType => {
  const lowerTitle = title.toLowerCase();
  for (const [keyword, Icon] of Object.entries(iconMap)) {
    if (lowerTitle.includes(keyword)) return Icon;
  }
  return Target;
};

const getHabitColors = (title: string) => {
  const lowerTitle = title.toLowerCase();
  for (const [keyword, colors] of Object.entries(colorMap)) {
    if (lowerTitle.includes(keyword)) return colors;
  }
  return colorMap.default;
};

// Função para capitalizar texto
const capitalizeText = (text: string): string => {
  if (!text) return '';
  return text.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

type Habit = Tables<'habits'>;

export const HabitDetailView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchHabit = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (data) setHabit(data);
      } catch (error) {
        console.error('Error fetching habit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabit();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
        <Target className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-black text-slate-800">Hábito não encontrado</h2>
        <button 
          onClick={() => navigate('/habitos')} 
          className="mt-6 text-emerald-500 font-black uppercase tracking-widest hover:underline"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  const Icon = getHabitIcon(habit.title);
  const colors = getHabitColors(habit.title);
  const progress = Math.min(Math.round(((habit.current_streak || 0) / (habit.streak_goal || 21)) * 100), 100);

  // Gerar dados mockados para o histórico visual (30 dias)
  const generateHistory = () => {
    const history = [];
    for (let i = 0; i < 30; i++) {
      // Simulação: dias mais recentes têm maior chance de estar completo
      const chance = (30 - i) / 30;
      history.push(Math.random() < chance * 0.8);
    }
    return history;
  };

  const history = generateHistory();

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-0 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 lg:mb-12">
        <button 
          onClick={() => navigate('/habitos')} 
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors min-h-[44px] px-2 rounded-lg hover:bg-slate-100"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest">Voltar</span>
        </button>
        
        <div className="flex items-center gap-2 text-emerald-600">
          <Target className="w-6 h-6" />
          <span className="font-black text-lg tracking-tight text-slate-800 hidden sm:inline">Detalhes do Hábito</span>
        </div>

        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors min-h-[44px] px-3 rounded-lg hover:bg-slate-100"
        >
          <Edit3 className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Editar</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Card */}
          <section className="bg-white p-6 lg:p-10 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
              <div className={cn(
                'w-20 h-20 rounded-[1.5rem] flex items-center justify-center',
                colors.light
              )}
              >
                <Icon className={cn('w-10 h-10', colors.text)} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-800">{capitalizeText(habit.title)}</h1>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                  Meta: {habit.streak_goal} dias
                </p>
              </div>
            </div>

            {/* Stats Grid - 2x2 em mobile, 4x1 em desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card Atual */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Atual</span>
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-800">{habit.current_streak || 0}</span>
                    <span className="text-xs font-bold text-slate-400">dias</span>
                  </div>
                </div>
              </div>

              {/* Card Recorde */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recorde</span>
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-800">{habit.best_streak || 0}</span>
                    <span className="text-xs font-bold text-slate-400">dias</span>
                  </div>
                </div>
              </div>

              {/* Card Total */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-800">{habit.total_completions || 0}</span>
                    <span className="text-xs font-bold text-slate-400">vezes</span>
                  </div>
                </div>
              </div>

              {/* Card Progresso */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progresso</span>
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-800">{progress}</span>
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Progresso da Meta</span>
                <span className="text-xs font-bold text-slate-600">{habit.current_streak || 0} / {habit.streak_goal} dias</span>
              </div>
               <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full transition-all duration-500', colors.bg)}
                  style={{ width: `${progress}%` }}
                />
               </div>
            </div>
          </section>

          {/* History Visual */}
          <section className="bg-white p-6 lg:p-10 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Histórico Visual</h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimos 30 dias</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {history.map((active, i) => (
                <div 
                  key={i} 
                  className={cn(
                    'w-4 h-4 rounded-md transition-all hover:scale-125 cursor-pointer',
                    active ? colors.bg : 'bg-slate-100'
                  )}
                  title={`Dia ${30 - i}`}
                />
              ))}
            </div>

            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400">
              <span>30 dias atrás</span>
              <span className={colors.text}>Hoje</span>
            </div>
          </section>
        </div>

        {/* Right Column - Edit Form */}
        <div className="lg:col-span-5">
          <div className={cn(
            'bg-white p-6 lg:p-8 rounded-2xl border shadow-sm space-y-6 sticky top-6 transition-all',
            isEditing ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
          )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <h2 className="text-xl font-black text-slate-800">Editar Hábito</h2>
              {isEditing && (
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Modo Edição</span>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nome do Hábito
                </label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input 
                    type="text" 
                    defaultValue={habit.title}
                    disabled={!isEditing}
                    className={cn(
                      'w-full pl-12 pr-4 py-4 rounded-2xl border font-bold text-slate-700 outline-none transition-all',
                      isEditing 
                        ? 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500' 
                        : 'border-slate-100 bg-slate-50/50 cursor-not-allowed'
                    )}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Frequência Semanal
                </label>
                <div className="flex flex-wrap gap-2">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                    <button 
                      key={i} 
                      type="button"
                      disabled={!isEditing}
                      className={cn(
                        'flex-1 min-w-[40px] h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all',
                        habit.frequency?.includes(day)
                          ? colors.bg + ' text-white'
                          : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Meta de Sequência
                </label>
                <input 
                  type="number" 
                  defaultValue={habit.streak_goal}
                  disabled={!isEditing}
                  className={cn(
                    'w-full px-4 py-4 rounded-2xl border font-bold text-slate-700 outline-none transition-all',
                    isEditing 
                      ? 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500' 
                      : 'border-slate-100 bg-slate-50/50 cursor-not-allowed'
                  )}
                />
              </div>

              <div className="pt-4 space-y-3">
                {isEditing ? (
                  <>
                    <button 
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      Salvar Alterações
                      <Plus className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="w-full py-4 text-slate-400 font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar Hábito
                  </button>
                )}

                <button 
                  className="w-full py-4 text-red-500 hover:bg-red-50 rounded-2xl font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Hábito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
