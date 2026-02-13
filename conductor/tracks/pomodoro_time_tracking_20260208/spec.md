# Especificação Técnica: Sistema de Pomodoro e Time Tracking

## 1. Arquitetura do Sistema

### 1.1 Diagrama de Componentes
```
┌─────────────────────────────────────────────────────────────┐
│                      Aplicação React                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PomodoroTimer│  │TimeTracking  │  │  Dashboard   │      │
│  │   (View)     │  │   Dashboard  │  │   (Metrics)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  usePomodoro │  │ useTimeTrack │  │PomodoroWidget│      │
│  │    (Hook)    │  │    (Hook)    │  │  (Component) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │timeTracking  │  │ notification │  │pomodoroWorker│      │
│  │  Service     │  │   Service    │  │   (Worker)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Worker                           │
│              (Background sync & notifications)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │pomodoro_     │  │ time_entries │  │ productivity │      │
│  │ sessions     │  │              │  │   stats      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Estados do Timer
```typescript
type PomodoroState = 'idle' | 'focus' | 'shortBreak' | 'longBreak' | 'paused';
type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSession {
  id: string;
  userId: string;
  taskId?: string; // Associação com tarefa
  objectiveId?: string; // Associação com objetivo
  mode: TimerMode;
  duration: number; // segundos planejados
  timeSpent: number; // segundos efetivos
  completed: boolean;
  pausedCount: number;
  startedAt: Date;
  completedAt?: Date;
  notes?: string;
}
```

## 2. Schema do Banco de Dados

### 2.1 Tabela pomodoro_sessions
```sql
create table pomodoro_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  task_id uuid references micro_tasks, -- opcional
  objective_id uuid references objectives, -- opcional
  sub_objective_id uuid references sub_objectives, -- opcional
  
  -- Timer info
  mode text check (mode in ('work', 'short_break', 'long_break')) not null,
  planned_duration integer not null, -- em segundos
  actual_duration integer, -- em segundos (pode ser menor se interrompido)
  
  -- Session status
  status text check (status in ('in_progress', 'completed', 'cancelled', 'paused')) default 'in_progress',
  completed boolean default false,
  
  -- Metrics
  pause_count integer default 0,
  pause_duration integer default 0, -- tempo total em pausa
  
  -- Timestamps
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  
  -- Context
  notes text,
  distraction_count integer default 0, -- quantas vezes se distraiu
  
  created_at timestamp with time zone default now()
);

-- Indexes
CREATE INDEX idx_pomodoro_sessions_user ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_task ON pomodoro_sessions(task_id);
CREATE INDEX idx_pomodoro_sessions_date ON pomodoro_sessions(started_at);
CREATE INDEX idx_pomodoro_sessions_user_date ON pomodoro_sessions(user_id, started_at);
```

### 2.2 Tabela time_entries (para tracking contínuo)
```sql
create table time_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  task_id uuid references micro_tasks,
  objective_id uuid references objectives,
  
  -- Time tracking
  description text,
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone,
  duration_minutes integer, -- calculado automaticamente
  
  -- Categorization
  entry_type text check (entry_type in ('pomodoro', 'manual', 'automatic')) default 'pomodoro',
  billable boolean default false,
  
  -- Optional pomodoro reference
  pomodoro_session_id uuid references pomodoro_sessions,
  
  created_at timestamp with time zone default now()
);

-- Indexes
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(started_at);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
```

### 2.3 Tabela productivity_stats (cache de métricas)
```sql
create table productivity_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  
  -- Date period
  stat_date date not null,
  period_type text check (period_type in ('daily', 'weekly', 'monthly')) not null,
  
  -- Pomodoro metrics
  total_pomodoros integer default 0,
  completed_pomodoros integer default 0,
  cancelled_pomodoros integer default 0,
  total_focus_minutes integer default 0,
  
  -- Break metrics
  total_breaks integer default 0,
  total_break_minutes integer default 0,
  
  -- Efficiency
  completion_rate decimal(5,2) default 0, -- porcentagem
  average_pomodoro_duration integer, -- em minutos
  
  -- Procrastination detection
  procrastination_score integer default 0, -- 0-100
  distraction_count integer default 0,
  pause_count integer default 0,
  
  -- Streak
  current_streak integer default 0,
  is_productive_day boolean default false,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, stat_date, period_type)
);

