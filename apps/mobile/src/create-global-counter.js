// Create global counter document for the app
import {initializeApp} from "firebase/app";
import {getFirestore, doc, setDoc} from "firebase/firestore";
// Load environment variables
import "dotenv/config";

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    (() => {
      throw new Error("EXPO_PUBLIC_FIREBASE_API_KEY environment variable is required");
    })(),
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "ichizen-daily-good-deeds.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "ichizen-daily-good-deeds",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "ichizen-daily-good-deeds.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "179557978249",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:179557978249:web:08a1c5539a35eae9a03658",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-09FFCDS3PG",
};

async function createGlobalCounter() {
  console.log("📊 Creating global counter document...");

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Create global counter document with proper structure
    const globalCounterData = {
      totalCompleted: 5,
      todayCompleted: 3,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };

    await setDoc(doc(db, "global", "counter"), globalCounterData);
    console.log("✅ Global counter document created successfully");
    console.log("   Data:", globalCounterData);
  } catch (error) {
    console.error("❌ Failed to create global counter:", error.message);
    throw error;
  }
}

// Run setup
createGlobalCounter()
  .then(() => {
    console.log("Setup completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
