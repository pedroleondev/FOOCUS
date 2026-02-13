# Especificação Técnica: Redesign Mobile-First e Gamificação

## 1. Arquitetura de Componentes Mobile

### 1.1 MobileNavigation (Novo)
```typescript
interface MobileNavigationProps {
  activeTab: 'dashboard' | 'habits' | 'objectives' | 'gamification' | 'profile';
  onTabChange: (tab: string) => void;
}
```
- Menu inferior fixo com 5 ícones
- Ícones: 🏠 Dashboard | 📋 Hábitos | 🎯 Objetivos | 🎮 Game | 👤 Perfil
- Touch target: 56px mínimo
- Animação de transição suave entre tabs

### 1.2 Header Mobile (Refatorado)
```typescript
interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  streak?: number;
  xp?: number;
}
```
- Altura compacta (56px)
- Mostra streak e XP no canto
- Botão voltar quando necessário

### 1.3 PullToRefresh (Novo)
- Componente wrapper para atualizar dados
- Feedback visual de loading
- Integrado com Supabase realtime

## 2. Sistema de Gamificação

### 2.1 Schema Supabase
```sql
-- Tabela de estatísticas do usuário
create table user_stats (
  id uuid references auth.users primary key,
  total_xp integer default 0,
  current_level integer default 1,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active_date date,
  daily_quests_completed integer default 0,
  total_habits_completed integer default 0,
  total_objectives_completed integer default 0,
  created_at timestamp with time zone default now()
);

-- Tabela de conquistas/badges
create table achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  badge_id text not null,
  badge_name text not null,
  badge_icon text not null,
  badge_description text,
  earned_at timestamp with time zone default now(),
  rarity text check (rarity in ('common', 'rare', 'epic', 'legendary'))
);

-- Histórico de XP
create table xp_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  amount integer not null,
  source text not null, -- 'habit_completed', 'objective_completed', 'streak_bonus', etc
  description text,
  created_at timestamp with time zone default now()
);

-- Missões diárias
create table daily_quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  quest_type text not null, -- 'complete_habits', 'complete_objectives', 'maintain_streak'
  target_count integer not null,
  current_count integer default 0,
  xp_reward integer not null,
  completed boolean default false,
  quest_date date not null,
  created_at timestamp with time zone default now()
);
```

### 2.2 Hook useGamification
```typescript
interface GamificationState {
  userStats: UserStats | null;
  dailyQuests: DailyQuest[];
  achievements: Achievement[];
  recentXpGains: XpHistory[];
  isLoading: boolean;
}

interface GamificationActions {
  addXp: (amount: number, source: string, description?: string) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  checkAndAwardAchievements: () => Promise<void>;
  generateDailyQuests: () => Promise<void>;
  getLevelProgress: () => { current: number; next: number; percentage: number };
}

const useGamification = (): [GamificationState, GamificationActions]
```

### 2.3 Sistema de Níveis
```typescript
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Iniciante' },
  { level: 2, xp: 100, title: 'Aprendiz' },
  { level: 3, xp: 300, title: 'Disciplinado' },
  { level: 4, xp: 600, title: 'Focado' },
  { level: 5, xp: 1000, title: 'Produtivo' },
  { level: 6, xp: 1500, title: 'Mestre' },
  { level: 7, xp: 2100, title: 'Especialista' },
  { level: 8, xp: 2800, title: 'Expert' },
  { level: 9, xp: 3600, title: 'Mestre Produtivo' },
  { level: 10, xp: 4500, title: 'Lenda' },
];
```

### 2.4 Componente GamificationView
```typescript
interface GamificationViewProps {
  userStats: UserStats;
  dailyQuests: DailyQuest[];
  achievements: Achievement[];
}
```
- Cards de estatísticas principais
- Lista de missões diárias com progresso
- Grid de conquistas desbloqueadas/bloqueadas
- Histórico de XP (últimos 7 dias)
- Animação de level up

## 3. Habit Tracker Redesenhado

### 3.1 Schema Atualizado
```sql
-- Adicionar campo de ícone e cor
alter table habits add column icon text default '✓';
alter table habits add column color text default '#3B82F6';
alter table habits add column streak_count integer default 0;
alter table habits add column best_streak integer default 0;

-- Tabela de check-ins diários
reate table habit_checkins (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits not null,
  user_id uuid references auth.users not null,
  checkin_date date not null,
  completed boolean default true,
  xp_earned integer default 10,
  created_at timestamp with time zone default now(),
  unique(habit_id, checkin_date)
);
```

### 3.2 Componente DaySelector (Novo)
```typescript
interface DaySelectorProps {
  selectedDays: number[]; // 0-6 (dom-sáb)
  onChange: (days: number[]) => void;
  variant: 'creation' | 'display';
}
```
- Visualização em círculos para mobile
- Estados visuais claros: ativo/inativo/completed
- Cores distintas para cada dia
- Animação de toggle

