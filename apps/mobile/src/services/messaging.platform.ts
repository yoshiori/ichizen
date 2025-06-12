/**
 * プラットフォーム分岐によるメッセージングサービス
 * Web環境では代替実装を、モバイル環境では本来の実装を使用
 */

import { Platform } from 'react-native';

// プラットフォーム検出
const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && !(window as any).ReactNativeWebView);

// 条件付きインポート
let messagingService: any;

if (isWeb) {
  // Web環境では代替実装を使用
  messagingService = require('./messaging.web');
  console.log('🌐 Web環境でのメッセージングサービスを初期化しました');
} else {
  // モバイル環境では通常の実装を使用
  messagingService = require('./messaging');
  console.log('📱 モバイル環境でのメッセージングサービスを初期化しました');
}

// 統一されたインターフェースでエクスポート
export const {
  requestNotificationPermission,
  setupTokenRefreshListener,
  setupForegroundMessageListener,
  setupBackgroundMessageListener,
  getInitialNotification,
  setupNotificationOpenedListener
} = messagingService;