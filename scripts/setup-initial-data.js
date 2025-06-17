/**
 * Initial Data Setup Script
 * Sets up sample data in Firestore emulator for development and testing
 */

const {initializeApp} = require("firebase/app");
const {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  writeBatch,
} = require("firebase/firestore");

// Firebase configuration for emulator
const firebaseConfig = {
  projectId: "ichizen-daily-good-deeds",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator (only if not already connected)
if (!db._delegate._databaseId.projectId.includes('emulator')) {
  try {
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("🔧 Connected to Firestore emulator");
  } catch (error) {
    console.log("⚠️  Emulator connection may already be established");
  }
}

async function setupInitialData() {
  console.log("📝 Starting initial data setup...");

  try {
    // 1. Sample task data
    const sampleTasks = [
      {
        id: "task_1",
        text: {ja: "ありがとうを言う", en: "Say thank you"},
        category: {ja: "人間関係", en: "Relationships"},
        icon: "💝",
        difficulty: "easy",
      },
      {
        id: "task_2",
        text: {ja: "ゴミを一個拾う", en: "Pick up one piece of trash"},
        category: {ja: "環境", en: "Environment"},
        icon: "♻️",
        difficulty: "easy",
      },
      {
        id: "task_3",
        text: {ja: "机を掃除する", en: "Clean your desk"},
        category: {ja: "自己ケア", en: "Self-care"},
        icon: "✨",
        difficulty: "medium",
      },
      {
        id: "task_4",
        text: {ja: "近所の人に挨拶をする", en: "Greet a neighbor"},
        category: {ja: "人間関係", en: "Relationships"},
        icon: "👋",
        difficulty: "easy",
      },
      {
        id: "task_5",
        text: {ja: "植物に水をあげる", en: "Water a plant"},
        category: {ja: "環境", en: "Environment"},
        icon: "🌱",
        difficulty: "easy",
      },
      {
        id: "task_6",
        text: {ja: "深呼吸を3回する", en: "Take 3 deep breaths"},
        category: {ja: "自己ケア", en: "Self-care"},
        icon: "🫁",
        difficulty: "easy",
      },
      {
        id: "task_7",
        text: {ja: "本を10分読む", en: "Read a book for 10 minutes"},
        category: {ja: "自己ケア", en: "Self-care"},
        icon: "📚",
        difficulty: "medium",
      },
      {
        id: "task_8",
        text: {ja: "誰かに微笑みかける", en: "Smile at someone"},
        category: {ja: "人間関係", en: "Relationships"},
        icon: "😊",
        difficulty: "easy",
      },
    ];

    console.log("📋 Creating sample tasks...");
    // Use batch write for better performance and atomicity
    const batch = writeBatch(db);
    
    for (const task of sampleTasks) {
      const taskRef = doc(db, "tasks", task.id);
      batch.set(taskRef, {
        ...task,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`📝 Queued task "${task.text.en}"`);
    }
    
    await batch.commit();
    console.log(`✅ Created ${sampleTasks.length} tasks`);

    // 2. Initialize global counter
    console.log("🌍 Initializing global counter...");
    const today = new Date().toISOString().split("T")[0];
    const globalCounterRef = doc(db, "global_counters", today);
    await setDoc(globalCounterRef, {
      date: today,
      totalDoneToday: 0,
      totalDoneAllTime: 0,
      lastUpdated: serverTimestamp(),
    });
    console.log(`✅ Initialized global counter (${today})`);

    // 3. Create test user
    console.log("👤 Creating test user...");
    const testUserId = "test_user_001";
    const userRef = doc(db, "users", testUserId);
    await setDoc(userRef, {
      id: testUserId,
      displayName: "Test User",
      language: "ja",
      timezone: "Asia/Tokyo",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      followedUsers: [],
      totalDoneCount: 0,
    });
    console.log(`✅ Created test user "${testUserId}"`);

    console.log("\n🎉 Initial data setup completed successfully!");
    console.log("📊 Emulator UI: http://127.0.0.1:4002/firestore");
  } catch (error) {
    console.error("❌ Setup error:", error);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Setup interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Setup terminated');
  process.exit(0);
});
}

setupInitialData();
