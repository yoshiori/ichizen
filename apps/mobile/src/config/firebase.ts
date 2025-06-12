import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to emulators in development
// Use Firestore emulator on port 8081 (updated from 8080)
// Temporarily disabled for testing
const USE_EMULATOR = false; // __DEV__ && (typeof window !== 'undefined' && window.location.hostname === 'localhost');

if (USE_EMULATOR) {
  try {
    import('firebase/auth').then(({ connectAuthEmulator }) => {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    });
    import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
      connectFirestoreEmulator(db, 'localhost', 8081);
    });
    console.log('🔧 Connected to Firebase emulators (Auth: 9099, Firestore: 8081)');
  } catch (error) {
    console.log('Emulator connection:', error);
  }
} else {
  console.log('🚀 Connected to production Firebase (Project: ichizen-daily-good-deeds)');
}

export { app };