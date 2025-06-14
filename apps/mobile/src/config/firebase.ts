// React Native Firebase v22 configuration with environment switching
import authModule from "@react-native-firebase/auth";
import firestoreModule from "@react-native-firebase/firestore";
import functionsModule from "@react-native-firebase/functions";

// Get environment configuration
const FIREBASE_ENV = process.env.EXPO_PUBLIC_FIREBASE_ENV || "production";
const USE_EMULATOR = FIREBASE_ENV === "emulator";

// Initialize services using default instances (auto-initialized from google-services.json)
const authService = authModule();
const db = firestoreModule();
const cloudFunctions = functionsModule();

if (USE_EMULATOR && __DEV__) {
  console.log("🔧 Using Firebase Emulator Environment");

  // Configure emulator hosts
  const authHost = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || "localhost";
  const authPort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || "9098");
  const firestoreHost = process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST || "localhost";
  const firestorePort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || "8080");
  const functionsHost = process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST || "localhost";
  const functionsPort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT || "5001");

  // Connect to emulators (v22 API)
  authService.useEmulator(`http://${authHost}:${authPort}`);
  db.useEmulator(firestoreHost, firestorePort);
  cloudFunctions.useEmulator(functionsHost, functionsPort);

  console.log(`🔌 Auth Emulator: http://${authHost}:${authPort}`);
  console.log(`🔌 Firestore Emulator: ${firestoreHost}:${firestorePort}`);
  console.log(`🔌 Functions Emulator: ${functionsHost}:${functionsPort}`);
} else {
  console.log("🚀 Using Firebase Production Environment");
  // Project ID will be loaded from google-services.json
}

// Export Firebase service instances
export const auth = authService;
export {db};
export {cloudFunctions};
