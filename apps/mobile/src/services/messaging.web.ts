/**
 * Web版のメッセージングサービス
 * React Native Firebase MessagingはWeb環境では動作しないため、
 * Web向けの代替実装を提供
 */

/**
 * Request notification permissions and return FCM token (Web版)
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  console.log('Web環境：FCM通知は現在サポートされていません');
  return null;
};

/**
 * Handle token refresh (Web版)
 */
export const setupTokenRefreshListener = (
  onTokenRefresh: (token: string) => void
): (() => void) => {
  console.log('Web環境：トークンリフレッシュリスナーは現在サポートされていません');
  return () => {};
};

/**
 * Handle foreground messages (Web版)
 */
export const setupForegroundMessageListener = (
  onMessage: (message: any) => void
): (() => void) => {
  console.log('Web環境：フォアグラウンドメッセージリスナーは現在サポートされていません');
  return () => {};
};

/**
 * Handle background/quit state messages (Web版)
 */
export const setupBackgroundMessageListener = (): void => {
  console.log('Web環境：バックグラウンドメッセージハンドラーは現在サポートされていません');
};

/**
 * Get initial notification if app was opened from notification (Web版)
 */
export const getInitialNotification = async () => {
  console.log('Web環境：初期通知取得は現在サポートされていません');
  return null;
};

/**
 * Handle notification opened app (Web版)
 */
export const setupNotificationOpenedListener = (
  onNotificationOpened: (message: any) => void
): (() => void) => {
  console.log('Web環境：通知オープンリスナーは現在サポートされていません');
  return () => {};
};