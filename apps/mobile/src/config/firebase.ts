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

// Connect to emulators in development (check if running on localhost)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  try {
    import('firebase/auth').then(({ connectAuthEmulator }) => {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    });
    import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
      connectFirestoreEmulator(db, 'localhost', 8080);
    });
  } catch (error) {
    console.log('Emulator connection:', error);
  }
}

export { app };