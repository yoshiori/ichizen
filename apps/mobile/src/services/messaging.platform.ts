/**
 * Platform-branched messaging service
 * Uses alternative implementation for web environment, original implementation for mobile environment
 */

import { Platform } from 'react-native';

// Platform detection
const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && !(window as any).ReactNativeWebView);

// Conditional import
let messagingService: any;

if (isWeb) {
  // Use alternative implementation for web environment
  messagingService = require('./messaging.web');
  console.log('🌐 Initialized messaging service for web environment');
} else {
  // Use normal implementation for mobile environment
  messagingService = require('./messaging');
  console.log('📱 Initialized messaging service for mobile environment');
}

// Export with unified interface
export const {
  requestNotificationPermission,
  setupTokenRefreshListener,
  setupForegroundMessageListener,
  setupBackgroundMessageListener,
  getInitialNotification,
  setupNotificationOpenedListener
} = messagingService;