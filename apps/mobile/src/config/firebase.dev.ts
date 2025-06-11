import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Development Firebase config (real project ID for emulator)
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "ichizen-daily-good-deeds.firebaseapp.com",
  projectId: "ichizen-daily-good-deeds",
  storageBucket: "ichizen-daily-good-deeds.firebasestorage.app",
  messagingSenderId: "179557978249",
  appId: "1:179557978249:web:abc123def456"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to emulators in development
if (__DEV__) {
  try {
    // Connect to emulator only if not already connected
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator might already be connected
    console.log('Emulator connection:', error);
  }
}

export { app };