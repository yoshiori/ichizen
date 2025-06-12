/**
 * Cloud Functions Integration Test
 * End-to-end functionality verification in emulator environment
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
const { getFunctions, connectFunctionsEmulator, httpsCallable } = require('firebase/functions');

// Firebase configuration for emulator
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "ichizen-daily-good-deeds.firebaseapp.com",
  projectId: 'ichizen-daily-good-deeds',
  storageBucket: "ichizen-daily-good-deeds.firebasestorage.app",
  messagingSenderId: "179557978249",
  appId: "1:179557978249:web:demo123"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, 'asia-northeast1');

// Connect to emulators
try {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8081);
  connectFunctionsEmulator(functions, 'localhost', 5001);
} catch (error) {
  console.log('Emulator already connected:', error.message);
}

async function runIntegrationTest() {
  console.log('🧪 Starting Cloud Functions integration test...');
  console.log('');

  try {
    // 1. Anonymous authentication
    console.log('1️⃣ Firebase anonymous authentication...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log(`✅ Authentication successful: ${user.uid}`);
    console.log('');

    // 2. getTodayTask function test
    console.log('2️⃣ Calling getTodayTask Cloud Function...');
    const getTodayTask = httpsCallable(functions, 'getTodayTask');
    const todayTaskResult = await getTodayTask();
    console.log('✅ getTodayTask success:');
    console.log('   Task ID:', todayTaskResult.data.task.id);
    console.log('   Task Text (ja):', todayTaskResult.data.task.text.ja);
    console.log('   Task Text (en):', todayTaskResult.data.task.text.en);
    console.log('   Completed:', todayTaskResult.data.completed);
    console.log('   Simplified:', todayTaskResult.data.simplified);
    console.log('');

    // 3. completeTask function test
    console.log('3️⃣ Calling completeTask Cloud Function...');
    const completeTask = httpsCallable(functions, 'completeTask');
    const completeResult = await completeTask();
    console.log('✅ completeTask success:');
    console.log('   Success:', completeResult.data.success);
    console.log('   User ID:', completeResult.data.userId);
    console.log('   Tasks Found:', completeResult.data.tasksFound);
    console.log('');

    // 4. Check status after completion with getTodayTask
    console.log('4️⃣ Checking getTodayTask status after completion...');
    const updatedTaskResult = await getTodayTask();
    console.log('✅ Updated task status:');
    console.log('   Task ID:', updatedTaskResult.data.task.id);
    console.log('   Completed:', updatedTaskResult.data.completed);
    console.log('   Simplified:', updatedTaskResult.data.simplified);
    console.log('');

    // 5. Test function verification
    console.log('5️⃣ Calling testFirestore Cloud Function...');
    const testFirestore = httpsCallable(functions, 'testFirestore');
    const firestoreTestResult = await testFirestore();
    console.log('✅ testFirestore success:');
    console.log('   Success:', firestoreTestResult.data.success);
    console.log('   Task Count:', firestoreTestResult.data.taskCount);
    console.log('   First Task ID:', firestoreTestResult.data.firstTask?.id);
    console.log('');

    console.log('🎉 Cloud Functions integration test completed successfully!');
    console.log('');
    console.log('📊 Test Results Summary:');
    console.log('   ✅ Firebase anonymous authentication');
    console.log('   ✅ getTodayTask Cloud Function');
    console.log('   ✅ completeTask Cloud Function');
    console.log('   ✅ testFirestore Cloud Function');
    console.log('   ✅ Firestore data access');
    console.log('   ✅ End-to-end functionality');
    
  } catch (error) {
    console.error('❌ Integration test error:', error);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.message) {
      console.error('   Error message:', error.message);
    }
    if (error.details) {
      console.error('   Details:', error.details);
    }
  }
}

runIntegrationTest();