import { getTasks, getGlobalCounter } from './firestore';

export const testFirestoreConnection = async () => {
  try {
    console.log('🔥 Testing Firestore connection...');
    
    // Test tasks collection
    const tasks = await getTasks();
    console.log(`📝 Found ${tasks.length} tasks:`, tasks.map(t => t.text.en));
    
    // Test global counter
    const today = new Date().toISOString().split('T')[0];
    const counter = await getGlobalCounter(today);
    console.log('🌍 Global counter:', counter);
    
    return { success: true, tasks, counter };
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return { success: false, error };
  }
};