-- Indexes
CREATE INDEX idx_productivity_stats_user ON productivity_stats(user_id);
CREATE INDEX idx_productivity_stats_date ON productivity_stats(stat_date);
```

## 3. Hooks Principais

### 3.1 usePomodoro Hook
```typescript
interface PomodoroConfig {
  workDuration: number; // segundos (default: 1500 = 25min)
  shortBreakDuration: number; // segundos (default: 300 = 5min)
  longBreakDuration: number; // segundos (default: 900 = 15min)
  pomodorosUntilLongBreak: number; // default: 4
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

interface PomodoroState {
  mode: TimerMode;
  timeRemaining: number; // segundos
  isRunning: boolean;
  isPaused: boolean;
  currentPomodoroCount: number;
  totalFocusTimeToday: number; // segundos
  currentSession: PomodoroSession | null;
}

interface PomodoroActions {
  start: (taskId?: string, objectiveId?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skip: () => void;
  reset: () => void;
}

const usePomodoro = (config?: Partial<PomodoroConfig>): [PomodoroState, PomodoroActions];
```

### 3.2 useTimeTracking Hook
```typescript
interface TimeTrackingState {
  todayStats: DailyStats;
  weekStats: WeeklyStats;
  monthStats: MonthlyStats;
  currentTask: Task | null;
  isTracking: boolean;
}

interface TimeTrackingActions {
  startTracking: (taskId: string) => void;
  stopTracking: () => void;
  getTaskTime: (taskId: string) => number; // minutos
  getObjectiveTime: (objectiveId: string) => number; // minutos
  exportData: (format: 'csv' | 'json', startDate: Date, endDate: Date) => Promise<string>;
}

interface DailyStats {
  totalPomodoros: number;
  totalFocusMinutes: number;
  completedTasks: number;
  productivityScore: number; // 0-100
}

const useTimeTracking = (): [TimeTrackingState, TimeTrackingActions];
```

## 4. Componentes Principais

### 4.1 PomodoroTimer (Tela Completa)
```typescript
interface PomodoroTimerProps {
  taskId?: string;
  objectiveId?: string;
  onComplete?: (session: PomodoroSession) => void;
  onCancel?: () => void;
}

// Layout:
// ┌──────────────────────────────┐
// │        Timer Circular        │
// │         24:59                │
// │      [progress ring]         │
// ├──────────────────────────────┤
// │  Tarefa: Fazer relatório     │
// ├──────────────────────────────┤
// │    [START] [PAUSE] [RESET]   │
// ├──────────────────────────────┤
// │   Focus  ●  ●  ○  ○          │
// │   (2/4 completed)            │
// └──────────────────────────────┘
```

### 4.2 PomodoroWidget (Mini Timer)
```typescript
interface PomodoroWidgetProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  expandable?: boolean;
}

// Layout Compacto:
// ┌──────────┐
// │ 🍅 24:59 │
// └──────────┘

// Layout Expandido:
// ┌──────────────────┐
// │     24:59        │
// │ [▶] [⏸] [⏹]    │
// │ Focus Mode       │
// └──────────────────┘
```

### 4.3 TimeTrackingDashboard
```typescript
interface TimeTrackingDashboardProps {
  period?: 'day' | 'week' | 'month';
  onPeriodChange?: (period: string) => void;
}

// Widgets:
// 1. Stats Cards: Total Time, Pomodoros, Tasks, Streak
// 2. Daily Chart: Bar chart de pomodoros/dia
// 3. Objective Distribution: Pie chart ou treemap
// 4. Productivity Heatmap: Grid de 365 dias
// 5. Recent Sessions: Lista das últimas 10 sessões
```

### 4.4 TaskTimeReport
```typescript
interface TaskTimeReportProps {
  taskId: string;
  showSessions?: boolean;
}

// Mostra:
// - Tempo total gasto
// - Número de pomodoros
// - Média por sessão
// - Histórico de sessões
// - Comparação com estimativa
```

## 5. Web Worker para Timer

### 5.1 Implementação pomodoroWorker.ts
```typescript
// pomodoroWorker.ts
interface WorkerMessage {
  type: 'START' | 'PAUSE' | 'RESUME' | 'STOP' | 'TICK';
  payload?: {
    duration?: number;
    startTime?: number;
  };
}

interface WorkerResponse {
  type: 'TICK' | 'COMPLETE' | 'ERROR';
  payload: {
    timeRemaining: number;
    progress: number;
  };
}

// O worker mantém o timer rodando mesmo quando a aba não está focada
let timerInterval: number | null = null;
let endTime: number = 0;
let isRunning = false;

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'START':
      endTime = Date.now() + (payload?.duration || 25 * 60) * 1000;
      isRunning = true;
      startTimer();
      break;
      
