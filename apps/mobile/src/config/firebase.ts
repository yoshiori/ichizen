// Modern Firebase configuration with TypeScript safety and Zod validation
import authModule from "@react-native-firebase/auth";
import firestoreModule from "@react-native-firebase/firestore";
import functionsModule from "@react-native-firebase/functions";
import {env, useEmulator} from "./env";

// Initialize services using default instances (auto-initialized from google-services.json)
const authService = authModule();
const db = firestoreModule();
const cloudFunctions = functionsModule();

// Configure Firebase based on environment
console.log("🔧 useEmulator:", useEmulator);
console.log("🔧 env object:", JSON.stringify(env, null, 2));

if (useEmulator) {
  console.log("🔧 Using Firebase Emulator Environment");
  console.log("🔧 Environment:", env.ENVIRONMENT);
  console.log("🔧 Firebase Project:", env.FIREBASE_PROJECT_ID);

  // Type-safe emulator configuration with defaults
  const authHost = env.FIREBASE_AUTH_EMULATOR_HOST || "10.0.2.2";
  const authPort = parseInt(env.FIREBASE_AUTH_EMULATOR_PORT || "9098");
  const firestoreHost = env.FIREBASE_FIRESTORE_EMULATOR_HOST || "10.0.2.2";
  const firestorePort = parseInt(env.FIREBASE_FIRESTORE_EMULATOR_PORT || "8080");
  const functionsHost = env.FIREBASE_FUNCTIONS_EMULATOR_HOST || "10.0.2.2";
  const functionsPort = parseInt(env.FIREBASE_FUNCTIONS_EMULATOR_PORT || "5001");

  console.log(`🔌 Connecting to Auth Emulator: http://${authHost}:${authPort}`);
  console.log(`🔌 Connecting to Firestore Emulator: ${firestoreHost}:${firestorePort}`);
  console.log(`🔌 Connecting to Functions Emulator: ${functionsHost}:${functionsPort}`);

  // React Native Firebase v22 modern emulator configuration
  try {
    // v22 uses connectAuthEmulator for auth
    if (!authService.app.options.projectId) {
      console.warn("⚠️ Project ID not found, using default");
    }

    authService.useEmulator(`http://${authHost}:${authPort}`);
    console.log("✅ Auth emulator configured");

    // v22 uses connectFirestoreEmulator for firestore
    db.useEmulator(firestoreHost, firestorePort);
    console.log("✅ Firestore emulator configured");

    // Functions emulator
    cloudFunctions.useEmulator(functionsHost, functionsPort);
    console.log("✅ Functions emulator configured");
  } catch (error) {
    console.error("❌ Emulator configuration error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
  }
} else {
  console.log("🚀 Using Firebase Production Environment");
  console.log("🚀 Environment:", env.ENVIRONMENT);
  console.log("🚀 Firebase Project:", env.FIREBASE_PROJECT_ID);
}

// Export Firebase service instances
export const auth = authService;
export {db};
export {cloudFunctions};
