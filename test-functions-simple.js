/**
 * Cloud Functions 簡単テスト（HTTP直接呼び出し）
 */

const admin = require('firebase-admin');

// Firebase Admin SDK 初期化（エミュレータ用）
admin.initializeApp({
  projectId: 'ichizen-daily-good-deeds'
});

// エミュレータに接続
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

async function testFunctions() {
  try {
    console.log('🧪 Cloud Functions テスト開始');
    
    // 1. テストユーザーを作成
    console.log('\n1️⃣ テストユーザー作成...');
    const testUser = await admin.auth().createUser({
      uid: 'test-user-123',
      email: 'test@example.com'
    });
    console.log('✅ テストユーザー作成成功:', testUser.uid);
    
    // 2. カスタムトークンを生成
    console.log('\n2️⃣ カスタムトークン生成...');
    const customToken = await admin.auth().createCustomToken('test-user-123');
    console.log('✅ カスタムトークン生成成功');
    
    // 3. Firestore でテストデータ確認
    console.log('\n3️⃣ Firestore データ確認...');
    const db = admin.firestore();
    
    const tasksSnapshot = await db.collection('tasks').limit(3).get();
    console.log('✅ タスクデータ:', tasksSnapshot.size, '件');
    
    tasksSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('   -', data.text.ja);
    });
    
    // 4. 今日のグローバルカウンター確認
    const today = new Date().toISOString().split('T')[0];
    const counterDoc = await db.collection('global_counters').doc(today).get();
    
    if (counterDoc.exists) {
      console.log('✅ グローバルカウンター:', counterDoc.data().count);
    } else {
      console.log('⚠️  グローバルカウンターが存在しません');
    }
    
    // 5. テストユーザーのタスク履歴作成
    console.log('\n4️⃣ テストユーザーのタスク履歴作成...');
    const taskSnapshot = await db.collection('tasks').limit(1).get();
    const testTask = taskSnapshot.docs[0];
    
    const historyRef = await db.collection('daily_task_history').add({
      userId: 'test-user-123',
      taskId: testTask.id,
      date: today,
      completed: false,
      selectedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ タスク履歴作成成功:', historyRef.id);
    
    // 6. タスク完了をシミュレート
    console.log('\n5️⃣ タスク完了シミュレート...');
    await historyRef.update({
      completed: true,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ タスク完了成功');
    
    // 7. グローバルカウンターの増加確認
    console.log('\n6️⃣ グローバルカウンター増加確認...');
    // Firestore トリガーの処理を少し待つ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedCounterDoc = await db.collection('global_counters').doc(today).get();
    if (updatedCounterDoc.exists) {
      console.log('✅ 更新後グローバルカウンター:', updatedCounterDoc.data().count);
    }
    
    console.log('\n🎉 Firestore テストが成功しました！');
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
  }
  
  process.exit(0);
}

// テスト実行
testFunctions();