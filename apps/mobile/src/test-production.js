/**
 * Production Cloud Functions connection test
 * Run in browser console
 */

// Direct Cloud Functions test
async function testProductionCloudFunctions() {
  console.log('🚀 Testing production Cloud Functions...');
  
  try {
    // testFunction を直接呼び出し
    const response = await fetch('https://asia-northeast1-ichizen-daily-good-deeds.cloudfunctions.net/testFunction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: {} })
    });
    
    const result = await response.json();
    console.log('✅ testFunction result:', result);
    return result;
  } catch (error) {
    console.error('❌ testFunction error:', error);
    throw error;
  }
}

// Firebase Authentication + Cloud Functions test
async function testAuthenticatedCloudFunctions() {
  console.log('🔐 Testing authenticated Cloud Functions...');
  
  try {
    // Firebase認証（匿名）
    const { signInAnonymously } = await import('firebase/auth');
    const { auth } = await import('./config/firebase');
    
    console.log('Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    console.log('✅ User signed in:', userCredential.user.uid);
    
    // Cloud Functions サービス経由でテスト
    const { getTodayTask } = await import('./services/cloudFunctions');
    
    console.log('Getting today task...');
    const taskResult = await getTodayTask();
    console.log('✅ getTodayTask result:', taskResult);
    
    return { auth: userCredential.user.uid, task: taskResult };
  } catch (error) {
    console.error('❌ Authenticated test error:', error);
    throw error;
  }
}

// Run test
console.log('Copy and paste these functions into browser console:');
console.log('testProductionCloudFunctions()');
console.log('testAuthenticatedCloudFunctions()');

// Auto-execute (depending on environment)
if (typeof window !== 'undefined') {
  window.testProductionCloudFunctions = testProductionCloudFunctions;
  window.testAuthenticatedCloudFunctions = testAuthenticatedCloudFunctions;
}