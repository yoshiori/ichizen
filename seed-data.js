// Seed sample data to Firestore
import {initializeApp} from "firebase/app";
import {getFirestore, collection, doc, setDoc} from "firebase/firestore";

const firebaseConfig = {
  projectId: "ichizen-daily-good-deeds",
  apiKey: "AIzaSyAH5s9WzkRGioFhBFAVPlSgTcWT1eY62_k",
  storageBucket: "ichizen-daily-good-deeds.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample tasks
const sampleTasks = [
  {
    id: "task_001",
    text: {
      ja: "ありがとうを言う",
      en: "Say thank you",
    },
    category: {
      ja: "人間関係",
      en: "Relationships",
    },
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "task_002",
    text: {
      ja: "ゴミを一個拾う",
      en: "Pick up one piece of trash",
    },
    category: {
      ja: "環境",
      en: "Environment",
    },
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "task_003",
    text: {
      ja: "近所の人に挨拶をする",
      en: "Greet your neighbors",
    },
    category: {
      ja: "人間関係",
      en: "Relationships",
    },
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "task_004",
    text: {
      ja: "机を掃除する",
      en: "Clean your desk",
    },
    category: {
      ja: "自己ケア",
      en: "Self Care",
    },
    difficulty: "easy",
    isActive: true,
  },
];

async function seedData() {
  try {
    console.log("🌱 Seeding sample data to Firestore...");

    // Add sample tasks
    for (const task of sampleTasks) {
      await setDoc(doc(db, "tasks", task.id), task);
      console.log(`✅ Added task: ${task.text.en}`);
    }

    // Initialize global counter
    await setDoc(doc(db, "globalCounter", "default"), {
      totalDoneCount: 0,
      todayDoneCount: 0,
      lastResetDate: new Date().toISOString().split("T")[0],
    });
    console.log("✅ Initialized global counter");

    console.log("🎉 Seed data completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}

seedData();
