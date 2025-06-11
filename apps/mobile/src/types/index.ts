export interface Task {
  id: string;
  text: {
    ja: string;
    en: string;
  };
  category: 'relationships' | 'environment' | 'selfcare' | 'community' | 'kindness';
  icon: string;
}

export interface GlobalCounterData {
  totalCount?: number;
  todayCount?: number;
}

export type Language = 'ja' | 'en';