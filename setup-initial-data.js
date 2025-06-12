const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase設定（エミュレータ用）
const firebaseConfig = {
  projectId: 'ichizen-daily-good-deeds'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// エミュレータに接続
connectFirestoreEmulator(db, 'localhost', 8081);

async function setupInitialData() {
  console.log('📝 初期データセットアップを開始します...');

  try {
    // 1. サンプルタスクデータ
    const sampleTasks = [
      {
        id: 'task_1',
        text: { ja: 'ありがとうを言う', en: 'Say thank you' },
        category: { ja: '人間関係', en: 'Relationships' },
        icon: '💝',
        difficulty: 'easy'
      },
      {
        id: 'task_2', 
        text: { ja: 'ゴミを一個拾う', en: 'Pick up one piece of trash' },
        category: { ja: '環境', en: 'Environment' },
        icon: '♻️',
        difficulty: 'easy'
      },
      {
        id: 'task_3',
        text: { ja: '机を掃除する', en: 'Clean your desk' },
        category: { ja: '自己ケア', en: 'Self-care' },
        icon: '✨',
        difficulty: 'medium'
      },
      {
        id: 'task_4',
        text: { ja: '近所の人に挨拶をする', en: 'Greet a neighbor' },
        category: { ja: '人間関係', en: 'Relationships' },
        icon: '👋',
        difficulty: 'easy'
      },
      {
        id: 'task_5',
        text: { ja: '植物に水をあげる', en: 'Water a plant' },
        category: { ja: '環境', en: 'Environment' },
        icon: '🌱',
        difficulty: 'easy'
      },
      {
        id: 'task_6',
        text: { ja: '深呼吸を3回する', en: 'Take 3 deep breaths' },
        category: { ja: '自己ケア', en: 'Self-care' },
        icon: '🫁',
        difficulty: 'easy'
      },
      {
        id: 'task_7',
        text: { ja: '本を10分読む', en: 'Read a book for 10 minutes' },
        category: { ja: '自己ケア', en: 'Self-care' },
        icon: '📚',
        difficulty: 'medium'
      },
      {
        id: 'task_8',
        text: { ja: '誰かに微笑みかける', en: 'Smile at someone' },
        category: { ja: '人間関係', en: 'Relationships' },
        icon: '😊',
        difficulty: 'easy'
      }
    ];

    console.log('📋 サンプルタスクを作成中...');
    for (const task of sampleTasks) {
      const taskRef = doc(db, 'tasks', task.id);
      await setDoc(taskRef, {
        ...task,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ タスク "${task.text.ja}" を作成しました`);
    }

    // 2. グローバルカウンター初期化
    console.log('🌍 グローバルカウンターを初期化中...');
    const today = new Date().toISOString().split('T')[0];
    const globalCounterRef = doc(db, 'global_counters', today);
    await setDoc(globalCounterRef, {
      date: today,
      totalDoneToday: 0,
      totalDoneAllTime: 0,
      lastUpdated: serverTimestamp()
    });
    console.log(`✅ グローバルカウンター (${today}) を初期化しました`);

    // 3. テストユーザー作成
    console.log('👤 テストユーザーを作成中...');
    const testUserId = 'test_user_001';
    const userRef = doc(db, 'users', testUserId);
    await setDoc(userRef, {
      id: testUserId,
      displayName: 'テストユーザー',
      language: 'ja',
      timezone: 'Asia/Tokyo',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      followedUsers: [],
      totalDoneCount: 0
    });
    console.log(`✅ テストユーザー "${testUserId}" を作成しました`);

    console.log('\n🎉 初期データセットアップが完了しました！');
    console.log('📊 エミュレータUI: http://127.0.0.1:4000/firestore');
    
  } catch (error) {
    console.error('❌ セットアップエラー:', error);
  }
}

setupInitialData();