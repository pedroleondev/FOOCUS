
import { Task, Habit, DailyRoutine, Goal, HeatmapData } from './types';

export const COLORS = {
  primary: '#10B981', // Emerald 500
  secondary: '#FF6D00', // Deep Orange
  surface: '#FFFFFF',
  background: '#F5F7FA',
};

export const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Decidir o nome do projeto', completed: true, category: 'ATIVIDADE 1' },
  { id: '2', title: 'Definir guia de estilos visuais', completed: true, category: 'ATIVIDADE 2' },
  { id: '3', title: 'Fazer pesquisa de mercado inicial', completed: false, category: 'ATIVIDADE 3' },
];

export const MOCK_HABITS: Habit[] = [
  { 
    id: 'h1', 
    title: 'Beber Água', 
    goal: '2.5L por dia',
    completed: true, 
    streak: 12, 
    bestStreak: 42,
    totalCompletions: 87,
    icon: 'water_drop',
    color: '#10B981',
    frequency: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    remindersEnabled: true,
    streakGoal: 30,
    history: Array.from({ length: 30 }, () => Math.random() > 0.2)
  },
  { 
    id: 'h2', 
    title: 'Exercícios', 
    goal: '45 min',
    completed: false, 
    streak: 5, 
    bestStreak: 15,
    totalCompletions: 45,
    icon: 'fitness_center',
    color: '#f97316',
    frequency: ['S', 'T', 'Q', 'Q', 'S'],
    remindersEnabled: false,
    streakGoal: 21,
    history: Array.from({ length: 30 }, () => Math.random() > 0.4)
  },
  { 
    id: 'h3', 
    title: 'Leitura Diária', 
    goal: '20 páginas',
    completed: true, 
    streak: 28, 
    bestStreak: 28,
    totalCompletions: 120,
    icon: 'menu_book',
    color: '#3b82f6',
    frequency: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    remindersEnabled: true,
    streakGoal: 100,
    history: Array.from({ length: 30 }, () => Math.random() > 0.1)
  },
];

export const MOCK_ROUTINE: DailyRoutine[] = [
  { id: 'r1', time: '06:00', title: 'Acordar', duration: '15 MIN' },
  { id: 'r2', time: '12:00', title: 'Almoço', duration: '45 MIN' },
  { id: 'r3', time: '15:30', title: 'Dentista', icon: 'medical_services' },
  { id: 'r4', time: '18:45', title: 'Passear com o cachorro', icon: 'pets' },
];

export const MOCK_GOALS: Goal[] = [
  { 
    id: 'g1', 
    title: 'Treinar 5x por semana', 
    description: 'Manter a saúde física e mental.',
    metric: 'sessões', 
    currentValue: 8, 
    targetValue: 10, 
    category: 'Saúde & Bem-estar', 
    status: 'on-track' 
  },
  { 
    id: 'g2', 
    title: 'Ler 12 livros no ano', 
    description: 'Expandir conhecimentos diversos.',
    metric: 'livros', 
    currentValue: 5, 
    targetValue: 12, 
    category: 'Crescimento Pessoal', 
    status: 'delayed' 
  },
];

export const MOCK_HEATMAP: HeatmapData[] = Array.from({ length: 36 }, (_, i) => ({
  day: `D${i}`,
  value: Math.floor(Math.random() * 5),
}));
