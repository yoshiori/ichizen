/**
 * Firestore のみのテスト
 */

const admin = require('firebase-admin');

// Firebase Admin SDK 初期化（エミュレータ用）
admin.initializeApp({
  projectId: 'ichizen-daily-good-deeds'
});

// Firestore エミュレータに接続
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

async function testFirestore() {
  try {
    console.log('🧪 Firestore テスト開始');
    
    const db = admin.firestore();
    
    // 1. タスクデータ確認
    console.log('\n1️⃣ タスクデータ確認...');
    const tasksSnapshot = await db.collection('tasks').limit(3).get();
    console.log('✅ タスクデータ:', tasksSnapshot.size, '件');
    
    const tasks = [];
    tasksSnapshot.forEach(doc => {
      const data = doc.data();
      tasks.push({ id: doc.id, ...data });
      console.log('   -', data.text.ja, `(${doc.id})`);
    });
    
    // 2. 今日のグローバルカウンター確認
    console.log('\n2️⃣ グローバルカウンター確認...');
    const today = new Date().toISOString().split('T')[0];
    const counterDoc = await db.collection('global_counters').doc(today).get();
    
    if (counterDoc.exists) {
      const counterData = counterDoc.data();
      console.log('✅ グローバルカウンター:', counterData.count);
    } else {
      console.log('⚠️  グローバルカウンターが存在しません - 作成中...');
      await db.collection('global_counters').doc(today).set({
        date: today,
        count: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ グローバルカウンター作成完了');
    }
    
    // 3. テストユーザーのタスク履歴作成
    console.log('\n3️⃣ テストユーザーのタスク履歴作成...');
    const testUserId = 'test-user-' + Date.now();
    const testTask = tasks[0];
    
    const historyRef = await db.collection('daily_task_history').add({
      userId: testUserId,
      taskId: testTask.id,
      date: today,
      completed: false,
      selectedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ タスク履歴作成成功:', historyRef.id);
    console.log('   ユーザー:', testUserId);
    console.log('   タスク:', testTask.text.ja);
    
    // 4. タスク完了シミュレート
    console.log('\n4️⃣ タスク完了シミュレート...');
    await historyRef.update({
      completed: true,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ タスク完了更新成功');
    
    // 5. Cloud Functions トリガーの動作確認（少し待つ）
    console.log('\n5️⃣ Cloud Functions トリガー動作確認...');
    console.log('   （Firestore トリガーの処理を待機中...）');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const updatedCounterDoc = await db.collection('global_counters').doc(today).get();
    if (updatedCounterDoc.exists) {
      const updatedData = updatedCounterDoc.data();
      console.log('✅ トリガー後グローバルカウンター:', updatedData.count);
      if (updatedData.count > 0) {
        console.log('🎉 Cloud Functions トリガーが正常に動作しました！');
      } else {
        console.log('⚠️  Cloud Functions トリガーが動作していない可能性があります');
      }
    }
    
    // 6. 日別履歴クエリテスト
    console.log('\n6️⃣ 日別履歴クエリテスト...');
    const historyQuery = await db.collection('daily_task_history')
      .where('userId', '==', testUserId)
      .where('date', '==', today)
      .get();
    
    console.log('✅ 履歴クエリ結果:', historyQuery.size, '件');
    historyQuery.forEach(doc => {
      const data = doc.data();
      console.log('   - 完了状態:', data.completed);
      console.log('   - タスクID:', data.taskId);
    });
    
    console.log('\n🎉 Firestore テストが成功しました！');
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
  }
  
  process.exit(0);
}

// テスト実行
testFirestore();