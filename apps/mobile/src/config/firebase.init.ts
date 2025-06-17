// React Native Firebase v22 - Recommended initialization pattern
import {Platform} from "react-native";
import type {FirebaseAuthTypes} from "@react-native-firebase/auth";
import type {FirebaseFirestoreTypes} from "@react-native-firebase/firestore";
import type {FirebaseFunctionsTypes} from "@react-native-firebase/functions";

// Firebase modules - import but don't initialize yet
let auth: FirebaseAuthTypes.Module | null = null;
let firestore: FirebaseFirestoreTypes.Module | null = null;
let functions: FirebaseFunctionsTypes.Module | null = null;

// Environment configuration
const FIREBASE_ENV = process.env.EXPO_PUBLIC_FIREBASE_ENV || "production";
const USE_EMULATOR = FIREBASE_ENV === "emulator";

// Lazy initialization function
export const initializeFirebase = async () => {
  try {
    // Import React Native Firebase modules
    const authModule = await import("@react-native-firebase/auth");
    const firestoreModule = await import("@react-native-firebase/firestore");
    const functionsModule = await import("@react-native-firebase/functions");

    // Initialize instances
    auth = authModule.default();
    firestore = firestoreModule.default();
    functions = functionsModule.default();

    // Configure emulators if needed
    if (USE_EMULATOR && __DEV__ && Platform.OS === "android") {
      console.log("🔧 Configuring Firebase Emulators...");

      const authHost = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || "10.0.2.2";
      const authPort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || "9098");
      const firestoreHost = process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST || "10.0.2.2";
      const firestorePort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || "8080");
      const functionsHost = process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST || "10.0.2.2";
      const functionsPort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT || "5001");

      // Connect to emulators
      auth.useEmulator(`http://${authHost}:${authPort}`);
      firestore.useEmulator(firestoreHost, firestorePort);
      functions.useEmulator(functionsHost, functionsPort);

      console.log(`🔌 Auth Emulator: http://${authHost}:${authPort}`);
      console.log(`🔌 Firestore Emulator: ${firestoreHost}:${firestorePort}`);
      console.log(`🔌 Functions Emulator: ${functionsHost}:${functionsPort}`);
    } else {
      console.log("🚀 Using Firebase Production Environment");
    }

    console.log("✅ Firebase initialized successfully");
    return {auth, firestore, functions};
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    throw error;
  }
};

// Export getters for Firebase instances
export const getAuth = () => {
  if (!auth) throw new Error("Firebase not initialized. Call initializeFirebase() first.");
  return auth;
};

export const getFirestore = () => {
  if (!firestore) throw new Error("Firebase not initialized. Call initializeFirebase() first.");
  return firestore;
};

export const getFunctions = () => {
  if (!functions) throw new Error("Firebase not initialized. Call initializeFirebase() first.");
  return functions;
};
