const { initializeApp } = require('firebase/app');
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
const functions = getFunctions(app, 'asia-northeast1');

// エミュレータに接続
try {
  connectFunctionsEmulator(functions, 'localhost', 5001);
} catch (error) {
  console.log('エミュレータ接続済み:', error.message);
}

async function testSimpleFunction() {
  console.log('🧪 シンプル関数テスト...');

  try {
    const testFunction = httpsCallable(functions, 'testFunction');
    const result = await testFunction();
    console.log('✅ テスト関数成功:', result.data);
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
    if (error.details) {
      console.error('詳細:', error.details);
    }
  }
}

testSimpleFunction();