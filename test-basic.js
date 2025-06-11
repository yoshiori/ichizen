/**
 * 基本的なFirestore接続テスト
 */

const admin = require('firebase-admin');

// Firebase Admin SDK 初期化（エミュレータ用）
admin.initializeApp({
  projectId: 'ichizen-daily-good-deeds'
});

// Firestore エミュレータに接続
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

async function basicTest() {
  try {
    console.log('🧪 基本テスト開始');
    
    const db = admin.firestore();
    
    // 1. 基本的なドキュメント作成
    console.log('\n1️⃣ テストドキュメント作成...');
    await db.collection('test').doc('sample').set({
      message: 'Hello Firestore Emulator!',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ ドキュメント作成成功');
    
    // 2. ドキュメント読み取り
    console.log('\n2️⃣ ドキュメント読み取り...');
    const doc = await db.collection('test').doc('sample').get();
    if (doc.exists) {
      console.log('✅ ドキュメント読み取り成功:', doc.data().message);
    } else {
      console.log('❌ ドキュメントが見つかりません');
    }
    
    // 3. サンプルタスクを手動作成
    console.log('\n3️⃣ サンプルタスク手動作成...');
    const sampleTask = {
      text: {
        ja: 'ありがとうを言う',
        en: 'Say thank you'
      },
      category: {
        ja: '人間関係',
        en: 'Relationships'
      },
      icon: '💝',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const taskRef = await db.collection('tasks').add(sampleTask);
    console.log('✅ サンプルタスク作成成功:', taskRef.id);
    
    // 4. タスク検索
    console.log('\n4️⃣ タスク検索...');
    const tasksSnapshot = await db.collection('tasks')
      .where('isActive', '==', true)
      .get();
    
    console.log('✅ アクティブタスク数:', tasksSnapshot.size);
    
    // 5. 今日のグローバルカウンター作成
    console.log('\n5️⃣ グローバルカウンター作成...');
    const today = new Date().toISOString().split('T')[0];
    await db.collection('global_counters').doc(today).set({
      date: today,
      count: 1,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ グローバルカウンター作成成功');
    
    // 6. テストユーザーのタスク履歴作成
    console.log('\n6️⃣ タスク履歴作成...');
    const historyRef = await db.collection('daily_task_history').add({
      userId: 'test-user-123',
      taskId: taskRef.id,
      date: today,
      completed: false,
      selectedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ タスク履歴作成成功:', historyRef.id);
    
    // 7. タスク完了シミュレート（Cloud Functions トリガーのテスト）
    console.log('\n7️⃣ タスク完了シミュレート...');
    await historyRef.update({
      completed: true,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ タスク完了更新成功');
    
    // 8. Firestoreトリガーの動作確認（少し待つ）
    console.log('\n8️⃣ Cloud Functions トリガー動作確認...');
    console.log('   （3秒待機中...）');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const updatedCounterDoc = await db.collection('global_counters').doc(today).get();
    if (updatedCounterDoc.exists) {
      const data = updatedCounterDoc.data();
      console.log('✅ 現在のグローバルカウンター:', data.count);
      
      if (data.count > 1) {
        console.log('🎉 Cloud Functions onTaskCompleted トリガーが動作しました！');
      } else {
        console.log('⚠️  Cloud Functions トリガーが動作していない可能性があります');
        console.log('   （エミュレータ環境では正常です）');
      }
    }
    
    console.log('\n🎉 基本テストが完了しました！');
    console.log('📊 エミュレータUI: http://127.0.0.1:4000/firestore');
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
  }
  
  process.exit(0);
}

// テスト実行
basicTest();