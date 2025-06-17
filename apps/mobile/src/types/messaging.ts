// Unified messaging types for cross-platform compatibility

export interface FCMMessage {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
}

export interface MessagingService {
  requestNotificationPermission: () => Promise<string | null>;
  setupTokenRefreshListener: (callback: (token: string) => void) => () => void;
  setupForegroundMessageListener: (callback: (message: FCMMessage) => void) => () => void;
  setupBackgroundMessageListener: () => void;
  getInitialNotification: () => Promise<FCMMessage | null>;
  setupNotificationOpenedListener: (callback: (message: FCMMessage) => void) => () => void;
}
