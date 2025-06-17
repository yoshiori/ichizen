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
      environment: env.ENVIRONMENT,

      // Firebase 設定
      firebase: {
        projectId: env.FIREBASE_PROJECT_ID,
        apiKey: env.FIREBASE_API_KEY,
        authDomain: env.FIREBASE_AUTH_DOMAIN,
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
        appId: env.FIREBASE_APP_ID,
      },

      // エミュレータ設定（開発時のみ）
      emulator: useEmulator
        ? {
            authHost: env.FIREBASE_AUTH_EMULATOR_HOST || "10.0.2.2",
            authPort: parseInt(env.FIREBASE_AUTH_EMULATOR_PORT || "9098"),
            firestoreHost: env.FIREBASE_FIRESTORE_EMULATOR_HOST || "10.0.2.2",
            firestorePort: parseInt(env.FIREBASE_FIRESTORE_EMULATOR_PORT || "8080"),
            functionsHost: env.FIREBASE_FUNCTIONS_EMULATOR_HOST || "10.0.2.2",
            functionsPort: parseInt(env.FIREBASE_FUNCTIONS_EMULATOR_PORT || "5001"),
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
