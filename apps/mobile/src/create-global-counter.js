// Create global counter document for the app
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAH5s9WzkRGioFhBFAVPlSgTcWT1eY62_k",
  authDomain: "ichizen-daily-good-deeds.firebaseapp.com",
  projectId: "ichizen-daily-good-deeds",
  storageBucket: "ichizen-daily-good-deeds.firebasestorage.app",
  messagingSenderId: "179557978249",
  appId: "1:179557978249:web:08a1c5539a35eae9a03658",
  measurementId: "G-09FFCDS3PG"
};

async function createGlobalCounter() {
  console.log('📊 Creating global counter document...');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Create global counter document with proper structure
    const globalCounterData = {
      totalCompleted: 5,
      todayCompleted: 3,
      lastUpdated: new Date(),
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'global', 'counter'), globalCounterData);
    console.log('✅ Global counter document created successfully');
    console.log('   Data:', globalCounterData);
    
  } catch (error) {
    console.error('❌ Failed to create global counter:', error.message);
    throw error;
  }
}

// Run setup
createGlobalCounter()
  .then(() => {
    console.log('Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });