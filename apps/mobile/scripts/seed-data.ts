import {initializeApp} from "firebase/app";
import {getFirestore, collection, doc, setDoc, getDoc} from "firebase/firestore";
import {sampleTasks} from "../src/data/sampleTasks";
// Load environment variables
import "dotenv/config";

// Firebase config from environment variables
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedTasks() {
  console.log("📝 Seeding sample tasks...");

  const tasksCollection = collection(db, "tasks");

  for (const task of sampleTasks) {
    try {
      const taskRef = doc(tasksCollection, task.id);

      // Check if task already exists
      const existingTask = await getDoc(taskRef);

      if (!existingTask.exists()) {
        await setDoc(taskRef, {
          text: task.text,
          category: task.category,
          icon: task.icon,
          createdAt: new Date(),
          isActive: true,
        });
        console.log(`✅ Added task: ${task.text.ja} (${task.text.en})`);
      } else {
        console.log(`⏭️  Task already exists: ${task.text.ja}`);
      }
    } catch (error) {
      console.error(`❌ Failed to add task ${task.id}:`, error);
    }
  }
}

async function seedGlobalCounter() {
  console.log("🌍 Initializing global counter...");

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const counterRef = doc(db, "global_counters", today);

  try {
    const existingCounter = await getDoc(counterRef);

    if (!existingCounter.exists()) {
      await setDoc(counterRef, {
        date: today,
        count: 0,
        lastUpdated: new Date(),
      });
      console.log(`✅ Initialized global counter for ${today}`);
    } else {
      console.log(`⏭️  Global counter already exists for ${today}`);
    }
  } catch (error) {
    console.error("❌ Failed to initialize global counter:", error);
  }
}

async function main() {
  console.log("🌱 Starting data seeding...");

  try {
    await seedTasks();
    await seedGlobalCounter();
    console.log("🎉 Data seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  }
}

main();
