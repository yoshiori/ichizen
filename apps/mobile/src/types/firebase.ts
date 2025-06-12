export interface User {
  id: string;
  language: 'en' | 'ja';
  fcmToken?: string;
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
  date: string; // YYYY-MM-DD format
  completed: boolean;
  selectedAt: Date;
  completedAt?: Date;
}

export interface GlobalCounter {
  totalCompleted: number;
  todayCompleted: number;
  lastUpdated: Date | { seconds: number; nanoseconds: number };
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface CounterStatistics {
  daily: number;
  weekly: number;
  monthly: number;
  weekStart?: Date;
  monthStart?: Date;
  lastCalculated: Date;
}

export interface GlobalCounterWithStats extends GlobalCounter {
  statistics?: CounterStatistics;
}