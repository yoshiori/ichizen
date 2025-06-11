export interface User {
  id: string;
  language: 'en' | 'ja';
  createdAt: Date;
  lastActiveAt: Date;
}

export interface Task {
  id: string;
  text: {
    en: string;
    ja: string;
  };
  category: {
    en: string;
    ja: string;
  };
  icon: string;
}

export interface DailyTaskHistory {
  id: string;
  userId: string;
  taskId: string;
  completedAt: Date;
  date: string; // YYYY-MM-DD format
}

export interface GlobalCounter {
  totalCompleted: number;
  todayCompleted: number;
  lastUpdated: Date | { seconds: number; nanoseconds: number };
}