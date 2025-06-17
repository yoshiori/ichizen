import messaging from "@react-native-firebase/messaging";
import type {FirebaseMessagingTypes} from "@react-native-firebase/messaging";
import {Platform} from "react-native";

/**
 * Request notification permissions and return FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // Request permission for iOS
    if (Platform.OS === "ios") {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log("Notification permission denied");
        return null;
      }
    }

    // Get FCM token
    const token = await messaging().getToken();
    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

/**
 * Handle token refresh
 */
export const setupTokenRefreshListener = (onTokenRefresh: (token: string) => void): (() => void) => {
  return messaging().onTokenRefresh(onTokenRefresh);
};

/**
 * Handle foreground messages
 */
export const setupForegroundMessageListener = (
  onMessage: (message: FirebaseMessagingTypes.RemoteMessage) => void
): (() => void) => {
  return messaging().onMessage(onMessage);
};

/**
 * Handle background/quit state messages
 */
export const setupBackgroundMessageListener = (): void => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("Background message:", remoteMessage);
  });
};

/**
 * Get initial notification if app was opened from notification
 */
export const getInitialNotification = async () => {
  try {
    const remoteMessage = await messaging().getInitialNotification();
    return remoteMessage;
  } catch (error) {
    console.error("Error getting initial notification:", error);
    return null;
  }
};

/**
 * Handle notification opened app
 */
export const setupNotificationOpenedListener = (
  onNotificationOpened: (message: FirebaseMessagingTypes.RemoteMessage) => void
): (() => void) => {
  return messaging().onNotificationOpenedApp(onNotificationOpened);
};
