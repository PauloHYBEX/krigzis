export type TimerType = 'work' | 'short-break' | 'long-break';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerSession {
  id: string;
  type: TimerType;
  duration: number; // em segundos
  remainingTime: number;
  status: TimerStatus;
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  taskId?: string; // tarefa associada ao timer
}

export interface TimerSettings {
  workDuration: number; // 25 minutos por padrão
  shortBreakDuration: number; // 5 minutos
  longBreakDuration: number; // 15 minutos
  sessionsUntilLongBreak: number; // 4 sessões
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface TimerStats {
  totalSessions: number;
  completedSessions: number;
  totalFocusTime: number; // em segundos
  todayFocusTime: number;
  weekFocusTime: number;
  currentStreak: number;
  bestStreak: number;
} 