export interface UsernameHistoryEntry {
  username: string; // Username that was used
  usedFrom: Date; // Start date of usage
  usedUntil?: Date; // End date of usage (undefined if currently in use)
}

export interface User {
  id: string; // Firebase UID (internal use only)
  username?: string; // Current username (unique, public) - backward compatibility
  language: "en" | "ja";
  usernameHistory?: UsernameHistoryEntry[]; // Username change history - backward compatibility
  fcmToken?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

// Collection: "usernames"
// Document ID: username (e.g., "user_abc123")
export interface UsernameDoc {
  userId: string; // Firebase UID of user who owns this username
  createdAt: Date; // Creation timestamp
  isGenerated: boolean; // Auto-generated (true) or user-set (false)
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
  lastUpdated: Date | {seconds: number; nanoseconds: number};
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