    case 'PAUSE':
      isRunning = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      break;
      
    case 'RESUME':
      isRunning = true;
      startTimer();
      break;
      
    case 'STOP':
      isRunning = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      break;
  }
};

function startTimer() {
  timerInterval = self.setInterval(() => {
    if (!isRunning) return;
    
    const now = Date.now();
    const timeRemaining = Math.max(0, Math.ceil((endTime - now) / 1000));
    const totalDuration = 25 * 60; // Deve vir do estado
    const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;
    
    self.postMessage({
      type: 'TICK',
      payload: { timeRemaining, progress }
    });
    
    if (timeRemaining <= 0) {
      isRunning = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      self.postMessage({ type: 'COMPLETE' });
    }
  }, 1000);
}
```

## 6. Service Worker (Background)

### 6.1 Funcionalidades
```typescript
// service-worker.ts

// 1. Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'pomodoro-sync') {
    event.waitUntil(syncPomodoroSessions());
  }
});

// 2. Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.tag,
      requireInteraction: true,
      actions: [
        { action: 'start-break', title: 'Start Break' },
        { action: 'skip', title: 'Skip' }
      ]
    })
  );
});

// 3. Timer em Background
let backgroundTimer: number | null = null;

self.addEventListener('message', (event) => {
  if (event.data.type === 'START_BACKGROUND_TIMER') {
    startBackgroundTimer(event.data.duration);
  }
});

function startBackgroundTimer(duration: number) {
  const endTime = Date.now() + duration * 1000;
  
  backgroundTimer = self.setInterval(() => {
    const remaining = endTime - Date.now();
    
    if (remaining <= 0) {
      clearInterval(backgroundTimer!);
      // Notificar todas as abas/clientes
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'TIMER_COMPLETE' });
        });
      });
    }
  }, 1000);
}
```

## 7. Algoritmo de Detecção de Procrastinação

### 7.1 Cálculo do Score
```typescript
interface ProcrastinationSignals {
  pauseCount: number; // quantas pausas deu
  averagePauseDuration: number; // tempo médio de pausa
  sessionCancellations: number; // sessões canceladas
  shortSessions: number; // sessões < 50% do tempo
  longBreaks: number; // breaks muito longos
  timeSinceLastActivity: number; // tempo ocioso
}

function calculateProcrastinationScore(signals: ProcrastinationSignals): number {
  let score = 0;
  
  // Pauses excessivos (> 3 por sessão)
  if (signals.pauseCount > 3) {
    score += Math.min(30, (signals.pauseCount - 3) * 5);
  }
  
  // Pausas muito longas (> 2 min)
  if (signals.averagePauseDuration > 120) {
    score += Math.min(25, (signals.averagePauseDuration - 120) / 10);
  }
  
  // Sessões canceladas
  score += signals.sessionCancellations * 10;
  
  // Sessões curtas (procrastinação)
  score += signals.shortSessions * 15;
  
  // Breaks muito longos
  if (signals.longBreaks > 0) {
    score += signals.longBreaks * 10;
  }
  
  // Tempo ocioso (> 10 min sem atividade)
  if (signals.timeSinceLastActivity > 600) {
    score += Math.min(20, (signals.timeSinceLastActivity - 600) / 60);
  }
  
  return Math.min(100, Math.round(score));
}

// Alert levels
function getAlertLevel(score: number): 'none' | 'low' | 'medium' | 'high' {
  if (score < 20) return 'none';
  if (score < 40) return 'low';
  if (score < 70) return 'medium';
  return 'high';
}
```

### 7.2 Ações Baseadas no Score
```typescript
interface ProcrastinationIntervention {
  level: 'low' | 'medium' | 'high';
  message: string;
  action?: 'notification' | 'vibration' | 'suggestion' | 'break';
  suggestion?: string;
}