### 3.3 Componente HabitCard (Refatorado)
```typescript
interface HabitCardProps {
  habit: Habit;
  todayCheckin: boolean;
  streak: number;
  onCheckin: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
```
- Layout horizontal compacto
- Botão de check-in grande e centralizado
- Visualização de streak com 🔥
- Menu de ações (editar/deletar) via swipe

### 3.4 HabitTrackerView Mobile
- Lista de hábitos do dia
- Filtro rápido: Todos | Hoje | Semana
- Botão flutuante (FAB) para adicionar
- Progresso diário visual (circular)

## 4. Hierarquia de Objetivos

### 4.1 Schema Supabase
```sql
-- Objetivos principais
create table objectives (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  priority text check (priority in ('high', 'medium', 'low')) default 'medium',
  status text check (status in ('active', 'completed', 'archived')) default 'active',
  due_date date,
  progress_percentage integer default 0,
  xp_reward integer default 50,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Sub-objetivos
create table sub_objectives (
  id uuid default gen_random_uuid() primary key,
  objective_id uuid references objectives not null,
  title text not null,
  description text,
  status text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  order_index integer,
  xp_reward integer default 20,
  created_at timestamp with time zone default now()
);

-- Micro-tarefas (menor nível)
create table micro_tasks (
  id uuid default gen_random_uuid() primary key,
  sub_objective_id uuid references sub_objectives not null,
  objective_id uuid references objectives not null,
  title text not null,
  description text,
  estimated_minutes integer,
  status text check (status in ('pending', 'in_progress', 'completed', 'skipped')) default 'pending',
  assigned_date date,
  completed_at timestamp with time zone,
  xp_reward integer default 5,
  order_index integer,
  created_at timestamp with time zone default now()
);
```

### 4.2 Componente ObjectivesView
```typescript
interface ObjectivesViewProps {
  objectives: Objective[];
  filter: 'all' | 'active' | 'completed' | 'high_priority';
  onCreateObjective: () => void;
  onObjectiveClick: (id: string) => void;
}
```
- Cards de objetivos com progresso visual
- Filtros rápidos em chips
- Ordenação por prioridade/data

### 4.3 Componente ObjectiveDetailView
```typescript
interface ObjectiveDetailViewProps {
  objective: Objective;
  subObjectives: SubObjective[];
  microTasks: MicroTask[];
  onAddSubObjective: () => void;
  onAddMicroTask: (subObjectiveId: string) => void;
  onCompleteItem: (type: 'sub' | 'micro', id: string) => void;
}
```
- Árvore expansível de sub-objetivos
- Micro-tarefas com checkboxes
- Barra de progresso geral
- Botão "Quebrar em tarefas com IA"

## 5. Distribuição Inteligente com IA

### 5.1 Serviço aiTaskBreakdown.ts
```typescript
interface TaskBreakdownRequest {
  objectiveTitle: string;
  objectiveDescription?: string;
  targetDays: number; // Quantos dias para distribuir
  hoursPerDay: number; // Horas disponíveis por dia
}

interface TaskBreakdownResponse {
  subObjectives: {
    title: string;
    description: string;
    estimatedMinutes: number;
  }[];
  distribution: {
    day: string; // 'monday', 'tuesday', etc
    tasks: {
      title: string;
      duration: number;
    }[];
  }[];
}

const breakDownObjective = async (
  request: TaskBreakdownRequest
): Promise<TaskBreakdownResponse>;
```

### 5.2 Prompt para Gemini
```
Você é um especialista em produtividade e gestão de tarefas. 
Dado um objetivo, quebre-o em sub-objetivos menores e micro-tarefas executáveis.

Objetivo: {title}
Descrição: {description}
Prazo: {targetDays} dias
Tempo disponível por dia: {hoursPerDay} horas

Retorne um JSON com:
1. Lista de 3-5 sub-objetivos
2. Para cada sub-objetivo, 2-4 micro-tarefas específicas
3. Distribuição sugerida dos dias da semana considerando:
   - Balanceamento de carga
   - Tarefas complexas em dias com mais tempo
   - Progressão lógica (dependências)

Formato de resposta:
{
  "subObjectives": [
    {
      "title": "...",
      "description": "...",
      "microTasks": [
        {"title": "...", "estimatedMinutes": 30}
      ]
    }
  ],
  "distribution": [
    {"day": "monday", "tasks": [...]}
  ]
}
```

### 5.3 Componente AiTaskSuggestionModal
```typescript
interface AiTaskSuggestionModalProps {
  isOpen: boolean;
  objective: Objective;
  onClose: () => void;
  onAccept: (breakdown: TaskBreakdownResponse) => void;
  onRegenerate: () => void;
}
```
- Loading state com animação
- Preview da sugestão da IA
- Lista editável antes de confirmar
- Opção de regenerar
- Botões: Aplicar | Editar | Cancelar

