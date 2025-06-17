/**
 * Platform-branched messaging service
 * Uses alternative implementation for web environment, original implementation for mobile environment
 */

import {Platform} from "react-native";
import type {MessagingService} from "../types/messaging";

// Platform detection - for React Native apps, always use mobile implementation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isWeb = Platform.OS === "web" && typeof window !== "undefined" && !(window as any).ReactNativeWebView;

// Load appropriate messaging service
const getMessagingService = (): MessagingService => {
  if (isWeb) {
    // Use alternative implementation for web environment
    console.log("🌐 Initialized messaging service for web environment");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./messaging.web") as MessagingService;
  } else {
    // Use normal implementation for mobile environment
    console.log("📱 Initialized messaging service for mobile environment");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./messaging") as MessagingService;
  }
};

const messagingService = getMessagingService();

// Export with unified interface
export const {
  requestNotificationPermission,
  setupTokenRefreshListener,
  setupForegroundMessageListener,
  setupBackgroundMessageListener,
  getInitialNotification,
  setupNotificationOpenedListener,
} = messagingService;