const interventions: ProcrastinationIntervention[] = [
  {
    level: 'low',
    message: 'Você pausou algumas vezes. Que tal retomar o foco?',
    action: 'notification'
  },
  {
    level: 'medium',
    message: 'Detectei alguma procrastinação. Que tal uma técnica de foco?',
    action: 'suggestion',
    suggestion: 'Tente a técnica dos 2 minutos: trabalhe apenas 2 minutos e veja se continua.'
  },
  {
    level: 'high',
    message: 'Parece que você está procrastinando bastante. Que tal uma pausa consciente?',
    action: 'break',
    suggestion: 'Faça uma pausa de 5 minutos, alongue-se e volte com mais energia.'
  }
];
```

## 8. Visualizações e Gráficos

### 8.1 Gráfico de Pomodoros Diários
```typescript
// Recharts implementation
const DailyPomodoroChart = ({ data }: { data: DailyData[] }) => (
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="completed" fill="#10B981" name="Completados" />
    <Bar dataKey="cancelled" fill="#EF4444" name="Cancelados" />
  </BarChart>
);
```

### 8.2 Heatmap de Produtividade (GitHub-style)
```typescript
interface HeatmapData {
  date: string;
  level: 0 | 1 | 2 | 3 | 4; // 0 = nada, 4 = muito produtivo
}

// Cores por nível
const HEATMAP_COLORS = {
  0: '#E5E7EB', // gray-200
  1: '#BBF7D0', // green-200
  2: '#4ADE80', // green-400
  3: '#22C55E', // green-500
  4: '#15803D', // green-700
};