## 6. Dashboard Gamificado

### 6.1 Layout Mobile
```
┌─────────────────────────────────────┐
│ Header: Nível, XP, Streak           │
├─────────────────────────────────────┤
│ Card: Missões do Dia (3/5)          │
│ Progress bar circular               │
├─────────────────────────────────────┤
│ Objetivo Principal (Foco)           │
│ Progresso + Próxima tarefa          │
├─────────────────────────────────────┤
│ Hábitos de Hoje                     │
│ [Check] [Check] [Check] [Empty]     │
├─────────────────────────────────────┤
│ Objetivos Secundários               │
│ [Card] [Card] [+3 mais]             │
├─────────────────────────────────────┤
│ Feed de Atividades                  │
│ "+10 XP - Hábito concluído"         │
│ "+50 XP - Objetivo completado!"     │
└─────────────────────────────────────┘
```

### 6.2 Componentes do Dashboard
- **DailyQuestsWidget**: Missões com checkboxes
- **FocusObjectiveCard**: Objetivo principal em destaque
- **HabitsQuickView**: Grid de hábitos do dia
- **SecondaryObjectivesList**: Lista compacta
- **ActivityFeed**: Últimas 5 atividades

## 7. Animações e Feedback Visual

### 7.1 Animações Obrigatórias
- **Check-in de hábito**: Scale up + color transition (300ms)
- **Completar tarefa**: Slide out + XP float animation
- **Level up**: Confetti + shake + glow (1s)
- **Streak increase**: Fire animation + number count up
- **Page transition**: Slide from right (mobile)
- **Pull to refresh**: Bounce animation

### 7.2 Bibliotecas Sugeridas
- Framer Motion (React animations)
- React Spring (physics-based)
- Canvas Confetti (celebrations)
- React Native Reanimated (se for RN)

## 8. Performance Mobile

### 8.1 Otimizações
- Lazy loading de imagens e componentes
- Virtualização de listas longas
- Code splitting por rota
- Memoization de componentes caros
- Debounce em inputs
- Throttle em scroll events

### 8.2 Métricas Alvo
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Performance: > 90
- Bundle size: < 200KB (gzipped)

## 9. Acessibilidade

### 9.1 Requisitos WCAG 2.1 AA
- Contraste mínimo 4.5:1
- Touch targets mínimo 44x44px
- Suporte a screen readers
- Navegação por teclado
- Focus indicators visíveis
- Textos redimensionáveis

### 9.2 Testes
- Lighthouse Accessibility audit
- Teste com VoiceOver/TalkBack
- Navegação apenas com teclado
- Teste de contraste com ferramentas

## 10. Testes

### 10.1 Testes Unitários
- Hooks: useGamification, useHabitTracker
- Utils: cálculo de XP, níveis
- Componentes: DaySelector, HabitCard

### 10.2 Testes de Integração
- Fluxo de criação de hábito
- Fluxo de quebra de objetivos com IA
- Sincronização offline/online

### 10.3 Testes E2E (Cypress/Playwright)
- Criar hábito e fazer check-in
- Completar objetivo com sub-tarefas
- Receber conquista
- Navegação entre telas

### 10.4 Testes Mobile
- iOS Safari (iPhone 12, 14, SE)
- Android Chrome (Pixel, Samsung)
- Tablets (iPad, Android)
- Modo landscape/portrait

## 11. Banco de Dados - Migrations

### 11.1 Migration 001: Gamification Tables
```sql
-- Executar no Supabase SQL Editor
-- Criar tabelas de gamificação
-- Ver arquivo: migrations/001_gamification.sql
```

### 11.2 Migration 002: Objectives Hierarchy
```sql
-- Criar tabelas de objetivos hierárquicos
-- Ver arquivo: migrations/002_objectives_hierarchy.sql
```

### 11.3 Migration 003: Habit Tracker Updates
```sql
-- Atualizar tabela habits com novos campos
-- Criar tabela habit_checkins
-- Ver arquivo: migrations/003_habit_tracker_updates.sql
```

## 12. Cronograma Sugerido

### Semana 1: Setup e Prototipação
- Setup do projeto mobile-first
- Wireframes e protótipos
- Schema do banco

### Semana 2: Componentes Base
- MobileNavigation
- Header
- Layout responsivo

### Semana 3: Gamificação
- Sistema de XP e níveis
- Conquistas
- Dashboard gamificado

### Semana 4: Habit Tracker
- DaySelector redesenhado
- Check-in diário
- Streaks

### Semana 5: Objetivos
- CRUD de objetivos
- Hierarquia
- Progress tracking

### Semana 6: IA
- Integração Gemini
- Quebra de objetivos
- Distribuição automática

### Semana 7: Testes e Polish
- Testes mobile
- Performance
- Animações

### Semana 8: Deploy
- Build otimizado
- Testes finais
- Release
