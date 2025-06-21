export interface UsernameHistoryEntry {
  username: string; // 使用していたユーザー名
  usedFrom: Date; // 使用開始日時
  usedUntil?: Date; // 使用終了日時（現在使用中なら未設定）
}

export interface User {
  id: string; // Firebase UID (内部用のみ)
  username?: string; // 現在のユーザー名（一意、公開）- backward compatibility
  language: "en" | "ja";
  usernameHistory?: UsernameHistoryEntry[]; // 変更履歴 - backward compatibility
  fcmToken?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

// Collection: "usernames"
// Document ID: ユーザー名（例: "user_abc123"）
export interface UsernameDoc {
  userId: string; // このユーザー名を使用しているユーザーのFirebase UID
  createdAt: Date; // 作成日時
  isGenerated: boolean; // 自動生成（true）かユーザー設定（false）か
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
