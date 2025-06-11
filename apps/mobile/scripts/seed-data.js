const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, doc, setDoc } = require('firebase/firestore');
const { getAuth, connectAuthEmulator } = require('firebase/auth');

// Import sample tasks (we'll define them inline for simplicity)
const sampleTasks = [
  {
    id: 'task-1',
    text: {
      ja: 'ありがとうを言う',
      en: 'Say thank you'
    },
    category: {
      ja: '人間関係',
      en: 'Relationships'
    },
    icon: '💝'
  },
  {
    id: 'task-2',
    text: {
      ja: 'ゴミを一個拾う',
      en: 'Pick up one piece of trash'
    },
    category: {
      ja: '環境',
      en: 'Environment'
    },
    icon: '🌱'
  },
  {
    id: 'task-3',
    text: {
      ja: '机を掃除する',
      en: 'Clean your desk'
    },
    category: {
      ja: 'セルフケア',
      en: 'Self Care'
    },
    icon: '✨'
  },
  {
    id: 'task-4',
    text: {
      ja: '近所の人に挨拶をする',
      en: 'Greet your neighbors'
    },
    category: {
      ja: 'コミュニティ',
      en: 'Community'
    },
    icon: '👋'
  },
  {
    id: 'task-5',
    text: {
      ja: '誰かの手伝いをする',
      en: 'Help someone'
    },
    category: {
      ja: '親切',
      en: 'Kindness'
    },
    icon: '🤝'
  },
  {
    id: 'task-6',
    text: {
      ja: '深呼吸を3回する',
      en: 'Take 3 deep breaths'
    },
    category: {
      ja: 'セルフケア',
      en: 'Self Care'
    },
    icon: '🧘‍♀️'
  },
  {
    id: 'task-7',
    text: {
      ja: '植物に水をあげる',
      en: 'Water a plant'
    },
    category: {
      ja: '環境',
      en: 'Environment'
    },
    icon: '🪴'
  },
  {
    id: 'task-8',
    text: {
      ja: '笑顔で過ごす',
      en: 'Smile more today'
    },
    category: {
      ja: '親切',
      en: 'Kindness'
    },
    icon: '😊'
  }
];

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
  console.log('Emulator already connected:', error.message);
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