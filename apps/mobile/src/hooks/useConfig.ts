import {useMemo} from "react";
import {env, isDevelopment, isProduction, isStaging, useEmulator} from "../config/env";

/**
 * 型安全な設定管理フック
 * 環境に依存する設定値と判定フラグを提供
 */
export function useConfig() {
  return useMemo(
    () => ({
      // 環境判定フラグ
      isDevelopment,
      isProduction,
      isStaging,
      useEmulator,

      // 環境情報
      environment: env.EXPO_PUBLIC_ENVIRONMENT,

      // Firebase 設定
      firebase: {
        projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
      },

      // エミュレータ設定（開発時のみ）
      emulator: useEmulator
        ? {
            authHost: env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || "10.0.2.2",
            authPort: parseInt(env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || "9098"),
            firestoreHost: env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST || "10.0.2.2",
            firestorePort: parseInt(env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || "8080"),
            functionsHost: env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST || "10.0.2.2",
            functionsPort: parseInt(env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT || "5001"),
          }
        : null,

      // デバッグ情報
      debug: {
        showLogs: isDevelopment || isStaging,
        enablePerformanceMonitoring: isProduction,
        enableAnalytics: isProduction,
      },
    }),
    []
  );
}

/**
 * 環境依存の動作をチェックするヘルパー
 */
export function useEnvironmentChecks() {
  const config = useConfig();

  return useMemo(
    () => ({
      shouldShowDebugInfo: config.debug.showLogs,
      shouldUseEmulator: config.useEmulator,
      shouldLogVerbose: config.isDevelopment,
      isProductionBuild: config.isProduction,
    }),
    [config]
  );
}
