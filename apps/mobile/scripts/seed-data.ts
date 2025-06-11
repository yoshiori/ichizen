import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { sampleTasks } from '../src/data/sampleTasks';

// Firebase config (production)
const firebaseConfig = {
  apiKey: "AIzaSyAH5s9WzkRGioFhBFAVPlSgTcWT1eY62_k",
  authDomain: "ichizen-daily-good-deeds.firebaseapp.com",
  projectId: "ichizen-daily-good-deeds",
  storageBucket: "ichizen-daily-good-deeds.firebasestorage.app",
  messagingSenderId: "179557978249",
  appId: "1:179557978249:web:08a1c5539a35eae9a03658",
  measurementId: "G-09FFCDS3PG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedTasks() {
  console.log('📝 Seeding sample tasks...');
  
  const tasksCollection = collection(db, 'tasks');
  
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
          isActive: true
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
  console.log('🌍 Initializing global counter...');
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const counterRef = doc(db, 'global_counters', today);
  
  try {
    const existingCounter = await getDoc(counterRef);
    
    if (!existingCounter.exists()) {
      await setDoc(counterRef, {
        date: today,
        count: 0,
        lastUpdated: new Date()
      });
      console.log(`✅ Initialized global counter for ${today}`);
    } else {
      console.log(`⏭️  Global counter already exists for ${today}`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize global counter:', error);
  }
}

async function main() {
  console.log('🌱 Starting data seeding...');
  
  try {
    await seedTasks();
    await seedGlobalCounter();
    console.log('🎉 Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

main();