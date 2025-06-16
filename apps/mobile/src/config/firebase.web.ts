// Web Firebase SDK for Expo compatibility
import {initializeApp} from "firebase/app";
import {getAuth, connectAuthEmulator} from "firebase/auth";
import {getFirestore, connectFirestoreEmulator} from "firebase/firestore";
import {getFunctions, connectFunctionsEmulator} from "firebase/functions";

// Firebase configuration from environment variables
const firebaseConfig = {
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "ichizen-daily-good-deeds",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:179557978249:web:08a1c5539a35eae9a03658",
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    (() => {
      throw new Error("EXPO_PUBLIC_FIREBASE_API_KEY environment variable is required");
    })(),
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "ichizen-daily-good-deeds.firebaseapp.com",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "ichizen-daily-good-deeds.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "179557978249",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("🚀 Firebase Web SDK initialized");

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const cloudFunctions = getFunctions(app, "asia-northeast1");

// Get environment configuration
const FIREBASE_ENV = process.env.EXPO_PUBLIC_FIREBASE_ENV || "production";
const USE_EMULATOR = FIREBASE_ENV === "emulator";

// Connect to emulators if enabled
if (USE_EMULATOR && __DEV__) {
  console.log("🔧 Connecting to Firebase Emulators...");

  const authHost = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || "localhost";
  const authPort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || "9098");
  const firestoreHost = process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST || "localhost";
  const firestorePort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || "8080");
  const functionsHost = process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST || "localhost";
  const functionsPort = parseInt(process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT || "5001");

  connectAuthEmulator(auth, `http://${authHost}:${authPort}`);
  connectFirestoreEmulator(db, firestoreHost, firestorePort);
  connectFunctionsEmulator(cloudFunctions, functionsHost, functionsPort);

  console.log(`🔌 Auth Emulator: http://${authHost}:${authPort}`);
  console.log(`🔌 Firestore Emulator: ${firestoreHost}:${firestorePort}`);
  console.log(`🔌 Functions Emulator: ${functionsHost}:${functionsPort}`);
} else {
  console.log("🚀 Using Firebase Production Environment");
  console.log("📱 Project:", firebaseConfig.projectId);
}