// Lógica de nível baseado em pomodoros
function getProductivityLevel(pomodoroCount: number): 0 | 1 | 2 | 3 | 4 {
  if (pomodoroCount === 0) return 0;
  if (pomodoroCount <= 2) return 1;
  if (pomodoroCount <= 4) return 2;
  if (pomodoroCount <= 6) return 3;
  return 4;
}
```

### 8.3 Gráfico de Distribuição por Objetivo
```typescript
// Treemap ou Pie Chart
const ObjectiveTimeDistribution = ({ data }: { data: ObjectiveTime[] }) => (
  <PieChart>
    <Pie
      data={data}
      dataKey="minutes"
      nameKey="objectiveTitle"
      cx="50%"
      cy="50%"
      outerRadius={100}
      label
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
);
```

## 9. Notificações

### 9.1 Browser Notifications
```typescript
class NotificationService {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  notify(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options
      });
    }
  }
  
  // Sons
  playSound(type: 'start' | 'complete' | 'break'): void {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.play().catch(() => {});
  }
}
```

### 9.2 Push Notifications (Mobile)
```typescript
// Registrar service worker para push
async function registerPushNotifications(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  
  const registration = await navigator.serviceWorker.register('/service-worker.js');
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  
  // Salvar subscription no Supabase
  await supabase.from('push_subscriptions').upsert({
    user_id: currentUser.id,
    subscription: JSON.stringify(subscription)
  });
}
```

## 10. Exportação de Dados

### 10.1 Exportação CSV
```typescript
async function exportToCSV(startDate: Date, endDate: Date): Promise<string> {
  const { data: sessions } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString())
    .order('started_at', { ascending: true });
  
  if (!sessions) return '';
  
  const headers = ['Date', 'Start Time', 'Duration (min)', 'Mode', 'Task', 'Completed'];
  const rows = sessions.map(s => [
    format(s.started_at, 'yyyy-MM-dd'),
    format(s.started_at, 'HH:mm:ss'),
    Math.round(s.actual_duration / 60),
    s.mode,
    s.task_id || 'N/A',
    s.completed ? 'Yes' : 'No'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
```

### 10.2 Exportação JSON
```typescript
async function exportToJSON(startDate: Date, endDate: Date): Promise<object> {
  const { data: sessions } = await supabase
    .from('pomodoro_sessions')
    .select(`
      *,
      task:micro_tasks(title),
      objective:objectives(title)
    `)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString());
  
  const stats = await calculateStats(sessions || []);
  
  return {
    exportDate: new Date().toISOString(),
    period: { start: startDate, end: endDate },
    summary: stats,
    sessions: sessions || []
  };
}
```

## 11. Integração com Outras Features

### 11.1 Integração com Gamificação
```typescript
// Ao completar um pomodoro
async function onPomodoroComplete(session: PomodoroSession) {
  // XP base
  const baseXP = 10;
  
  // Bônus por streak
  const streakBonus = Math.min(session.currentStreak * 2, 20);
  
  // Bônus por completar sem pausas
  const noPauseBonus = session.pause_count === 0 ? 5 : 0;
  
  const totalXP = baseXP + streakBonus + noPauseBonus;
  
  // Adicionar XP
  await addXp(totalXP, 'pomodoro_completed', `Pomodoro completado: ${session.mode}`);
  
  // Verificar conquistas
  await checkAchievements('pomodoro', {
    totalCompleted: await getTotalPomodorosCompleted(),
    streak: session.currentStreak
  });
}
```

### 11.2 Integração com Objectives
```typescript
// Atualizar tempo gasto no objetivo
async function updateObjectiveTime(objectiveId: string, durationMinutes: number) {
  const { data: objective } = await supabase
    .from('objectives')
    .select('time_spent_minutes, estimated_minutes')
    .eq('id', objectiveId)
    .single();
  
  if (!objective) return;
  
  const newTime = (objective.time_spent_minutes || 0) + durationMinutes;
  const progress = Math.min(100, (newTime / objective.estimated_minutes) * 100);
  
  await supabase
    .from('objectives')
    .update({
      time_spent_minutes: newTime,
      progress_percentage: progress
    })
    .eq('id', objectiveId);
}
```

## 12. Testes

### 12.1 Testes de Precisão do Timer
```typescript
describe('Pomodoro Timer Accuracy', () => {
  it('should not drift more than 1 second over 25 minutes', async () => {
    const startTime = Date.now();
    const expectedDuration = 25 * 60 * 1000; // 25 min
    
    startTimer(25 * 60);
    await wait(25 * 60 * 1000);
    
    const endTime = Date.now();
    const drift = Math.abs((endTime - startTime) - expectedDuration);
    
    expect(drift).toBeLessThan(1000); // < 1s drift
  });
});
```

### 12.2 Testes de Background
```typescript
describe('Background Timer', () => {
  it('should continue timer when tab is not focused', async () => {
    // Simular tab não focada
    Object.defineProperty(document, 'hidden', { value: true });
    
    startTimer(60);
    await wait(5000);
    
    // Timer deve ter continuado
    expect(getTimeRemaining()).toBeLessThan(55);
  });
});
```

### 12.3 Testes de Persistência
```typescript
describe('Session Persistence', () => {
  it('should save session to Supabase on complete', async () => {
    const mockSession = createMockSession();
    
    await completeSession(mockSession);
    
    const savedSession = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('id', mockSession.id)
      .single();
    
    expect(savedSession.data).toBeDefined();
    expect(savedSession.data.completed).toBe(true);
  });
});
```

## 13. Configurações Avançadas

### 13.1 Customização Completa
```typescript
interface AdvancedPomodoroConfig extends PomodoroConfig {
  // Tempos customizados
  workDurations: number[]; // [1500, 1800, 2400, 3600] - 25, 30, 40, 60 min
  breakDurations: number[]; // [300, 600, 900] - 5, 10, 15 min
  
  // Alertas
  alertBeforeEnd: number; // segundos antes do fim (0 = desligado)
  vibrationEnabled: boolean;
  
  // Visual
  showProgressBar: boolean;
  showTimerInTitle: boolean;
  theme: 'light' | 'dark' | 'auto';
  
  // Comportamento
  pauseOnIdle: boolean; // pausar se detectar inatividade
  idleThreshold: number; // segundos de inatividade
  autoPauseOnLoseFocus: boolean;
}
```

## 14. Performance Considerations

### 14.1 Otimizações
- Usar Web Worker para timer (não bloqueia main thread)
- Service Worker para background sync
- LocalStorage para estado offline
- Debounce em atualizações de UI
- Lazy load de gráficos e relatórios
- Memoização de cálculos de estatísticas

### 14.2 Battery Optimization (Mobile)
- Reduzir frequência de atualizações quando em background
- Usar Page Visibility API para pausar atualizações visuais
- Batch de operações de banco de dados
- Throttle em notificações

## 15. Cronograma Sugerido

### Semana 1: Fundação
- Setup do Web Worker
- Schema do banco
- Hook usePomodoro básico

### Semana 2: Timer Core
- PomodoroTimer component
- Controles (start/pause/stop)
- Sons e notificações básicas

### Semana 3: Widget e Background
- PomodoroWidget
- Service Worker
- Background timer

### Semana 4: Time Tracking
- Associação com tarefas
- timeTrackingService
- Persistência de sessões

### Semana 5: Dashboard
- Gráficos e visualizações
- Stats aggregation
- Heatmap

### Semana 6: Procrastinação
- Algoritmo de detecção
- Alertas e intervenções
- Modo anti-procrastinação

### Semana 7: Relatórios
- Histórico de sessões
- Relatórios semanais/mensais
- Exportação de dados

### Semana 8: Integração e Testes
- Integração com gamificação
- Testes mobile
- Performance optimization
- Deploy
