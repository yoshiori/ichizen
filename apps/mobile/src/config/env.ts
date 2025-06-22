import {z} from "zod";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  ENVIRONMENT,
  FIREBASE_ENV,
  FIREBASE_AUTH_EMULATOR_HOST,
  FIREBASE_AUTH_EMULATOR_PORT,
  FIREBASE_FIRESTORE_EMULATOR_HOST,
  FIREBASE_FIRESTORE_EMULATOR_PORT,
  FIREBASE_FUNCTIONS_EMULATOR_HOST,
  FIREBASE_FUNCTIONS_EMULATOR_PORT,
} from "@env";

/**
 * 現代的な環境変数管理 - TypeScript + Zod バリデーション
 * React Native dotenv システムを使用
 */

const envSchema = z.object({
  // Firebase 設定
  FIREBASE_API_KEY: z.string().min(1, "Firebase API Key is required"),
  FIREBASE_AUTH_DOMAIN: z.string().min(1, "Firebase Auth Domain is required"),
  FIREBASE_PROJECT_ID: z.string().min(1, "Firebase Project ID is required"),
  FIREBASE_STORAGE_BUCKET: z.string().min(1, "Firebase Storage Bucket is required"),
  FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, "Firebase Messaging Sender ID is required"),
  FIREBASE_APP_ID: z.string().min(1, "Firebase App ID is required"),

  // 環境設定
  ENVIRONMENT: z.enum(["development", "staging", "production"]).default("development"),
  FIREBASE_ENV: z.enum(["production", "emulator"]).default("production"),

  // Firebase エミュレータ設定（開発時のみ）
  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
  FIREBASE_AUTH_EMULATOR_PORT: z.string().optional(),
  FIREBASE_FIRESTORE_EMULATOR_HOST: z.string().optional(),
  FIREBASE_FIRESTORE_EMULATOR_PORT: z.string().optional(),
  FIREBASE_FUNCTIONS_EMULATOR_HOST: z.string().optional(),
  FIREBASE_FUNCTIONS_EMULATOR_PORT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * 環境変数を検証して返す
 * 不正な設定がある場合は起動時にエラーとして検出
 */
function validateEnv(): Env {
  try {
    const envVars = {
      FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID,
      ENVIRONMENT,
      FIREBASE_ENV,
      FIREBASE_AUTH_EMULATOR_HOST,
      FIREBASE_AUTH_EMULATOR_PORT,
      FIREBASE_FIRESTORE_EMULATOR_HOST,
      FIREBASE_FIRESTORE_EMULATOR_PORT,
      FIREBASE_FUNCTIONS_EMULATOR_HOST,
      FIREBASE_FUNCTIONS_EMULATOR_PORT,
    };

    const parsed = envSchema.parse(envVars);

    // 開発時のみデバッグ情報を表示
    if (parsed.ENVIRONMENT === "development") {
      console.log("🔧 Environment validation passed");
      console.log("🔧 Environment:", parsed.ENVIRONMENT);
      console.log("🔧 Firebase Project:", parsed.FIREBASE_PROJECT_ID);
      console.log("🔧 Firebase Env:", parsed.FIREBASE_ENV);
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
export const isProduction = env.ENVIRONMENT === "production";
export const isDevelopment = env.ENVIRONMENT === "development";
export const isStaging = env.ENVIRONMENT === "staging";
// Emulator mode configuration
export const useEmulator = env.FIREBASE_ENV === "emulator";
