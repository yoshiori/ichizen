const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
const { getFunctions, connectFunctionsEmulator, httpsCallable } = require('firebase/functions');

// Firebase設定（エミュレータ用）
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

// エミュレータに接続
try {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8081);
  connectFunctionsEmulator(functions, 'localhost', 5001);
} catch (error) {
  console.log('エミュレータ接続済み:', error.message);
}

async function testCloudFunctions() {
  console.log('🧪 Cloud Functions テストを開始します...');

  try {
    // 1. 匿名認証
    console.log('\n1️⃣ 匿名認証テスト...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log(`✅ 認証成功: ${user.uid}`);

    // 2. getTodayTask 関数テスト
    console.log('\n2️⃣ getTodayTask 関数テスト...');
    const getTodayTask = httpsCallable(functions, 'getTodayTask');
    const todayTaskResult = await getTodayTask();
    console.log('✅ getTodayTask 成功:', todayTaskResult.data);

    // 3. completeTask 関数テスト
    console.log('\n3️⃣ completeTask 関数テスト...');
    const completeTask = httpsCallable(functions, 'completeTask');
    const completeResult = await completeTask();
    console.log('✅ completeTask 成功:', completeResult.data);

    // 4. 再度 getTodayTask でステータス確認
    console.log('\n4️⃣ 完了後の getTodayTask テスト...');
    const completedTaskResult = await getTodayTask();
    console.log('✅ 完了後のタスク状態:', completedTaskResult.data);

    console.log('\n🎉 Cloud Functions テストが正常に完了しました！');
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
    if (error.details) {
      console.error('詳細:', error.details);
    }
  }
}

testCloudFunctions();