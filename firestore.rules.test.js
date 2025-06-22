const { readFileSync } = require('fs');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

// Load the rules
const rules = readFileSync('./firestore.rules', 'utf8');

describe('Firestore Security Rules', () => {
  let testEnv;
  let unauthenticatedContext;
  let authenticatedContext;
  let otherUserContext;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'ichizen-daily-good-deeds',
      firestore: {
        rules,
        host: 'localhost',
        port: 8080,
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    // Create contexts for different user scenarios
    unauthenticatedContext = testEnv.unauthenticatedContext();
    authenticatedContext = testEnv.authenticatedContext('user123');
    otherUserContext = testEnv.authenticatedContext('otheruser');
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('Users Collection', () => {
    test('authenticated users can read their own document', async () => {
      const userDoc = authenticatedContext.firestore().collection('users').doc('user123');
      await assertSucceeds(userDoc.get());
    });

    test('authenticated users can write their own document', async () => {
      const userDoc = authenticatedContext.firestore().collection('users').doc('user123');
      await assertSucceeds(userDoc.set({ username: 'testuser' }));
    });

    test('users cannot read other users documents', async () => {
      const otherUserDoc = authenticatedContext.firestore().collection('users').doc('otheruser');
      await assertFails(otherUserDoc.get());
    });

    test('unauthenticated users cannot read any user document', async () => {
      const userDoc = unauthenticatedContext.firestore().collection('users').doc('user123');
      await assertFails(userDoc.get());
    });
  });

  describe('Usernames Collection', () => {
    test('authenticated users can read any username document', async () => {
      const usernameDoc = authenticatedContext.firestore().collection('usernames').doc('someusername');
      await assertSucceeds(usernameDoc.get());
    });

    test('authenticated users can create their own username document', async () => {
      const usernameDoc = authenticatedContext.firestore().collection('usernames').doc('newusername');
      await assertSucceeds(usernameDoc.set({ 
        userId: 'user123',
        createdAt: new Date(),
        isGenerated: false
      }));
    });

    test('users cannot create username document for other users', async () => {
      const usernameDoc = authenticatedContext.firestore().collection('usernames').doc('otherusername');
      await assertFails(usernameDoc.set({ 
        userId: 'otheruser', // Different from authenticated user
        createdAt: new Date(),
        isGenerated: false
      }));
    });

    test('users can delete their own username document', async () => {
      // First create a username document
      const usernameDoc = authenticatedContext.firestore().collection('usernames').doc('myusername');
      await usernameDoc.set({ 
        userId: 'user123',
        createdAt: new Date(),
        isGenerated: false
      });
      
      // Then try to delete it
      await assertSucceeds(usernameDoc.delete());
    });

    test('users cannot delete other users username document', async () => {
      // First create a username document as otheruser
      const otherUsernameDoc = otherUserContext.firestore().collection('usernames').doc('otherusername');
      await otherUsernameDoc.set({ 
        userId: 'otheruser',
        createdAt: new Date(),
        isGenerated: false
      });
      
      // Try to delete it as user123
      const usernameDoc = authenticatedContext.firestore().collection('usernames').doc('otherusername');
      await assertFails(usernameDoc.delete());
    });

    test('unauthenticated users cannot read username documents', async () => {
      const usernameDoc = unauthenticatedContext.firestore().collection('usernames').doc('anyusername');
      await assertFails(usernameDoc.get());
    });

    test('unauthenticated users cannot create username documents', async () => {
      const usernameDoc = unauthenticatedContext.firestore().collection('usernames').doc('newusername');
      await assertFails(usernameDoc.set({ 
        userId: 'someuser',
        createdAt: new Date(),
        isGenerated: false
      }));
    });
  });

  describe('Tasks Collection', () => {
    test('authenticated users can read tasks', async () => {
      const taskDoc = authenticatedContext.firestore().collection('tasks').doc('task1');
      await assertSucceeds(taskDoc.get());
    });

    test('authenticated users cannot write tasks', async () => {
      const taskDoc = authenticatedContext.firestore().collection('tasks').doc('task1');
      await assertFails(taskDoc.set({ name: 'New Task' }));
    });

    test('unauthenticated users cannot read tasks', async () => {
      const taskDoc = unauthenticatedContext.firestore().collection('tasks').doc('task1');
      await assertFails(taskDoc.get());
    });
  });

  describe('Daily Task History Collection', () => {
    test('users can read their own history', async () => {
      // First create a history document
      const historyDoc = authenticatedContext.firestore().collection('daily_task_history').doc('history1');
      await historyDoc.set({ userId: 'user123', date: '2024-01-01' });
      
      // Then read it
      await assertSucceeds(historyDoc.get());
    });

    test('users cannot read other users history', async () => {
      // Create history for other user
      const otherHistoryDoc = otherUserContext.firestore().collection('daily_task_history').doc('history2');
      await otherHistoryDoc.set({ userId: 'otheruser', date: '2024-01-01' });
      
      // Try to read as different user
      const historyDoc = authenticatedContext.firestore().collection('daily_task_history').doc('history2');
      await assertFails(historyDoc.get());
    });

    test('users can write their own history', async () => {
      const historyDoc = authenticatedContext.firestore().collection('daily_task_history').doc('history3');
      await assertSucceeds(historyDoc.set({ userId: 'user123', date: '2024-01-01' }));
    });
  });

  describe('Global Counters Collection', () => {
    test('authenticated users can read global counters', async () => {
      const counterDoc = authenticatedContext.firestore().collection('global_counters').doc('counter1');
      await assertSucceeds(counterDoc.get());
    });

    test('authenticated users cannot write global counters', async () => {
      const counterDoc = authenticatedContext.firestore().collection('global_counters').doc('counter1');
      await assertFails(counterDoc.set({ count: 100 }));
    });

    test('unauthenticated users cannot read global counters', async () => {
      const counterDoc = unauthenticatedContext.firestore().collection('global_counters').doc('counter1');
      await assertFails(counterDoc.get());
    });
  });

  describe('Unknown Collections', () => {
    test('all access to unknown collections should be denied', async () => {
      const unknownDoc = authenticatedContext.firestore().collection('unknown').doc('doc1');
      await assertFails(unknownDoc.get());
      await assertFails(unknownDoc.set({ data: 'test' }));
    });
  });
});