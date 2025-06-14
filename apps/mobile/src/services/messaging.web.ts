/**
 * Web version messaging service
 * Provides alternative implementation for web environment
 * since React Native Firebase Messaging doesn't work in web
 */

/**
 * Request notification permissions and return FCM token (Web version)
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  console.log("Web環境：FCM通知は現在サポートされていません");
  return null;
};

/**
 * Handle token refresh (Web version)
 */
export const setupTokenRefreshListener = (onTokenRefresh: (token: string) => void): (() => void) => {
  console.log("Web環境：トークンリフレッシュリスナーは現在サポートされていません");
  return () => {};
};

/**
 * Handle foreground messages (Web version)
 */
export const setupForegroundMessageListener = (onMessage: (message: any) => void): (() => void) => {
  console.log("Web環境：フォアグラウンドメッセージリスナーは現在サポートされていません");
  return () => {};
};

/**
 * Handle background/quit state messages (Web version)
 */
export const setupBackgroundMessageListener = (): void => {
  console.log("Web環境：バックグラウンドメッセージハンドラーは現在サポートされていません");
};

/**
 * Get initial notification if app was opened from notification (Web version)
 */
export const getInitialNotification = async () => {
  console.log("Web環境：初期通知取得は現在サポートされていません");
  return null;
};

/**
 * Handle notification opened app (Web version)
 */
export const setupNotificationOpenedListener = (onNotificationOpened: (message: any) => void): (() => void) => {
  console.log("Web環境：通知オープンリスナーは現在サポートされていません");
  return () => {};
};
