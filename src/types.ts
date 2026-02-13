export interface Task {
  id: string;
  title: string;
  completed: boolean;
  goalId?: string;
  category?: string;
  estimated_pomodoros?: number;
  completed_pomodoros?: number;
  project?: string;
  total_minutes_spent?: number;
}

export interface Habit {
  id: string;
  title: string;
  completed: boolean;
  streak: number;
  bestStreak: number;
  totalCompletions: number;
  goal: string;
  icon: string;
  color: string;
  frequency: string[]; // ['D', 'S', 'T'...]
  preferredTime?: string;
  remindersEnabled: boolean;
  streakGoal: number;
  history: boolean[]; // last 30 days
}

export interface DailyRoutine {
  id: string;
  time: string;
  title: string;
  duration?: string;
  icon?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  category: string;
  status: 'on-track' | 'delayed' | 'completed';
}

export interface HeatmapData {
  day: string;
  value: number; // 0 to 4 intensity
}
