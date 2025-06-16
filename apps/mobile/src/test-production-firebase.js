// Test production Firebase connection
import {initializeApp} from "firebase/app";
import {getAuth, signInAnonymously} from "firebase/auth";
import {getFirestore, doc, setDoc, getDoc, collection, addDoc} from "firebase/firestore";

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

async function testProductionFirebase() {
  console.log("🚀 Testing production Firebase connection...");

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log("✅ Firebase initialized successfully");

    // Test authentication
    console.log("🔐 Testing anonymous authentication...");
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log("✅ Anonymous authentication successful, UID:", user.uid);

    // Test Firestore write
    console.log("📝 Testing Firestore write...");
    const testData = {
      timestamp: new Date(),
      message: "Production Firebase test successful",
      userId: user.uid,
      projectId: "ichizen-daily-good-deeds",
    };

    const docRef = await addDoc(collection(db, "test"), testData);
    console.log("✅ Firestore write successful, Document ID:", docRef.id);

    // Test Firestore read
    console.log("📖 Testing Firestore read...");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("✅ Firestore read successful:", docSnap.data());
    } else {
      throw new Error("Document not found");
    }

    // Add sample task data
    console.log("📋 Adding sample task data...");
    const sampleTask = {
      id: "test-task-1",
      text: {ja: "テスト用善行", en: "Test good deed"},
      category: {ja: "テスト", en: "Test"},
      icon: "🧪",
      difficulty: "easy",
      estimatedTime: 1,
      createdAt: new Date(),
      isActive: true,
    };

    await setDoc(doc(db, "tasks", "test-task-1"), sampleTask);
    console.log("✅ Sample task added successfully");

    // Initialize global counter
    console.log("📊 Initializing global counter...");
    const today = new Date().toISOString().split("T")[0];
    const globalCounterData = {
      date: today,
      totalCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "global_counters", today), globalCounterData);
    console.log("✅ Global counter initialized for:", today);

    console.log("🎉 All production Firebase tests passed successfully!");
  } catch (error) {
    console.error("❌ Production Firebase test failed:", error.message);
    throw error;
  }
}

// Run test
testProductionFirebase()
  .then(() => {
    console.log("Test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
