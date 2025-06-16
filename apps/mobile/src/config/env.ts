import {z} from "zod";

/**
 * 現代的な環境変数管理 - TypeScript + Zod バリデーション
 * Expo SDK 52+ EXPO_PUBLIC_ システムを使用
 */

const envSchema = z.object({
  // Firebase 設定
  EXPO_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "Firebase API Key is required"),
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, "Firebase Auth Domain is required"),
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "Firebase Project ID is required"),
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, "Firebase Storage Bucket is required"),
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, "Firebase Messaging Sender ID is required"),
  EXPO_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "Firebase App ID is required"),

  // 環境設定
  EXPO_PUBLIC_ENVIRONMENT: z.enum(["development", "staging", "production"]).default("development"),

  // Firebase エミュレータ設定（開発時のみ）
  EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
  EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT: z.string().optional(),
  EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST: z.string().optional(),
  EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT: z.string().optional(),
  EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST: z.string().optional(),
  EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * 環境変数を検証して返す
 * 不正な設定がある場合は起動時にエラーとして検出
 */
function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);

    // 開発時のみデバッグ情報を表示
    if (parsed.EXPO_PUBLIC_ENVIRONMENT === "development") {
      console.log("🔧 Environment validation passed");
      console.log("🔧 Environment:", parsed.EXPO_PUBLIC_ENVIRONMENT);
      console.log("🔧 Firebase Project:", parsed.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
    }

    return parsed;
  } catch (error) {
    console.error("❌ 環境変数の検証に失敗しました:");
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    throw new Error("Invalid environment configuration. Check your .env file.");
  }
}

// グローバルに利用可能な型安全な環境変数
export const env = validateEnv();

// 便利なヘルパー関数
export const isProduction = env.EXPO_PUBLIC_ENVIRONMENT === "production";
export const isDevelopment = env.EXPO_PUBLIC_ENVIRONMENT === "development";
export const isStaging = env.EXPO_PUBLIC_ENVIRONMENT === "staging";
export const useEmulator = isDevelopment || isStaging;
