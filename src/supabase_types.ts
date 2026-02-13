export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_description: string | null;
          badge_icon: string;
          badge_id: string;
          badge_name: string;
          earned_at: string | null;
          id: string;
          rarity: string | null;
          user_id: string;
        };
        Insert: {
          badge_description?: string | null;
          badge_icon: string;
          badge_id: string;
          badge_name: string;
          earned_at?: string | null;
          id?: string;
          rarity?: string | null;
          user_id: string;
        };
        Update: {
          badge_description?: string | null;
          badge_icon?: string;
          badge_id?: string;
          badge_name?: string;
          earned_at?: string | null;
          id?: string;
          rarity?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      daily_quests: {
        Row: {
          completed: boolean | null;
          created_at: string | null;
          current_count: number | null;
          id: string;
          quest_date: string;
          quest_type: string;
          target_count: number;
          user_id: string;
          xp_reward: number;
        };
        Insert: {
          completed?: boolean | null;
          created_at?: string | null;
          current_count?: number | null;
          id?: string;
          quest_date: string;
          quest_type: string;
          target_count: number;
          user_id: string;
          xp_reward: number;
        };
        Update: {
          completed?: boolean | null;
          created_at?: string | null;
          current_count?: number | null;
          id?: string;
          quest_date?: string;
          quest_type?: string;
          target_count?: number;
          user_id?: string;
          xp_reward?: number;
        };
        Relationships: [];
      };
      daily_routines: {
        Row: {
          created_at: string | null;
          duration: string | null;
          icon: string | null;
          id: string;
          time_start: string;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          duration?: string | null;
          icon?: string | null;
          id?: string;
          time_start: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          duration?: string | null;
          icon?: string | null;
          id?: string;
          time_start?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          category: string | null;
          created_at: string | null;
          current_value: number | null;
          deadline: string | null;
          description: string | null;
          id: string;
          metric: string;
          status: string | null;
          target_value: number;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          current_value?: number | null;
          deadline?: string | null;
          description?: string | null;
          id?: string;
          metric: string;
          status?: string | null;
          target_value: number;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          current_value?: number | null;
          deadline?: string | null;
          description?: string | null;
          id?: string;
          metric?: string;
          status?: string | null;
          target_value?: number;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      habit_checkins: {
        Row: {
          checkin_date: string;
          completed: boolean | null;
          created_at: string | null;
          habit_id: string;
          id: string;
          notes: string | null;
          user_id: string;
          xp_earned: number | null;
        };
        Insert: {
          checkin_date: string;
          completed?: boolean | null;
          created_at?: string | null;
          habit_id: string;
          id?: string;
          notes?: string | null;
          user_id: string;
          xp_earned?: number | null;
        };
        Update: {
          checkin_date?: string;
          completed?: boolean | null;
          created_at?: string | null;
          habit_id?: string;
          id?: string;
          notes?: string | null;
          user_id?: string;
          xp_earned?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'habit_checkins_habit_id_fkey';
            columns: ['habit_id'];
            isOneToOne: false;
            referencedRelation: 'habit_stats';
            referencedColumns: ['habit_id'];
          },
          {
            foreignKeyName: 'habit_checkins_habit_id_fkey';
            columns: ['habit_id'];
            isOneToOne: false;
            referencedRelation: 'habits';
            referencedColumns: ['id'];
          },
        ];
      };
      habit_streaks: {
        Row: {
          created_at: string | null;
          end_date: string | null;
          habit_id: string;
          id: string;
          is_current: boolean | null;
          length: number | null;
          start_date: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          end_date?: string | null;
          habit_id: string;
          id?: string;
          is_current?: boolean | null;
          length?: number | null;
          start_date: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          end_date?: string | null;
          habit_id?: string;
          id?: string;
          is_current?: boolean | null;
          length?: number | null;
          start_date?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'habit_streaks_habit_id_fkey';
            columns: ['habit_id'];
            isOneToOne: false;
            referencedRelation: 'habit_stats';
            referencedColumns: ['habit_id'];
          },
          {
            foreignKeyName: 'habit_streaks_habit_id_fkey';
            columns: ['habit_id'];
            isOneToOne: false;
            referencedRelation: 'habits';
            referencedColumns: ['id'];
          },
        ];
      };
      habits: {
        Row: {
          best_streak: number | null;
          color: string | null;
          created_at: string | null;
          current_streak: number | null;
          frequency: string[] | null;
          goal_description: string | null;
          history: Json | null;
          icon: string | null;
          id: string;
          preferred_time: string | null;
          reminders_enabled: boolean | null;
          streak_count: number | null;
          streak_goal: number | null;
          title: string;
          total_completions: number | null;
          updated_at: string | null;
          user_id: string;
          xp_reward: number | null;
        };
        Insert: {
          best_streak?: number | null;
          color?: string | null;
          created_at?: string | null;
          current_streak?: number | null;
          frequency?: string[] | null;
          goal_description?: string | null;
          history?: Json | null;
          icon?: string | null;
          id?: string;
          preferred_time?: string | null;
          reminders_enabled?: boolean | null;
          streak_count?: number | null;
          streak_goal?: number | null;
          title: string;
          total_completions?: number | null;
          updated_at?: string | null;
          user_id: string;
          xp_reward?: number | null;
        };
        Update: {
          best_streak?: number | null;
          color?: string | null;
          created_at?: string | null;
          current_streak?: number | null;
          frequency?: string[] | null;
          goal_description?: string | null;
          history?: Json | null;
          icon?: string | null;
          id?: string;
          preferred_time?: string | null;
          reminders_enabled?: boolean | null;
          streak_count?: number | null;
          streak_goal?: number | null;
          title?: string;
          total_completions?: number | null;
          updated_at?: string | null;
          user_id?: string;
          xp_reward?: number | null;
        };
        Relationships: [];
      };
      level_thresholds: {
        Row: {
          level: number;
          title: string;
          xp_required: number;
        };
        Insert: {
          level: number;
          title: string;
          xp_required: number;
        };
        Update: {
          level?: number;
          title?: string;
          xp_required?: number;
        };
        Relationships: [];
      };
      micro_tasks: {
        Row: {
          assigned_date: string | null;
          completed_at: string | null;
          completed_pomodoros: number | null;
          created_at: string | null;
          description: string | null;
          estimated_minutes: number | null;
          estimated_pomodoros: number | null;
          id: string;
          objective_id: string;
          order_index: number | null;
          project: string | null;
          status: string | null;
          sub_objective_id: string;
          tags: string[] | null;
          title: string;
          total_minutes_spent: number | null;
          updated_at: string | null;
          user_id: string;
          xp_reward: number | null;
        };
        Insert: {
          assigned_date?: string | null;
          completed_at?: string | null;
          completed_pomodoros?: number | null;
          created_at?: string | null;
          description?: string | null;
          estimated_minutes?: number | null;
          estimated_pomodoros?: number | null;
          id?: string;
          objective_id: string;
          order_index?: number | null;
          project?: string | null;
          status?: string | null;
          sub_objective_id: string;
          tags?: string[] | null;
          title: string;
          total_minutes_spent?: number | null;
          updated_at?: string | null;
          user_id: string;
          xp_reward?: number | null;
        };
        Update: {
          assigned_date?: string | null;
          completed_at?: string | null;
          completed_pomodoros?: number | null;
          created_at?: string | null;
          description?: string | null;
          estimated_minutes?: number | null;
          estimated_pomodoros?: number | null;
          id?: string;
          objective_id?: string;
          order_index?: number | null;
          project?: string | null;
          status?: string | null;
          sub_objective_id?: string;
          tags?: string[] | null;
          title?: string;
          total_minutes_spent?: number | null;
          updated_at?: string | null;
          user_id?: string;
          xp_reward?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'micro_tasks_objective_id_fkey';
            columns: ['objective_id'];
            isOneToOne: false;
            referencedRelation: 'objectives';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'micro_tasks_sub_objective_id_fkey';
            columns: ['sub_objective_id'];
            isOneToOne: false;
            referencedRelation: 'sub_objectives';
            referencedColumns: ['id'];
          },
        ];
      };
      objectives: {
        Row: {
          created_at: string | null;
          description: string | null;
          due_date: string | null;
          estimated_minutes: number | null;
          id: string;
          priority: string | null;
          progress_percentage: number | null;
          status: string | null;
          time_spent_minutes: number | null;
          title: string;
          updated_at: string | null;
          user_id: string;
          xp_reward: number | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          estimated_minutes?: number | null;
          id?: string;
          priority?: string | null;
          progress_percentage?: number | null;
          status?: string | null;
          time_spent_minutes?: number | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
          xp_reward?: number | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          estimated_minutes?: number | null;
          id?: string;
          priority?: string | null;
          progress_percentage?: number | null;
          status?: string | null;
          time_spent_minutes?: number | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
          xp_reward?: number | null;
        };
        Relationships: [];
      };
      pomodoro_configs: {
        Row: {
          alert_before_end: number | null;
          auto_start_breaks: boolean | null;
          auto_start_pomodoros: boolean | null;
          created_at: string | null;
          id: string;
          long_break_duration: number | null;
          notifications_enabled: boolean | null;
          pomodoros_until_long_break: number | null;
          short_break_duration: number | null;
          show_timer_in_title: boolean | null;
          sound_enabled: boolean | null;
          theme: string | null;
          updated_at: string | null;
          user_id: string;
          vibration_enabled: boolean | null;
          work_duration: number | null;
        };
        Insert: {
          alert_before_end?: number | null;
          auto_start_breaks?: boolean | null;
          auto_start_pomodoros?: boolean | null;
          created_at?: string | null;
          id?: string;
          long_break_duration?: number | null;
          notifications_enabled?: boolean | null;
          pomodoros_until_long_break?: number | null;
          short_break_duration?: number | null;
          show_timer_in_title?: boolean | null;
          sound_enabled?: boolean | null;
          theme?: string | null;
          updated_at?: string | null;
          user_id: string;
          vibration_enabled?: boolean | null;
          work_duration?: number | null;
        };
        Update: {
          alert_before_end?: number | null;
          auto_start_breaks?: boolean | null;
          auto_start_pomodoros?: boolean | null;
          created_at?: string | null;
          id?: string;
          long_break_duration?: number | null;
          notifications_enabled?: boolean | null;
          pomodoros_until_long_break?: number | null;
          short_break_duration?: number | null;
          show_timer_in_title?: boolean | null;
          sound_enabled?: boolean | null;
          theme?: string | null;
          updated_at?: string | null;
          user_id?: string;
          vibration_enabled?: boolean | null;
          work_duration?: number | null;
        };
        Relationships: [];
      };
      pomodoro_sessions: {
        Row: {
          actual_duration: number | null;
          cancelled_at: string | null;
          completed: boolean | null;
          completed_at: string | null;
          created_at: string | null;
          distraction_count: number | null;
          id: string;
          mode: string;
          notes: string | null;
          objective_id: string | null;
          pause_count: number | null;
          pause_duration: number | null;
          planned_duration: number;
          started_at: string | null;
          status: string | null;
          sub_objective_id: string | null;
          task_id: string | null;
          user_id: string;
          xp_earned: number | null;
        };
        Insert: {
          actual_duration?: number | null;
          cancelled_at?: string | null;
          completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string | null;
          distraction_count?: number | null;
          id?: string;
          mode: string;
          notes?: string | null;
          objective_id?: string | null;
          pause_count?: number | null;
          pause_duration?: number | null;
          planned_duration: number;
          started_at?: string | null;
          status?: string | null;
          sub_objective_id?: string | null;
          task_id?: string | null;
          user_id: string;
          xp_earned?: number | null;
        };
        Update: {
          actual_duration?: number | null;
          cancelled_at?: string | null;
          completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string | null;
          distraction_count?: number | null;
          id?: string;
          mode?: string;
          notes?: string | null;
          objective_id?: string | null;
          pause_count?: number | null;
          pause_duration?: number | null;
          planned_duration?: number;
          started_at?: string | null;
          status?: string | null;
          sub_objective_id?: string | null;
          task_id?: string | null;
          user_id?: string;
          xp_earned?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'pomodoro_sessions_objective_id_fkey';
            columns: ['objective_id'];
            isOneToOne: false;
            referencedRelation: 'objectives';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pomodoro_sessions_sub_objective_id_fkey';
            columns: ['sub_objective_id'];
            isOneToOne: false;
            referencedRelation: 'sub_objectives';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pomodoro_sessions_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'micro_tasks';
            referencedColumns: ['id'];
          },
        ];
      };
      productivity_stats: {
        Row: {
          average_pomodoro_duration: number | null;
          cancelled_pomodoros: number | null;
          completed_pomodoros: number | null;
          completion_rate: number | null;
          created_at: string | null;
          current_streak: number | null;
          distraction_count: number | null;
          id: string;
          is_productive_day: boolean | null;
          pause_count: number | null;
          period_type: string;
          procrastination_score: number | null;
          stat_date: string;
          total_break_minutes: number | null;
          total_breaks: number | null;
          total_focus_minutes: number | null;
          total_pomodoros: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          average_pomodoro_duration?: number | null;
          cancelled_pomodoros?: number | null;
          completed_pomodoros?: number | null;
          completion_rate?: number | null;
          created_at?: string | null;
          current_streak?: number | null;
          distraction_count?: number | null;
          id?: string;
          is_productive_day?: boolean | null;
          pause_count?: number | null;
          period_type: string;
          procrastination_score?: number | null;
          stat_date: string;
          total_break_minutes?: number | null;
          total_breaks?: number | null;
          total_focus_minutes?: number | null;
          total_pomodoros?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          average_pomodoro_duration?: number | null;
          cancelled_pomodoros?: number | null;
          completed_pomodoros?: number | null;
          completion_rate?: number | null;
          created_at?: string | null;
          current_streak?: number | null;
          distraction_count?: number | null;
          id?: string;
          is_productive_day?: boolean | null;
          pause_count?: number | null;
          period_type?: string;
          procrastination_score?: number | null;
          stat_date?: string;
          total_break_minutes?: number | null;
          total_breaks?: number | null;
          total_focus_minutes?: number | null;
          total_pomodoros?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      sub_objectives: {
        Row: {
          created_at: string | null;
          description: string | null;
          estimated_minutes: number | null;
          id: string;
          objective_id: string;
          order_index: number | null;
          status: string | null;
          time_spent_minutes: number | null;
          title: string;
          updated_at: string | null;
          user_id: string;
          xp_reward: number | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          estimated_minutes?: number | null;
          id?: string;
          objective_id: string;
          order_index?: number | null;
          status?: string | null;
          time_spent_minutes?: number | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
          xp_reward?: number | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          estimated_minutes?: number | null;
          id?: string;
          objective_id?: string;
          order_index?: number | null;
          status?: string | null;
          time_spent_minutes?: number | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
          xp_reward?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'sub_objectives_objective_id_fkey';
            columns: ['objective_id'];
            isOneToOne: false;
            referencedRelation: 'objectives';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          category: string | null;
          completed: boolean | null;
          created_at: string | null;
          goal_id: string | null;
          id: string;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          completed?: boolean | null;
          created_at?: string | null;
          goal_id?: string | null;
          id?: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category?: string | null;
          completed?: boolean | null;
          created_at?: string | null;
          goal_id?: string | null;
          id?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_goal_id_fkey';
            columns: ['goal_id'];
            isOneToOne: false;
            referencedRelation: 'goals';
            referencedColumns: ['id'];
          },
        ];
      };
      time_entries: {
        Row: {
          billable: boolean | null;
          created_at: string | null;
          description: string | null;
          duration_minutes: number | null;
          ended_at: string | null;
          entry_type: string | null;
          id: string;
          objective_id: string | null;
          pomodoro_session_id: string | null;
          started_at: string;
          task_id: string | null;
          user_id: string;
        };
        Insert: {
          billable?: boolean | null;
          created_at?: string | null;
          description?: string | null;
          duration_minutes?: number | null;
          ended_at?: string | null;
          entry_type?: string | null;
          id?: string;
          objective_id?: string | null;
          pomodoro_session_id?: string | null;
          started_at: string;
          task_id?: string | null;
          user_id: string;
        };
        Update: {
          billable?: boolean | null;
          created_at?: string | null;
          description?: string | null;
          duration_minutes?: number | null;
          ended_at?: string | null;
          entry_type?: string | null;
          id?: string;
          objective_id?: string | null;
          pomodoro_session_id?: string | null;
          started_at?: string;
          task_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'time_entries_objective_id_fkey';
            columns: ['objective_id'];
            isOneToOne: false;
            referencedRelation: 'objectives';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'time_entries_pomodoro_session_id_fkey';
            columns: ['pomodoro_session_id'];
            isOneToOne: false;
            referencedRelation: 'pomodoro_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'time_entries_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'micro_tasks';
            referencedColumns: ['id'];
          },
        ];
      };
      user_stats: {
        Row: {
          created_at: string | null;
          current_level: number | null;
          current_streak: number | null;
          daily_quests_completed: number | null;
          id: string;
          last_active_date: string | null;
          longest_streak: number | null;
          total_habits_completed: number | null;
          total_objectives_completed: number | null;
          total_xp: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          current_level?: number | null;
          current_streak?: number | null;
          daily_quests_completed?: number | null;
          id: string;
          last_active_date?: string | null;
          longest_streak?: number | null;
          total_habits_completed?: number | null;
          total_objectives_completed?: number | null;
          total_xp?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          current_level?: number | null;
          current_streak?: number | null;
          daily_quests_completed?: number | null;
          id?: string;
          last_active_date?: string | null;
          longest_streak?: number | null;
          total_habits_completed?: number | null;
          total_objectives_completed?: number | null;
          total_xp?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      xp_history: {
        Row: {
          amount: number;
          created_at: string | null;
          description: string | null;
          id: string;
          source: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          source: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          source?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      daily_pomodoro_summary: {
        Row: {
          avg_pauses: number | null;
          break_sessions: number | null;
          completed_work_sessions: number | null;
          date: string | null;
          focus_minutes: number | null;
          user_id: string | null;
          work_sessions: number | null;
        };
        Relationships: [];
      };
      habit_stats: {
        Row: {
          best_streak: number | null;
          checkins_last_30_days: number | null;
          habit_id: string | null;
          habit_name: string | null;
          last_checkin_date: string | null;
          streak_count: number | null;
          total_checkins: number | null;
          user_id: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      add_xp: {
        Args: {
          user_uuid: string;
          xp_amount: number;
          xp_description?: string;
          xp_source: string;
        };
        Returns: undefined;
      };
      calculate_daily_stats: {
        Args: { calc_date: string; user_uuid: string };
        Returns: undefined;
      };
      checkin_habit: {
        Args: { checkin_notes?: string; habit_uuid: string };
        Returns: undefined;
      };
      complete_micro_task: { Args: { task_uuid: string }; Returns: undefined };
      complete_objective: {
        Args: { objective_uuid: string };
        Returns: undefined;
      };
      complete_pomodoro_session: {
        Args: { session_uuid: string };
        Returns: undefined;
      };
      get_habit_checkins_month: {
        Args: { habit_uuid: string; year_month: string };
        Returns: {
          checkin_date: string;
          completed: boolean;
        }[];
      };
      get_objective_time_spent: {
        Args: { objective_uuid: string };
        Returns: number;
      };
      get_user_level: { Args: { user_uuid: string }; Returns: number };
      undo_checkin: {
        Args: { checkin_date: string; habit_uuid: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
