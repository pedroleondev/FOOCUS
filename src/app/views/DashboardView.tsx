import React, { useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Tables } from '@/supabase_types';
import { cn } from '@/lib/utils';
import { MobileHeader } from '../components/MobileHeader';
import {
  Flame,
  CheckCircle2,
  Trophy,
  Target,
  Clock,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type Task = Tables<'tasks'>;
type Habit = Tables<'habits'>;
type Routine = Tables<'daily_routines'>;

export const DashboardView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [routine, setRoutine] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [{ data: tasksData }, { data: habitsData }, { data: routineData }] =
          await Promise.all([
            supabase.from('tasks').select('*'),
            supabase.from('habits').select('*'),
            supabase.from('daily_routines').select('*').order('time_start', { ascending: true }),
          ]);

        if (tasksData) setTasks(tasksData);
        if (habitsData) setHabits(habitsData);
        if (routineData) setRoutine(routineData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const completedHabitsCount = habits.filter(h => {
    return Array.isArray(h.history) && h.history.length > 0;
  }).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <MobileHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
        streak={Math.max(...habits.map(h => h.best_streak || 0), 0)}
      />

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Stats Cards - Mobile First Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4 sm:p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 sm:h-14 sm:w-14">
                <Flame className="h-6 w-6 fill-orange-600 sm:h-7 sm:w-7" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Maior Sequência
                </p>
                <p className="text-xl font-bold sm:text-2xl">
                  {Math.max(...habits.map(h => h.best_streak || 0), 0)} dias
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Tarefas Concluídas
                  </p>
                  <p className="text-xl font-bold sm:text-2xl">
                    {completedTasksCount}/{tasks.length}
                  </p>
                </div>
                <CheckCircle2 className="text-primary fill-primary/20 h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <Progress
                value={tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0}
                className="h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Hábitos de Hoje
                  </p>
                  <p className="text-xl font-bold sm:text-2xl">
                    {completedHabitsCount}/{habits.length}
                  </p>
                </div>
                <Trophy className="h-7 w-7 fill-blue-500/20 text-blue-500 sm:h-8 sm:w-8" />
              </div>
              <Progress
                value={habits.length > 0 ? (completedHabitsCount / habits.length) * 100 : 0}
                className="h-2 bg-blue-100"
              />
            </CardContent>
          </Card>
        </div>

        {/* Foco do Dia Section */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Main Focus */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="mb-2 flex items-center gap-2">
                <Target className="text-primary h-5 w-5" />
                <CardTitle className="text-muted-foreground text-base font-bold tracking-wider uppercase">
                  FOCO DO DIA
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-foreground mb-2 text-xl font-bold sm:text-2xl">
                Reunião de planejamento
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Sprint planning com a equipe de desenvolvimento
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>09:00 - 10:30</span>
                </div>
                <div className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-semibold">
                  Alta Prioridade
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Habits Quick View */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground text-base font-bold tracking-wider uppercase">
                HÁBITOS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {habits.slice(0, 3).map(habit => (
                <div key={habit.id} className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      'h-10 w-10 shrink-0 rounded-full',
                      Array.isArray(habit.history) &&
                        habit.history.length > 0 &&
                        habit.history[habit.history.length - 1] === true
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-muted hover:border-primary hover:text-primary border-2'
                    )}
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{habit.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {habit.current_streak || 0} dias seguidos
                    </p>
                  </div>
                </div>
              ))}
              {habits.length === 0 && (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  Nenhum hábito criado ainda
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rotina do Dia */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-primary h-5 w-5" />
                <CardTitle className="text-muted-foreground text-base font-bold tracking-wider uppercase">
                  ROTINA DO DIA
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                Ver Tudo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routine.slice(0, 4).map((item, index) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="flex min-w-[60px] flex-col items-center">
                    <span className="text-foreground text-sm font-bold">
                      {item.time_start?.slice(0, 5)}
                    </span>
                    {index < routine.slice(0, 4).length - 1 && (
                      <div className="bg-border mt-2 h-full w-0.5" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-muted rounded-2xl p-4">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-muted-foreground mt-1 text-xs">{item.duration || '1h'}</p>
                    </div>
                  </div>
                </div>
              ))}
              {routine.length === 0 && (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  Nenhuma rotina criada ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-muted-foreground text-base font-bold tracking-wider uppercase">
                  TAREFAS PENDENTES
                </CardTitle>
                <span className="text-muted-foreground text-xs font-semibold">
                  {tasks.filter(t => !t.completed).length} restantes
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks
                  .filter(t => !t.completed)
                  .slice(0, 4)
                  .map(task => (
                    <div key={task.id} className="bg-muted flex items-center gap-3 rounded-xl p-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-muted hover:border-primary hover:text-primary h-8 w-8 shrink-0 rounded-full border-2"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{task.title}</p>
                        {task.category && (
                          <p className="text-muted-foreground text-xs">{task.category}</p>
                        )}
                      </div>
                    </div>
                  ))}
                {tasks.filter(t => !t.completed).length === 0 && (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    Nenhuma tarefa pendente!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-base font-bold tracking-wider uppercase">
                PROGRESSO SEMANAL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-end justify-between gap-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
                  const progress = [65, 80, 45, 90, 70, 30, 50][index];
                  const isToday = index === new Date().getDay() - 1;
                  return (
                    <div key={day} className="flex flex-1 flex-col items-center">
                      <div
                        className="bg-muted relative w-full overflow-hidden rounded-t-lg"
                        style={{ height: '80px' }}
                      >
                        <div
                          className={cn(
                            'absolute bottom-0 w-full rounded-t-lg transition-all duration-500',
                            isToday ? 'bg-primary' : 'bg-primary/40'
                          )}
                          style={{ height: `${progress}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          'mt-2 text-xs font-semibold',
                          isToday ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-border mt-4 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Média semanal</span>
                  <span className="font-bold">61%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
