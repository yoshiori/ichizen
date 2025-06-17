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

  // React Native Firebase v22 emulator configuration
  try {
    authService.useEmulator(`http://${authHost}:${authPort}`);
    console.log("✅ Auth emulator configured");

    db.useEmulator(firestoreHost, firestorePort);
    console.log("✅ Firestore emulator configured");

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

// Test function for Firebase connectivity
export const testFirebaseConnection = async () => {
  try {
    console.log("🧪 Testing Firebase connection...");

    // Test Auth
    console.log("🧪 Testing Auth service...");
    const currentUser = authService.currentUser;
    console.log("🧪 Current user:", currentUser?.uid || "No user");

    // Test Firestore (simple read)
    console.log("🧪 Testing Firestore service...");
    const testRef = db.collection("test").doc("connectivity");
    await testRef.get();
    console.log("✅ Firestore connection OK");

    console.log("✅ Firebase connection test completed");
  } catch (error) {
    console.error("❌ Firebase connection test failed:", error);
  }
};

// Export Firebase service instances
export const auth = authService;
export {db};
export {cloudFunctions};
