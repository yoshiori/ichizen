const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, getDocs } = require('firebase/firestore');

// Firebase設定（エミュレータ用）
const firebaseConfig = {
  projectId: 'ichizen-daily-good-deeds'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// エミュレータに接続
connectFirestoreEmulator(db, 'localhost', 8081);

async function testEmulatorConnection() {
  console.log('🧪 エミュレータ接続テストを開始します...');

  try {
    // タスクデータ取得テスト
    console.log('📋 タスクデータ取得テスト...');
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    console.log(`✅ ${tasksSnapshot.size} 件のタスクを取得しました`);
    
    tasksSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${data.text.ja} (${data.category.ja})`);
    });

    // ユーザーデータ取得テスト
    console.log('\n👤 ユーザーデータ取得テスト...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`✅ ${usersSnapshot.size} 件のユーザーを取得しました`);
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${data.displayName} (${data.id})`);
    });

    // グローバルカウンターデータ取得テスト
    console.log('\n🌍 グローバルカウンターデータ取得テスト...');
    const countersSnapshot = await getDocs(collection(db, 'global_counters'));
    console.log(`✅ ${countersSnapshot.size} 件のカウンターを取得しました`);
    
    countersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${data.date}: ${data.totalDoneToday} 回 (累計: ${data.totalDoneAllTime})`);
    });

    console.log('\n🎉 エミュレータ接続テストが正常に完了しました！');
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
  }
}

testEmulatorConnection();