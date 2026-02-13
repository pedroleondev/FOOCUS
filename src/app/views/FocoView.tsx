import {
  BarChart3,
  Bell,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Minus,
  Pause,
  Play,
  Plus,
  SkipForward,
  Square,
  Timer,
  TrendingUp,
  Trophy,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string | null;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  project: string | null;
  total_minutes_spent: number;
  tags: string[];
  user_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

interface ProductivityStats {
  total_pomodoros: number;
  total_focus_minutes: number;
  completed_tasks: number;
  category_breakdown: { label: string; value: number; color: string }[];
  hourly_focus?: { hour: number; minutes: number }[];
  daily_hourly_focus?: Record<string, number>; // "YYYY-MM-DD-HH" -> minutes
}

// Opções de tempo em minutos (para referência)
// const POMODORO_OPTIONS = [15, 25, 30, 45, 60];
// const BREAK_OPTIONS = [5, 10, 15, 30, 60];

type TimerMode = 'focus' | 'break';

// Simple Dialog Component
const Dialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <h2 className={`text-lg font-black ${className}`}>{children}</h2>;

// Popover components (unused for now, kept for future use)
// const Popover: React.FC<{ children: React.ReactNode }> = ({ children }) => { ... };
// const PopoverTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean }> = ({ ... });
// const PopoverContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ ... });

export const FocoView: React.FC = () => {
  // Identidade Fixa para Sincronização Absoluta entre dispositivos
  const MY_USER_ID = '00000000-0000-0000-0000-000000000001';

  // Timer State
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [pomodoroDuration, setPomodoroDuration] = useState(25); // minutos
  const [breakDuration, setBreakDuration] = useState(5); // minutos
  const [timeLeft, setTimeLeft] = useState(25 * 60); // segundos calculados
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSessionEnd, setCurrentSessionEnd] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedFocusTimeRef = useRef(0); // Tempo acumulado em segundos durante o foco
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Pré-carregar o áudio (tentando path na raiz do public para maior compatibilidade)
    audioRef.current = new Audio('/finish-pomodoro-beep.mp3');
    audioRef.current.load();
  }, []);

  const unlockAudio = () => {
    if (audioRef.current) {
      // Toca um silêncio rápido ou som baixinho no primeiro clique para ganhar permissão
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        audioRef.current!.pause();
        audioRef.current!.currentTime = 0;
        audioRef.current!.volume = 1;
      }).catch(e => console.log('Audio unlock failed:', e));
    }
  };

  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<ProductivityStats>({
    total_pomodoros: 0,
    total_focus_minutes: 0,
    completed_tasks: 0,
    category_breakdown: [
      { label: 'DevOps', value: 0, color: 'bg-emerald-500' },
      { label: 'Design', value: 0, color: 'bg-blue-500' },
      { label: 'Estudo', value: 0, color: 'bg-amber-500' },
      { label: 'Outros', value: 0, color: 'bg-slate-400' },
    ],
    hourly_focus: [],
    daily_hourly_focus: {},
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>(MY_USER_ID);

  // New/Edit Task Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    estimated_pomodoros: 1,
    project: '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');

  // Achievement Feedback
  const [showAchievement, setShowAchievement] = useState(false);

  // Semana atual do gráfico (1-4)
  const [currentWeek, setCurrentWeek] = useState(1);

  // Dropdown de tarefas
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);

  // Tempo customizável
  const [showCustomFocus, setShowCustomFocus] = useState(false);
  const [showCustomBreak, setShowCustomBreak] = useState(false);
  const [customFocusMinutes, setCustomFocusMinutes] = useState('');
  const [customBreakMinutes, setCustomBreakMinutes] = useState('');

  // Verificar se o tempo atual é customizável
  useEffect(() => {
    if (![1, 15, 25, 30, 45, 60].includes(pomodoroDuration)) {
      setShowCustomFocus(true);
      setCustomFocusMinutes(pomodoroDuration.toString());
    }
  }, [pomodoroDuration]);

  useEffect(() => {
    if (![5, 10, 15, 30, 60].includes(breakDuration)) {
      setShowCustomBreak(true);
      setCustomBreakMinutes(breakDuration.toString());
    }
  }, [breakDuration]);

  // Calcular semana atual baseada no dia de hoje
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const weekNumber = Math.ceil(currentDay / 7);
    setCurrentWeek(Math.min(Math.max(weekNumber, 1), 4));
  }, []);

  // Fetch initial data com UID Fixo
  useEffect(() => {
    const initData = async () => {
      try {
        setUserId(MY_USER_ID);
        await Promise.all([
          fetchTasks(MY_USER_ID),
          fetchStats(MY_USER_ID),
          fetchConfig(MY_USER_ID)
        ]);
      } catch (error) {
        console.error('[FocoView] Erro na inicialização:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intencional: rodar apenas no mount

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchTasks = async (uid: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('user_id', uid)
        .neq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setTasks(data as Task[]);
        if (!selectedTaskId) {
          setSelectedTaskId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (uid: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      // Início do mês atual
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthStartIso = monthStart.toISOString();

      // 1. Buscar sessões do mês atual para gráfico GitHub-style
      const { data: monthSessions, error: monthSessionError } = await supabase
        .from('pomodoro_sessions')
        .select('actual_duration, started_at')
        .eq('user_id', uid)
        .eq('status', 'completed')
        .gte('started_at', monthStartIso)
        .lte('started_at', todayIso);

      if (monthSessionError) throw monthSessionError;

      // 2. Buscar sessões de hoje para Pomodoros e Minutos
      const { data: sessions, error: sessionError } = await supabase
        .from('pomodoro_sessions')
        .select('actual_duration, started_at')
        .eq('user_id', uid)
        .eq('status', 'completed')
        .gte('completed_at', todayIso);

      if (sessionError) throw sessionError;

      type SessionData = { actual_duration: number; started_at: string };
      const dailyMinutes =
        ((sessions as SessionData[]) || []).reduce(
          (acc, s) => acc + (s.actual_duration || 0),
          0
        ) / 60;
      const dailyPomodoros = ((sessions as SessionData[]) || []).length;

      // Distribuição horária de HOJE (05h - 23h)
      const hourlyMap: Record<number, number> = {};
      for (let h = 5; h <= 23; h += 1) {
        hourlyMap[h] = 0;
      }

      ((sessions as SessionData[]) || []).forEach(session => {
        if (!session.started_at) {
          console.warn('[fetchStats] Sessão sem started_at:', session);
          return;
        }
        const start = new Date(session.started_at);
        const hour = start.getHours();
        const durationMinutes = (session.actual_duration || 0) / 60;
        
        if (hour >= 5 && hour <= 23) {
          hourlyMap[hour] += durationMinutes;
        } else {
          console.warn(`[fetchStats] Hora fora do range (05h-23h): ${hour}h`, session);
        }
      });

      const hourly_focus = Object.keys(hourlyMap)
        .map(key => {
          const hour = Number(key);
          return {
            hour,
            minutes: Math.round(hourlyMap[hour]),
          };
        })
        .sort((a, b) => a.hour - b.hour);

      // Objeto dia+hora -> minutos (para gráfico GitHub-style)
      const dailyHourlyMap: Record<string, number> = {};
      
      ((monthSessions as SessionData[]) || []).forEach(session => {
        if (!session.started_at) return;
        const start = new Date(session.started_at);
        const year = start.getFullYear();
        const month = String(start.getMonth() + 1).padStart(2, '0');
        const day = String(start.getDate()).padStart(2, '0');
        const hour = start.getHours();
        
        if (hour >= 5 && hour <= 23) {
          const key = `${year}-${month}-${day}-${hour}`;
          const durationMinutes = (session.actual_duration || 0) / 60;
          dailyHourlyMap[key] = (dailyHourlyMap[key] || 0) + durationMinutes;
        }
      });

      console.log('[fetchStats] daily_hourly_focus calculado:', Object.keys(dailyHourlyMap).slice(0, 10));

      // 2. Buscar tarefas concluídas (total histórico ou hoje, mantendo simples por ora)
      const { count: completedTasks, error: taskError } = await supabase
        .from('micro_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('status', 'completed');

      if (taskError) throw taskError;

      setStats(prev => ({
        ...prev,
        total_pomodoros: dailyPomodoros,
        total_focus_minutes: Math.round(dailyMinutes),
        completed_tasks: completedTasks || 0,
        hourly_focus,
        daily_hourly_focus: dailyHourlyMap,
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchConfig = async (uid: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_timer_state')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.warn('[FocoView] Erro ao buscar timer_state:', error.message);
        }
        setTimeLeft(pomodoroDuration * 60);
        setIsLoading(false);
        return;
      }

      if (data) {
        const sessionEnd = data.timer_end_at;
        const pausedStatus = data.is_paused;
        const savedType = data.timer_type;

        if (savedType) setMode(savedType as 'focus' | 'break');

        setCurrentSessionEnd(sessionEnd);
        setIsPaused(pausedStatus ?? true);
        if (data.active_task_id) setSelectedTaskId(data.active_task_id);

        if (sessionEnd && !pausedStatus) {
          const end = new Date(sessionEnd).getTime();
          const now = new Date().getTime();
          const remaining = Math.max(0, Math.floor((end - now) / 1000));

          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsActive(true);
          } else {
            handleTimerComplete();
          }
        } else if (data.timer_duration_left !== null && data.timer_duration_left !== undefined) {
          // Restaurar tempo exato de quando foi pausado
          setTimeLeft(data.timer_duration_left);
        } else {
          // Fallback para duração padrão do modo
          const currentDuration = savedType === 'break' ? breakDuration : pomodoroDuration;
          setTimeLeft(currentDuration * 60);
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  type TimerStateUpdate = Partial<{
    timer_end_at: string | null;
    is_paused: boolean;
    timer_duration_left: number;
  }>;

  const syncStateToSupabase = async (updates: TimerStateUpdate) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('user_timer_state')
        .upsert({
          id: userId,
          ...updates
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error syncing timer_state:', error);
    }
  };

  useEffect(() => {
    if (!isActive && !currentSessionEnd) {
      const duration = mode === 'focus' ? pomodoroDuration : breakDuration;
      setTimeLeft(duration * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomodoroDuration, breakDuration, mode]); // isActive e currentSessionEnd omitidos intencionalmente

  // Timer Logic with drift compensation
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const totalDuration = mode === 'focus' ? pomodoroDuration * 60 : breakDuration * 60;
      startTimeRef.current = Date.now() - (totalDuration - timeLeft) * 1000;

      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
        const totalDuration = mode === 'focus' ? pomodoroDuration * 60 : breakDuration * 60;
        const remaining = Math.max(0, totalDuration - elapsed);

        setTimeLeft(remaining);

        // Acumular tempo de foco (apenas no modo focus)
        if (mode === 'focus') {
          accumulatedFocusTimeRef.current = elapsed;
        }

        if (remaining === 0) {
          // Garantir que o tempo acumulado está correto ao completar
          if (mode === 'focus') {
            accumulatedFocusTimeRef.current = totalDuration;
          }
          handleTimerComplete();
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, mode, pomodoroDuration, breakDuration]); // timeLeft e handleTimerComplete omitidos intencionalmente

  const handleTimerComplete = async () => {
    setIsActive(false);

    // Tocar som de notificação de forma segura
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => {
        console.log('Audio playback blocked by browser policies. User interaction required.', e);
      });
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(mode === 'focus' ? 'Hora do descanso!' : 'Hora de focar!', {
        body: mode === 'focus' ? 'Seu tempo de foco terminou.' : 'Seu descanso terminou.',
      });
    }

    if (mode === 'focus') {
      // Completar pomodoro e mudar para intervalo
      if (selectedTaskId && userId) {
        const selectedTask = tasks.find(t => t.id === selectedTaskId);
        if (selectedTask) {
          await completePomodoro(selectedTask);
        }
      }

      setSessionCount(prev => prev + 1);
      setMode('break');
      const nextDuration = breakDuration * 60;
      setTimeLeft(nextDuration);
      setCurrentSessionEnd(null);
      setIsPaused(true);
      await syncStateToSupabase({
        timer_end_at: null,
        is_paused: true,
        timer_type: 'break'
      });
    } else {
      // Voltar para modo foco
      setMode('focus');
      const nextDuration = pomodoroDuration * 60;
      setTimeLeft(nextDuration);
      setCurrentSessionEnd(null);
      setIsPaused(true);
      await syncStateToSupabase({
        timer_end_at: null,
        is_paused: true,
        timer_type: 'focus'
      });
    }
  };

  const completePomodoro = async (task: Task) => {
    // Calcular tempo real gasto (garantir que está atualizado)
    const actualDurationSeconds = accumulatedFocusTimeRef.current || pomodoroDuration * 60;
    const now = new Date();
    const startedAt = new Date(now.getTime() - actualDurationSeconds * 1000);

    // 1. Update local state IMMEDIATELY for maximum reactivity
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? {
              ...t,
              completed_pomodoros: t.completed_pomodoros + 1,
              total_minutes_spent: (t.total_minutes_spent || 0) + pomodoroDuration,
              status: t.completed_pomodoros + 1 >= t.estimated_pomodoros ? 'completed' : 'in_progress'
            }
          : t
      )
    );
    console.log('🎉 Pomodoro concluído localmente!', {
      actualDurationSeconds,
      startedAt: startedAt.toISOString(),
      hour: startedAt.getHours(),
    });
    setShowAchievement(true);
    setTimeout(() => setShowAchievement(false), 3000);

    try {
      // 2. Update task pomodoros e minutos spent no DB
      const { error: taskError } = await supabase
        .from('micro_tasks')
        .update({
          completed_pomodoros: task.completed_pomodoros + 1,
          total_minutes_spent: (task.total_minutes_spent || 0) + pomodoroDuration,
          status:
            task.completed_pomodoros + 1 >= task.estimated_pomodoros ? 'completed' : 'in_progress',
        })
        .eq('id', task.id);

      if (taskError) throw taskError;

      // Create pomodoro session record
      const { error: sessionError } = await supabase.from('pomodoro_sessions').insert({
        user_id: userId,
        task_id: task.id,
        mode: 'work',
        planned_duration: pomodoroDuration * 60,
        actual_duration: actualDurationSeconds,
        status: 'completed',
        completed: true,
        started_at: startedAt.toISOString(),
        completed_at: now.toISOString(),
      });

      if (sessionError) {
        console.error('[completePomodoro] Erro ao salvar sessão:', sessionError);
        throw sessionError;
      }

      console.log('✅ Sessão de pomodoro salva:', {
        started_at: startedAt.toISOString(),
        actual_duration: actualDurationSeconds,
        hour: startedAt.getHours(),
      });

      // Visual feedback
      console.log('🎉 Pomodoro concluído!');
    } catch (error) {
      console.error('Error completing pomodoro:', error);
    } finally {
      // Refresh stats from DB anyway to sync other metrics
      if (userId) {
        console.log('[completePomodoro] Atualizando stats...');
        await fetchStats(userId);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular progresso do timer (0% = início, 100% = fim)
  const totalTime = (mode === 'break' ? breakDuration : pomodoroDuration) * 60;
  const elapsedTime = totalTime - timeLeft;
  const progress = totalTime > 0 ? Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100)) : 0;
  
  // Calcular circunferência baseada no raio de 45% do SVG
  // SVG padrão tem viewBox implícito de 100x100, então r="45%" = 45 unidades
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    // Use fixed user ID when in demo mode (no authenticated user)
    const effectiveUserId = userId || '00000000-0000-0000-0000-000000000001';

    try {
      const { data, error } = await supabase
        .from('micro_tasks')
        .insert({
          user_id: effectiveUserId,
          objective_id: '00000000-0000-0000-0000-000000000001', // Default objective
          sub_objective_id: '00000000-0000-0000-0000-000000000001', // Default sub-objective
          title: newTask.title.trim(),
          description: newTask.description.trim() || null,
          estimated_pomodoros: newTask.estimated_pomodoros,
          completed_pomodoros: 0,
          status: 'backlog',
          project: newTask.project.trim() || 'Geral',
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      setNewTask({ title: '', description: '', estimated_pomodoros: 1, project: '', tags: [] });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !newTask.title.trim()) return;

    try {
      const { error } = await supabase
        .from('micro_tasks')
        .update({
          title: newTask.title.trim(),
          description: newTask.description.trim() || null,
          estimated_pomodoros: newTask.estimated_pomodoros,
          project: newTask.project.trim() || 'Geral',
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      // Atualizar localmente
      setTasks(prev =>
        prev.map(t =>
          t.id === editingTask.id
            ? {
                ...t,
                title: newTask.title.trim(),
                description: newTask.description.trim() || null,
                estimated_pomodoros: newTask.estimated_pomodoros,
                project: newTask.project.trim() || 'Geral',
              }
            : t
        )
      );

      setNewTask({ title: '', description: '', estimated_pomodoros: 1, project: '', tags: [] });
      setEditingTask(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleUpdatePomodoros = async (taskId: string, delta: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newValue = Math.max(1, task.estimated_pomodoros + delta);

    try {
      const { error } = await supabase
        .from('micro_tasks')
        .update({ estimated_pomodoros: newValue })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, estimated_pomodoros: newValue } : t))
      );
    } catch (error) {
      console.error('Error updating pomodoros:', error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !newTask.tags.includes(newTag.trim())) {
      setNewTask(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewTask(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-0">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-7xl px-4 pb-24 md:pb-0"
      onClick={() => unlockAudio()}
    >
      {/* Toast de Conquista */}
      {showAchievement && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 transform rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-2xl animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 fill-white" />
            <span>+1 POMODORO CONCLUÍDO! 🎉</span>
          </div>
        </div>
      )}

      {/* Header Mobile-First */}
      <header className="mb-6 flex items-center justify-between md:mb-10">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Foco Total
          </h2>
          <p className="text-sm font-medium text-slate-500 md:text-base">
            Mantenha a concentração no que importa.
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="rounded-2xl border border-slate-100 bg-white p-2 text-slate-400 shadow-sm transition-all hover:text-emerald-500 md:p-3">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-600 shadow-sm md:px-5 md:text-sm">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">{stats.total_focus_minutes}m HOJE</span>
            <span className="sm:hidden">{stats.total_focus_minutes}m</span>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile First */}
      <div className="flex flex-col gap-6">
        {/* Timer Section - Central/Destaque */}
        <section
          className={cn(
            'flex flex-col items-center rounded-[2rem] border-2 p-6 text-center shadow-lg transition-all md:rounded-[3rem] md:p-10',
            mode === 'break'
              ? 'border-orange-200 bg-orange-50/30'
              : 'border-emerald-200 bg-emerald-50/30'
          )}
        >
          <div
            className={cn(
              'mb-4 flex items-center gap-2 rounded-full px-4 py-1.5 md:mb-6',
              mode === 'break'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-emerald-100 text-emerald-700'
            )}
          >
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                mode === 'break' ? 'bg-orange-500' : 'bg-emerald-500'
              )}
            />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase md:text-[11px]">
              {mode === 'break' ? 'Descanso Ativo' : 'Foco Ativo'}
            </span>
          </div>

          {/* Tarefa Ativa com Dropdown */}
          <div className="relative mb-6 w-full max-w-md md:mb-8">
            <button
              onClick={() => setIsTaskDropdownOpen(!isTaskDropdownOpen)}
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left transition-all',
                mode === 'break'
                  ? 'border-orange-200 bg-orange-50/50'
                  : 'border-emerald-200 bg-emerald-50/50',
                isTaskDropdownOpen && 'ring-2 ring-emerald-500'
              )}
            >
              <span className="flex-1 truncate text-lg font-black text-slate-800 md:text-xl">
                {selectedTask?.title || 'Selecione uma tarefa'}
              </span>
              <ChevronRight
                className={cn(
                  'h-5 w-5 flex-shrink-0 text-slate-400 transition-transform',
                  isTaskDropdownOpen && 'rotate-90'
                )}
              />
            </button>

            {/* Dropdown de Tarefas */}
            {isTaskDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsTaskDropdownOpen(false)}
                />
                <div className="absolute top-full z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {tasks.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">
                      Nenhuma tarefa disponível
                    </div>
                  ) : (
                    <div className="p-2">
                      {tasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setIsTaskDropdownOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors',
                            selectedTaskId === task.id
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'hover:bg-slate-50 text-slate-700'
                          )}
                        >
                          <span className="flex-1 truncate text-sm font-bold">{task.title}</span>
                          {selectedTaskId === task.id && (
                            <Check className="h-4 w-4 text-emerald-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Contador de Pomodoros */}
          {selectedTask ? (
            <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-white/80 px-4 py-2 md:mb-6">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  {Array.from({ length: selectedTask.estimated_pomodoros }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-2 w-2 rounded-full transition-all md:h-2.5 md:w-2.5',
                        i < selectedTask.completed_pomodoros
                          ? 'bg-emerald-500'
                          : 'bg-slate-200'
                      )}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-black text-slate-600 sm:text-[11px]">
                  {selectedTask.completed_pomodoros}/{selectedTask.estimated_pomodoros}
                </span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-bold text-slate-500 sm:text-[11px]">
                {selectedTask.estimated_pomodoros - selectedTask.completed_pomodoros} restantes
              </span>
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-slate-400 md:mb-6">
              <span className="text-[10px] font-medium sm:text-[11px]">
                Selecione uma tarefa para ver o progresso
              </span>
            </div>
          )}

          {/* Timer Circular with Progress */}
          <div className="relative mb-8 flex h-56 w-56 items-center justify-center md:mb-10 md:h-64 md:w-64">
            <svg
              className="h-full w-full -rotate-90 transform"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Círculo de fundo */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-200"
              />
              {/* Círculo de progresso */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={cn(
                  'transition-all duration-100 ease-linear',
                  mode === 'break'
                    ? 'text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                    : 'text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                )}
                style={{
                  strokeDashoffset: `${strokeDashoffset}`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Sincronizando...</span>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <div className="text-5xl font-black tracking-tighter text-slate-900 tabular-nums md:text-6xl">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'mt-1 rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase',
                      mode === 'break'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-emerald-100 text-emerald-700'
                    )}
                  >
                    {mode === 'break' ? 'Pausa' : 'Trabalho'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Seletores de Tempo */}
          <div className="mb-8 flex w-full max-w-sm flex-col gap-4 px-2 sm:px-0">
            {/* Foco */}
            <div className="flex w-full flex-col gap-2">
              <Label className="text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Foco (min)
              </Label>
              <div className="flex w-full flex-col gap-2">
                <ToggleGroup
                  type="single"
                  value={
                    showCustomFocus
                      ? 'custom'
                      : [1, 15, 25, 30, 45, 60].includes(pomodoroDuration)
                      ? pomodoroDuration.toString()
                      : 'custom'
                  }
                  onValueChange={async value => {
                    if (value === 'custom') {
                      setShowCustomFocus(true);
                    } else if (value) {
                      setShowCustomFocus(false);
                      const dur = parseInt(value);
                      setPomodoroDuration(dur);
                      if (mode === 'focus') {
                        setTimeLeft(dur * 60);
                        setIsActive(false);
                        setCurrentSessionEnd(null);
                        await syncStateToSupabase({
                          timer_end_at: null,
                          timer_duration_left: dur * 60,
                          is_paused: true,
                        });
                      }
                    }
                  }}
                  className="flex w-full flex-wrap justify-center gap-1.5 rounded-xl border border-slate-100 bg-white/50 p-1.5"
                >
                  {[1, 15, 25, 30, 45, 60].map(opt => (
                    <ToggleGroupItem
                      key={`foco-${opt}`}
                      value={opt.toString()}
                      className={cn(
                        'min-w-[45px] rounded-lg text-xs font-black transition-all h-8 px-2',
                        pomodoroDuration === opt && !showCustomFocus
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      {opt}
                    </ToggleGroupItem>
                  ))}
                  <ToggleGroupItem
                    value="custom"
                    className={cn(
                      'min-w-[45px] rounded-lg text-xs font-black transition-all h-8 px-2',
                      showCustomFocus
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    +
                  </ToggleGroupItem>
                </ToggleGroup>

                {showCustomFocus && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={customFocusMinutes}
                      onChange={e => setCustomFocusMinutes(e.target.value)}
                      placeholder="Minutos"
                      className="h-8 flex-1 text-xs"
                      onKeyDown={async e => {
                        if (e.key === 'Enter') {
                          const minutes = parseInt(customFocusMinutes);
                          if (minutes >= 1 && minutes <= 120) {
                            setPomodoroDuration(minutes);
                            setShowCustomFocus(false);
                            setCustomFocusMinutes('');
                            if (mode === 'focus') {
                              setTimeLeft(minutes * 60);
                              setIsActive(false);
                              setCurrentSessionEnd(null);
                              await syncStateToSupabase({
                                timer_end_at: null,
                                timer_duration_left: minutes * 60,
                                is_paused: true,
                              });
                            }
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        const minutes = parseInt(customFocusMinutes);
                        if (minutes >= 1 && minutes <= 120) {
                          setPomodoroDuration(minutes);
                          setShowCustomFocus(false);
                          setCustomFocusMinutes('');
                          if (mode === 'focus') {
                            setTimeLeft(minutes * 60);
                            setIsActive(false);
                            setCurrentSessionEnd(null);
                            await syncStateToSupabase({
                              timer_end_at: null,
                              timer_duration_left: minutes * 60,
                              is_paused: true,
                            });
                          }
                        }
                      }}
                      className="h-8 bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      OK
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCustomFocus(false);
                        setCustomFocusMinutes('');
                      }}
                      className="h-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Pausa */}
            <div className="flex w-full flex-col gap-2">
              <Label className="text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Pausa (min)
              </Label>
              <div className="flex w-full flex-col gap-2">
                <ToggleGroup
                  type="single"
                  value={
                    showCustomBreak
                      ? 'custom'
                      : [5, 10, 15, 30, 60].includes(breakDuration)
                      ? breakDuration.toString()
                      : 'custom'
                  }
                  onValueChange={async value => {
                    if (value === 'custom') {
                      setShowCustomBreak(true);
                    } else if (value) {
                      setShowCustomBreak(false);
                      const dur = parseInt(value);
                      setBreakDuration(dur);
                      if (mode === 'break') {
                        setTimeLeft(dur * 60);
                        setIsActive(false);
                        setCurrentSessionEnd(null);
                        await syncStateToSupabase({
                          timer_end_at: null,
                          is_paused: true,
                          timer_type: 'break',
                        });
                      }
                    }
                  }}
                  className="flex w-full flex-wrap justify-center gap-1.5 rounded-xl border border-slate-100 bg-white/50 p-1.5"
                >
                  {[5, 10, 15, 30, 60].map(opt => (
                    <ToggleGroupItem
                      key={`pausa-${opt}`}
                      value={opt.toString()}
                      className={cn(
                        'min-w-[45px] rounded-lg text-xs font-black transition-all h-8 px-2',
                        breakDuration === opt && !showCustomBreak
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      {opt}
                    </ToggleGroupItem>
                  ))}
                  <ToggleGroupItem
                    value="custom"
                    className={cn(
                      'min-w-[45px] rounded-lg text-xs font-black transition-all h-8 px-2',
                      showCustomBreak
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    +
                  </ToggleGroupItem>
                </ToggleGroup>

                {showCustomBreak && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={customBreakMinutes}
                      onChange={e => setCustomBreakMinutes(e.target.value)}
                      placeholder="Minutos"
                      className="h-8 flex-1 text-xs"
                      onKeyDown={async e => {
                        if (e.key === 'Enter') {
                          const minutes = parseInt(customBreakMinutes);
                          if (minutes >= 1 && minutes <= 120) {
                            setBreakDuration(minutes);
                            setShowCustomBreak(false);
                            setCustomBreakMinutes('');
                            if (mode === 'break') {
                              setTimeLeft(minutes * 60);
                              setIsActive(false);
                              setCurrentSessionEnd(null);
                              await syncStateToSupabase({
                                timer_end_at: null,
                                is_paused: true,
                                timer_type: 'break',
                              });
                            }
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        const minutes = parseInt(customBreakMinutes);
                        if (minutes >= 1 && minutes <= 120) {
                          setBreakDuration(minutes);
                          setShowCustomBreak(false);
                          setCustomBreakMinutes('');
                          if (mode === 'break') {
                            setTimeLeft(minutes * 60);
                            setIsActive(false);
                            setCurrentSessionEnd(null);
                            await syncStateToSupabase({
                              timer_end_at: null,
                              is_paused: true,
                              timer_type: 'break',
                            });
                          }
                        }
                      }}
                      className="h-8 bg-orange-500 text-white hover:bg-orange-600"
                    >
                      OK
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCustomBreak(false);
                        setCustomBreakMinutes('');
                      }}
                      className="h-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controles Centralizados */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <button
              data-testid="timer-stop"
              onClick={async () => {
                setIsActive(false);
                setCurrentSessionEnd(null);
                const duration = mode === 'focus' ? pomodoroDuration : breakDuration;
                setTimeLeft(duration * 60);
                await syncStateToSupabase({
                  timer_end_at: null,
                  is_paused: true
                });
              }}
              className={cn(
                'rounded-2xl border-2 bg-white p-4 shadow-sm transition-all active:scale-95 md:rounded-3xl md:p-5',
                mode === 'break'
                  ? 'border-orange-200 text-orange-500 hover:bg-orange-50 hover:border-orange-300'
                  : 'border-emerald-200 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-300'
              )}
              aria-label="Parar timer"
            >
              <Square className="h-5 w-5 fill-current md:h-6 md:w-6" />
            </button>

            <button
              data-testid="timer-play-pause"
              onClick={async () => {
                if (!isActive) {
                  // Iniciar ou Retomar
                  const now = new Date();
                  const end = new Date(now.getTime() + timeLeft * 1000);
                  const sessionEndIso = end.toISOString();

                  setCurrentSessionEnd(sessionEndIso);
                  setIsActive(true);
                  setIsPaused(false);

                  await syncStateToSupabase({
                    timer_end_at: sessionEndIso,
                    is_paused: false,
                    active_task_id: selectedTaskId
                  });
                } else {
                  // Pausar
                  setIsActive(false);
                  setIsPaused(true);
                  setCurrentSessionEnd(null);

                  await syncStateToSupabase({
                    timer_end_at: null,
                    timer_duration_left: timeLeft,
                    is_paused: true
                  });
                }
              }}
              disabled={!selectedTaskId}
              className={cn(
                'h-20 w-20 flex items-center justify-center rounded-[1.5rem] text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:h-24 md:w-24 md:rounded-[2rem]',
                mode === 'break'
                  ? isActive
                    ? 'bg-orange-600 shadow-orange-500/30 ring-4 ring-orange-200'
                    : 'bg-orange-500 shadow-orange-500/20'
                  : isActive
                  ? 'bg-emerald-600 shadow-emerald-500/30 ring-4 ring-emerald-200'
                  : 'bg-emerald-500 shadow-emerald-500/20'
              )}
              aria-label={isActive ? 'Pausar timer' : 'Iniciar timer'}
            >
              {isActive ? (
                <Pause className="h-8 w-8 fill-white md:h-10 md:w-10" />
              ) : (
                <Play className="ml-1 h-8 w-8 fill-white md:h-10 md:w-10" />
              )}
            </button>

            <button
              data-testid="timer-skip"
              onClick={async () => {
                setIsActive(false);
                setCurrentSessionEnd(null);
                const nextMode = mode === 'break' ? 'focus' : 'break';
                setMode(nextMode);
                const dur = nextMode === 'focus' ? pomodoroDuration : breakDuration;
                setTimeLeft(dur * 60);
                await syncStateToSupabase({
                  timer_end_at: null,
                  is_paused: true
                });
              }}
              className={cn(
                'rounded-2xl border-2 bg-white p-4 shadow-sm transition-all active:scale-95 md:rounded-3xl md:p-5',
                mode === 'break'
                  ? 'border-orange-200 text-orange-500 hover:bg-orange-50 hover:border-orange-300'
                  : 'border-emerald-200 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-300'
              )}
              aria-label="Pular sessão"
            >
              <SkipForward className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </section>

        {/* Grid para Desktop: Backlog + Analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Backlog de Tarefas */}
          <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-slate-900">Backlog</h3>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black tracking-wider text-slate-500 uppercase">
                  {tasks.length} Tarefas
                </span>
              </div>

              <button
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black tracking-wider text-emerald-600 uppercase transition-colors hover:bg-emerald-50"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova</span>
              </button>
            </div>

            <div className="min-h-[400px] max-h-[600px] overflow-y-auto pr-2 pb-8 md:min-h-[450px]">
              {tasks.length === 0 ? (
                <div className="flex h-[400px] flex-col items-center justify-center text-slate-400">
                  <Briefcase className="mb-2 h-8 w-8" />
                  <p className="text-sm font-medium">Nenhuma tarefa pendente</p>
                </div>
              ) : (
                <div className="space-y-4 pb-10">
                  {tasks.map(task => {
                    const isSelected = selectedTaskId === task.id;

                    const statusLabel =
                      task.status === 'completed'
                        ? 'Concluída'
                        : task.status === 'in_progress'
                        ? 'Em Progresso'
                        : task.status === 'skipped'
                        ? 'Ignorada'
                        : 'Backlog';

                    return (
                      <Card
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={cn(
                          'flex w-full cursor-pointer flex-col gap-3',
                          'border-2 bg-slate-50/80 p-4 transition-all',
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 shadow-md'
                            : 'border-transparent hover:border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        {/* Header: check + título + status */}
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                              isSelected
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-300 bg-white text-slate-400'
                            )}
                          >
                            {isSelected && <Check className="h-4 w-4" />}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="max-w-full whitespace-normal break-words text-sm font-bold leading-snug text-slate-800 line-clamp-2">
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTask(task);
                                    setNewTask({
                                      title: task.title,
                                      description: task.description || '',
                                      estimated_pomodoros: task.estimated_pomodoros,
                                      project: task.project || '',
                                      tags: []
                                    });
                                    setIsDialogOpen(true);
                                  }}
                                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                  title="Editar tarefa"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black tracking-wider text-slate-500">
                                  {statusLabel}
                                </span>
                              </div>
                            </div>

                            {task.description && (
                              <p className="max-w-full text-xs leading-snug text-slate-500 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progresso da tarefa */}
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
                            <span>Progresso</span>
                            <span className="font-black text-slate-500">
                              {task.estimated_pomodoros > 0
                                ? Math.round(
                                    (task.completed_pomodoros / task.estimated_pomodoros) * 100
                                  )
                                : 0}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              task.estimated_pomodoros > 0
                                ? (task.completed_pomodoros / task.estimated_pomodoros) * 100
                                : 0
                            }
                            className="h-1.5 bg-emerald-100 [&>div]:bg-emerald-500"
                            aria-label="Progresso em pomodoros"
                          />
                        </div>

                        {/* Projeto + tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          {task.project && task.project !== 'Geral' && (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black tracking-wider text-emerald-600">
                              <Briefcase className="h-3 w-3" />
                              {task.project}
                            </span>
                          )}
                          {task.tags?.map(tag => (
                            <span
                              key={tag}
                              className="rounded-full border border-slate-100 bg-white px-2 py-0.5 text-[9px] font-black tracking-wider text-slate-500 uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Footer: tempo gasto + pomodoros */}
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase">
                            {(() => {
                              const totalMinutes = task.total_minutes_spent || 0;
                              const hours = Math.floor(totalMinutes / 60);
                              const minutes = totalMinutes % 60;

                              if (hours <= 0) {
                                return `${totalMinutes} min`;
                              }

                              if (minutes === 0) {
                                return `${hours}h`;
                              }

                              return `${hours}h ${minutes}min`;
                            })()}
                          </span>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={e => {
                                e.stopPropagation();
                                handleUpdatePomodoros(task.id, -1);
                              }}
                              className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                              aria-label="Reduzir pomodoros estimados"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <div className="flex gap-1">
                              {Array.from({ length: task.estimated_pomodoros }).map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    'h-2 w-2 rounded-full md:h-2.5 md:w-2.5',
                                    i < task.completed_pomodoros
                                      ? 'bg-emerald-500'
                                      : 'bg-slate-200'
                                  )}
                                />
                              ))}
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={e => {
                                e.stopPropagation();
                                handleUpdatePomodoros(task.id, 1);
                              }}
                              className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                              aria-label="Aumentar pomodoros estimados"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Analytics Widget - Real Data */}
          <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                  Produtividade
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Distribuição do foco ao longo do dia
                </p>
              </div>
              <BarChart3 className="h-5 w-5 text-slate-300" />
            </div>

            {/* Gráfico estilo GitHub: Semana x Horas do dia */}
            <div className="mb-6">
              {/* Header do gráfico com navegação */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="text-[10px] font-black tracking-wider text-slate-500 uppercase sm:text-[11px]">
                    Produtividade Semanal
                  </h4>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}
                      disabled={currentWeek === 1}
                      className="h-7 w-7 rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Semana anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[70px] text-center text-[10px] font-black text-slate-700 sm:text-[11px]">
                      Semana {currentWeek}/4
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentWeek(prev => Math.min(4, prev + 1))}
                      disabled={currentWeek === 4}
                      className="h-7 w-7 rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Próxima semana"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 sm:text-[11px]">
                  <span>Total hoje:</span>
                  <span className="font-black text-slate-700">
                    {Math.floor(stats.total_focus_minutes / 60)}h{' '}
                    {stats.total_focus_minutes % 60}min
                  </span>
                </div>
              </div>

              {(() => {
                const today = new Date();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth();
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                const currentDay = today.getDate();

                // Calcular dias da semana atual (7 dias)
                const weekStartDay = (currentWeek - 1) * 7 + 1;
                const weekEndDay = Math.min(weekStartDay + 6, daysInMonth);
                
                const weekDays: number[] = [];
                for (let d = weekStartDay; d <= weekEndDay; d += 1) {
                  weekDays.push(d);
                }

                // Preencher com dias vazios se necessário (para manter 7 colunas)
                while (weekDays.length < 7) {
                  weekDays.push(0); // 0 = dia vazio
                }

                // Horas do dia (05h até 23h)
                const hours: number[] = [];
                for (let h = 5; h <= 23; h += 1) {
                  hours.push(h);
                }

                // Calcular máximo de minutos para normalizar cores
                const dailyHourlyMap = stats.daily_hourly_focus || {};
                let maxMinutes = 0;
                Object.values(dailyHourlyMap).forEach(minutes => {
                  maxMinutes = Math.max(maxMinutes, minutes);
                });
                maxMinutes = Math.max(maxMinutes, 1);

                // Função para obter intensidade da cor (0-4)
                const getIntensity = (minutes: number): number => {
                  if (minutes === 0) return 0;
                  const ratio = minutes / maxMinutes;
                  if (ratio >= 0.8) return 4;
                  if (ratio >= 0.6) return 3;
                  if (ratio >= 0.4) return 2;
                  if (ratio >= 0.2) return 1;
                  return 1;
                };

                // Função para obter cor baseada na intensidade
                const getColorClass = (intensity: number): string => {
                  switch (intensity) {
                    case 0:
                      return 'bg-slate-100';
                    case 1:
                      return 'bg-emerald-200';
                    case 2:
                      return 'bg-emerald-400';
                    case 3:
                      return 'bg-emerald-600';
                    case 4:
                      return 'bg-emerald-800';
                    default:
                      return 'bg-slate-100';
                  }
                };

                // Nomes dos dias da semana
                const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

                return (
                  <div className="w-full">
                    {/* Header: Dias da semana */}
                    <div className="mb-3 flex w-full gap-2">
                      <div className="w-14 flex-shrink-0 sm:w-16" />
                      <div className="flex flex-1 gap-2">
                        {weekDays.map((day, index) => {
                          if (day === 0) {
                            return (
                              <div
                                key={`empty-${index}`}
                                className="flex flex-1 flex-col items-center"
                              />
                            );
                          }

                          const date = new Date(currentYear, currentMonth, day);
                          const dayOfWeek = date.getDay();
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                          const isToday = day === currentDay;
                          const dayName = dayNames[dayOfWeek];

                          return (
                            <div
                              key={day}
                              className="flex flex-1 flex-col items-center gap-1"
                            >
                              <span
                                className={cn(
                                  'text-[9px] font-bold uppercase leading-none text-slate-400 sm:text-[10px]'
                                )}
                              >
                                {dayName}
                              </span>
                              <span
                                className={cn(
                                  'text-[11px] font-black leading-none sm:text-[12px]',
                                  isToday
                                    ? 'text-emerald-600'
                                    : isWeekend
                                    ? 'text-slate-400'
                                    : 'text-slate-700'
                                )}
                              >
                                {day}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Grid: Horas (linhas) x Dias (colunas) */}
                    <div className="flex w-full gap-2">
                      {/* Labels de horas (lateral esquerda) */}
                      <div className="flex w-14 flex-shrink-0 flex-col gap-[2px] sm:w-16">
                        {hours.map(hour => {
                          return (
                            <div
                              key={`label-${hour}`}
                              className="flex h-[10px] items-center justify-end pr-2 sm:h-[11px]"
                            >
                              <span className="text-[10px] font-bold leading-none text-slate-500 sm:text-[11px]">
                                {hour.toString().padStart(2, '0')}h
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Grid de quadradinhos */}
                      <div className="flex flex-1 gap-2">
                        {weekDays.map((day, dayIndex) => {
                          if (day === 0) {
                            return (
                              <div
                                key={`empty-col-${dayIndex}`}
                                className="flex flex-1 flex-col gap-[2px]"
                              >
                                {hours.map(hour => (
                                  <div
                                    key={`empty-${dayIndex}-${hour}`}
                                    className="h-[10px] w-full rounded-sm bg-transparent sm:h-[11px]"
                                  />
                                ))}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={`col-${day}`}
                              className="flex flex-1 flex-col gap-[2px]"
                            >
                              {hours.map(hour => {
                                const month = String(currentMonth + 1).padStart(2, '0');
                                const dayStr = String(day).padStart(2, '0');
                                const key = `${currentYear}-${month}-${dayStr}-${hour}`;
                                const minutes = Math.round(dailyHourlyMap[key] || 0);
                                const intensity = getIntensity(minutes);
                                const isToday = day === currentDay;
                                const date = new Date(currentYear, currentMonth, day);
                                const dayOfWeek = date.getDay();
                                const dayName = dayNames[dayOfWeek];

                                return (
                                  <div
                                    key={`${day}-${hour}`}
                                    className={cn(
                                      'h-[10px] w-full rounded-sm transition-all duration-200 hover:scale-105 sm:h-[11px]',
                                      getColorClass(intensity),
                                      isToday && intensity > 0 && 'ring-1 ring-emerald-500'
                                    )}
                                    title={
                                      minutes > 0
                                        ? `${dayName}, ${day}/${month} às ${hour.toString().padStart(2, '0')}h: ${minutes} min`
                                        : `${dayName}, ${day}/${month} às ${hour.toString().padStart(2, '0')}h: Sem foco`
                                    }
                                  />
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Legenda */}
              <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-[9px] font-medium text-slate-500 sm:text-[10px]">
                  <span className="font-bold">Menos</span>
                  <div className="flex gap-1">
                    <div className="h-3 w-3 rounded-sm bg-slate-100 shadow-sm sm:h-3.5 sm:w-3.5" />
                    <div className="h-3 w-3 rounded-sm bg-emerald-200 shadow-sm sm:h-3.5 sm:w-3.5" />
                    <div className="h-3 w-3 rounded-sm bg-emerald-400 shadow-sm sm:h-3.5 sm:w-3.5" />
                    <div className="h-3 w-3 rounded-sm bg-emerald-600 shadow-sm sm:h-3.5 sm:w-3.5" />
                    <div className="h-3 w-3 rounded-sm bg-emerald-800 shadow-sm sm:h-3.5 sm:w-3.5" />
                  </div>
                  <span className="font-bold">Mais</span>
                </div>
                <p className="text-[9px] font-medium text-slate-500 sm:text-[10px]">
                  Cada quadrado = 1 hora do dia (05h-23h)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span className="mb-1 block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Pomodoros
                </span>
                <div className="text-xl font-black text-slate-800">{stats.total_pomodoros}</div>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500">Hoje</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span className="mb-1 block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Foco Total
                </span>
                <div className="text-xl font-black text-slate-800">
                  {Math.floor(stats.total_focus_minutes / 60)}h{stats.total_focus_minutes % 60}m
                </div>
                <div className="mt-1 flex items-center gap-1 text-slate-400">
                  <Timer className="h-3 w-3" />
                  <span className="text-[10px] font-black">Minutos</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* New/Edit Task Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingTask(null);
            setNewTask({ title: '', description: '', estimated_pomodoros: 1, project: '', tags: [] });
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-black">
            {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="title" className="text-xs font-black uppercase">
              Título *
            </Label>
            <Input
              id="title"
              value={newTask.title}
              onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nome da tarefa"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-xs font-black uppercase">
              Descrição
            </Label>
            <Input
              id="description"
              value={newTask.description}
              onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição opcional"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="project" className="text-xs font-black uppercase">
              Projeto
            </Label>
            <div className="relative mt-1">
              <Briefcase className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="project"
                value={newTask.project}
                onChange={e => setNewTask(prev => ({ ...prev, project: e.target.value }))}
                placeholder="Geral"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-black uppercase">Pomodoros Estimados</Label>
            <div className="mt-1 flex items-center gap-3">
              <button
                onClick={() =>
                  setNewTask(prev => ({
                    ...prev,
                    estimated_pomodoros: Math.max(1, prev.estimated_pomodoros - 1),
                  }))
                }
                className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2rem] text-center font-bold">
                {newTask.estimated_pomodoros}
              </span>
              <button
                onClick={() =>
                  setNewTask(prev => ({
                    ...prev,
                    estimated_pomodoros: prev.estimated_pomodoros + 1,
                  }))
                }
                className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs font-black uppercase">Tags</Label>
            <div className="mt-1 flex gap-2">
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="Adicionar tag"
                className="flex-1"
              />
              <Button onClick={addTag} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {newTask.tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <Button
            onClick={editingTask ? handleUpdateTask : handleCreateTask}
            disabled={!newTask.title.trim()}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
          </Button>
        </div>
      </Dialog>

      {/* Floating Action Button for Mobile Add Task */}
      <button
        onClick={() => setIsDialogOpen(true)}
        className="fixed right-6 bottom-24 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl transition-all hover:scale-110 active:scale-95 md:hidden"
        aria-label="Nova tarefa"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};
