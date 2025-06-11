/**
 * Cloud Functions ローカルテスト用スクリプト
 */

const admin = require('firebase-admin');
const { getFunctions, connectFunctionsEmulator, httpsCallable } = require('firebase/functions');
const { initializeApp, getApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, signInAnonymously } = require('firebase/auth');

// Firebase Admin SDK 初期化（エミュレータ用）
admin.initializeApp({
  projectId: 'ichizen-daily-good-deeds'
});

// Firebase Client SDK 初期化（エミュレータ用）
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "ichizen-daily-good-deeds.firebaseapp.com",
  projectId: "ichizen-daily-good-deeds",
  storageBucket: "ichizen-daily-good-deeds.firebasestorage.app",
  messagingSenderId: "179557978249",
  appId: "1:179557978249:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'asia-northeast1');

// エミュレータに接続
try {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
} catch (error) {
  console.log('Emulator already connected:', error.message);
}

async function testCloudFunctions() {
  try {
    console.log('🧪 Cloud Functions テスト開始');
    
    // 1. 匿名ログイン
    console.log('\n1️⃣ 匿名ログイン...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log('✅ ログイン成功:', user.uid);
    
    // 2. getTodayTask 呼び出し
    console.log('\n2️⃣ getTodayTask 呼び出し...');
    const getTodayTask = httpsCallable(functions, 'getTodayTask');
    const todayTaskResult = await getTodayTask();
    console.log('✅ 今日のタスク取得成功:');
    console.log('   タスク:', todayTaskResult.data.task.text.ja);
    console.log('   完了状態:', todayTaskResult.data.completed);
    
    // 3. completeTask 呼び出し
    console.log('\n3️⃣ completeTask 呼び出し...');
    const completeTask = httpsCallable(functions, 'completeTask');
    const completeResult = await completeTask();
    console.log('✅ タスク完了成功:');
    console.log('   成功:', completeResult.data.success);
    console.log('   完了時刻:', completeResult.data.completedAt);
    
    // 4. 再度 getTodayTask で完了状態確認
    console.log('\n4️⃣ タスク完了状態確認...');
    const todayTaskResult2 = await getTodayTask();
    console.log('✅ 完了後のタスク状態:');
    console.log('   完了状態:', todayTaskResult2.data.completed);
    
    console.log('\n🎉 すべてのテストが成功しました！');
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
    if (error.code) {
      console.error('   エラーコード:', error.code);
    }
    if (error.message) {
      console.error('   エラーメッセージ:', error.message);
    }
  }
  
  process.exit(0);
}

// テスト実行
testCloudFunctions();