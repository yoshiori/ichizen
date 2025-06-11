import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, doc, setDoc } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { sampleTasks } from '../src/data/sampleTasks';

// Firebase config for emulator
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-ichizen-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators
try {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
} catch (error) {
  console.log('Emulator already connected:', error);
}

async function seedData() {
  console.log('🌱 Starting data seeding...');
  
  try {
    // Seed sample tasks
    console.log('📝 Seeding sample tasks...');
    for (const task of sampleTasks) {
      await setDoc(doc(db, 'tasks', task.id), {
        text: task.text,
        category: task.category,
        icon: task.icon
      });
      console.log(`✅ Added task: ${task.text.en}`);
    }
    
    // Initialize global counter
    console.log('🌍 Initializing global counter...');
    await setDoc(doc(db, 'global', 'counter'), {
      totalCompleted: 125847,
      todayCompleted: 1246,
      lastUpdated: new Date()
    });
    console.log('✅ Global counter initialized');
    
    console.log('🎉 Data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
  
  process.exit(0);
}

seedData();