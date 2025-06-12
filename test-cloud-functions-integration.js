/**
 * Cloud Functions 統合テスト
 * エミュレータ環境でのエンドツーエンド動作確認
 */

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

async function runIntegrationTest() {
  console.log('🧪 Cloud Functions 統合テストを開始します...');
  console.log('');

  try {
    // 1. 匿名認証
    console.log('1️⃣ Firebase 匿名認証...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log(`✅ 認証成功: ${user.uid}`);
    console.log('');

    // 2. getTodayTask 関数テスト
    console.log('2️⃣ getTodayTask Cloud Function 呼び出し...');
    const getTodayTask = httpsCallable(functions, 'getTodayTask');
    const todayTaskResult = await getTodayTask();
    console.log('✅ getTodayTask 成功:');
    console.log('   Task ID:', todayTaskResult.data.task.id);
    console.log('   Task Text (ja):', todayTaskResult.data.task.text.ja);
    console.log('   Task Text (en):', todayTaskResult.data.task.text.en);
    console.log('   Completed:', todayTaskResult.data.completed);
    console.log('   Simplified:', todayTaskResult.data.simplified);
    console.log('');

    // 3. completeTask 関数テスト
    console.log('3️⃣ completeTask Cloud Function 呼び出し...');
    const completeTask = httpsCallable(functions, 'completeTask');
    const completeResult = await completeTask();
    console.log('✅ completeTask 成功:');
    console.log('   Success:', completeResult.data.success);
    console.log('   User ID:', completeResult.data.userId);
    console.log('   Tasks Found:', completeResult.data.tasksFound);
    console.log('');

    // 4. 再度 getTodayTask でステータス確認
    console.log('4️⃣ 完了後の getTodayTask 状態確認...');
    const updatedTaskResult = await getTodayTask();
    console.log('✅ 更新後タスク状態:');
    console.log('   Task ID:', updatedTaskResult.data.task.id);
    console.log('   Completed:', updatedTaskResult.data.completed);
    console.log('   Simplified:', updatedTaskResult.data.simplified);
    console.log('');

    // 5. テスト関数の動作確認
    console.log('5️⃣ testFirestore Cloud Function 呼び出し...');
    const testFirestore = httpsCallable(functions, 'testFirestore');
    const firestoreTestResult = await testFirestore();
    console.log('✅ testFirestore 成功:');
    console.log('   Success:', firestoreTestResult.data.success);
    console.log('   Task Count:', firestoreTestResult.data.taskCount);
    console.log('   First Task ID:', firestoreTestResult.data.firstTask?.id);
    console.log('');

    console.log('🎉 Cloud Functions 統合テストが完了しました！');
    console.log('');
    console.log('📊 テスト結果サマリー:');
    console.log('   ✅ Firebase 匿名認証');
    console.log('   ✅ getTodayTask Cloud Function');
    console.log('   ✅ completeTask Cloud Function');
    console.log('   ✅ testFirestore Cloud Function');
    console.log('   ✅ Firestore データアクセス');
    console.log('   ✅ エンドツーエンド動作');
    
  } catch (error) {
    console.error('❌ 統合テストエラー:', error);
    if (error.code) {
      console.error('   エラーコード:', error.code);
    }
    if (error.message) {
      console.error('   エラーメッセージ:', error.message);
    }
    if (error.details) {
      console.error('   詳細:', error.details);
    }
  }
}

runIntegrationTest();