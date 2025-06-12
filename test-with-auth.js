const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously, connectAuthEmulator } = require('firebase/auth');
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
const functions = getFunctions(app, 'asia-northeast1');

// エミュレータに接続
try {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFunctionsEmulator(functions, 'localhost', 5001);
} catch (error) {
  console.log('エミュレータ接続済み:', error.message);
}

async function testWithAuth() {
  console.log('🧪 認証付きテスト...');

  try {
    // 1. 匿名認証
    console.log('1️⃣ 匿名認証...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log(`✅ 認証成功: ${user.uid}`);

    // 2. 認証トークンを取得
    const idToken = await user.getIdToken();
    console.log('✅ IDトークン取得成功');

    // 3. getTodayTask 関数を呼び出し
    console.log('2️⃣ getTodayTask 関数呼び出し...');
    const getTodayTask = httpsCallable(functions, 'getTodayTask');
    const result = await getTodayTask();
    console.log('✅ getTodayTask 成功:', result.data);
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
    if (error.code) {
      console.error('エラーコード:', error.code);
    }
    if (error.message) {
      console.error('エラーメッセージ:', error.message);
    }
  }
}

testWithAuth();