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

if (USE_EMULATOR) {
  console.log("🔧 Using Firebase Emulator Environment");
  console.log("🔧 FIREBASE_ENV:", FIREBASE_ENV);
  console.log("🔧 USE_EMULATOR:", USE_EMULATOR);
  console.log("🔧 __DEV__:", __DEV__);

  // Configure emulator hosts (Android emulator uses 10.0.2.2 for localhost)
  const authHost = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || "10.0.2.2";
  const authPort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || "9098");
  const firestoreHost = process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST || "10.0.2.2";
  const firestorePort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || "8080");
  const functionsHost = process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST || "10.0.2.2";
  const functionsPort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT || "5001");

  console.log(`🔌 Connecting to Auth Emulator: http://${authHost}:${authPort}`);
  console.log(`🔌 Connecting to Firestore Emulator: ${firestoreHost}:${firestorePort}`);
  console.log(`🔌 Connecting to Functions Emulator: ${functionsHost}:${functionsPort}`);

  // React Native Firebase v22 emulator configuration (synchronous)
  try {
    // Auth emulator connection
    authService.useEmulator(`http://${authHost}:${authPort}`);
    console.log("✅ Auth emulator configured");

    // Firestore emulator connection
    db.useEmulator(firestoreHost, firestorePort);
    console.log("✅ Firestore emulator configured");

    // Functions emulator connection
    cloudFunctions.useEmulator(functionsHost, functionsPort);
    console.log("✅ Functions emulator configured");
  } catch (error) {
    console.error("❌ Emulator configuration error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
  }
} else {
  console.log("🚀 Using Firebase Production Environment");
  // Project ID will be loaded from google-services.json
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
