/* eslint-env jest */

// Enhanced Firestore mock with state management for realistic testing
let mockDocuments = {};

const resetMockData = () => {
  mockDocuments = {};
};

// Mock document reference
const createMockDocumentReference = (collectionName, docId) => {
  const docPath = `${collectionName}/${docId}`;

  return {
    id: docId,
    path: docPath,
    get: jest.fn(async () => {
      const data = mockDocuments[docPath];
      return {
        exists: () => !!data,
        data: () => data,
        id: docId,
        ref: createMockDocumentReference(collectionName, docId),
      };
    }),
    set: jest.fn(async (data, options = {}) => {
      if (options.merge) {
        mockDocuments[docPath] = {...mockDocuments[docPath], ...data};
      } else {
        mockDocuments[docPath] = data;
      }
      return Promise.resolve();
    }),
    update: jest.fn(async (data) => {
      if (!mockDocuments[docPath]) {
        return Promise.reject(new Error(`Mock Firestore: No document to update at path "${docPath}"`));
      }
      mockDocuments[docPath] = {...mockDocuments[docPath], ...data};
      return Promise.resolve();
    }),
    delete: jest.fn(async () => {
      delete mockDocuments[docPath];
      return Promise.resolve();
    }),
  };
};

// Mock collection reference
const createMockCollectionReference = (collectionName) => ({
  doc: jest.fn((docId) => createMockDocumentReference(collectionName, docId)),
  add: jest.fn(async (data) => {
    const mockId = Math.random().toString(36).substring(7);
    const docRef = createMockDocumentReference(collectionName, mockId);
    await docRef.set(data);
    return docRef;
  }),
  where: jest.fn(() => ({
    // NOTE: This is a simplified mock and does not perform actual filtering.
    // It will always return an empty result set.
    // For tests requiring query capabilities, this mock will need to be extended.
    where: jest.fn(() => ({
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          get: jest.fn(() =>
            Promise.resolve({
              docs: [],
              size: 0,
              empty: true,
            })
          ),
        })),
        get: jest.fn(() =>
          Promise.resolve({
            docs: [],
            size: 0,
            empty: true,
          })
        ),
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn(() =>
          Promise.resolve({
            docs: [],
            size: 0,
            empty: true,
          })
        ),
      })),
      get: jest.fn(() =>
        Promise.resolve({
          docs: [],
          size: 0,
          empty: true,
        })
      ),
    })),
    orderBy: jest.fn(() => ({
      get: jest.fn(() =>
        Promise.resolve({
          docs: [],
          size: 0,
          empty: true,
        })
      ),
    })),
    get: jest.fn(() =>
      Promise.resolve({
        docs: [],
        size: 0,
        empty: true,
      })
    ),
  })),
});

// Mock batch operations
const createMockBatch = () => {
  const operations = [];

  return {
    set: jest.fn((docRef, data, options) => {
      operations.push({type: "set", docRef, data, options});
      return Promise.resolve();
    }),
    update: jest.fn((docRef, data) => {
      operations.push({type: "update", docRef, data});
      return Promise.resolve();
    }),
    delete: jest.fn((docRef) => {
      operations.push({type: "delete", docRef});
      return Promise.resolve();
    }),
    commit: jest.fn(async () => {
      // Execute all batched operations
      for (const op of operations) {
        switch (op.type) {
          case "set":
            await op.docRef.set(op.data, op.options);
            break;
          case "update":
            await op.docRef.update(op.data);
            break;
          case "delete":
            await op.docRef.delete();
            break;
        }
      }
      operations.length = 0; // Clear operations
      return Promise.resolve();
    }),
  };
};

// Main firestore mock
const mockFirestore = () => ({
  collection: jest.fn((name) => createMockCollectionReference(name)),
  doc: jest.fn((path) => {
    const [collectionName, docId] = path.split("/");
    return createMockDocumentReference(collectionName, docId);
  }),
  batch: jest.fn(() => createMockBatch()),
  runTransaction: jest.fn((updateFunction) => {
    // Simple transaction mock - just run the function
    return updateFunction({
      get: jest.fn(async (docRef) => {
        return await docRef.get();
      }),
      set: jest.fn(async (docRef, data) => {
        return await docRef.set(data);
      }),
      update: jest.fn(async (docRef, data) => {
        return await docRef.update(data);
      }),
      delete: jest.fn(async (docRef) => {
        return await docRef.delete();
      }),
    });
  }),
  // Expose utilities for testing
  _resetMockData: resetMockData,
  _setMockDocument: (collectionName, docId, data) => {
    mockDocuments[`${collectionName}/${docId}`] = data;
  },
  _getMockDocument: (collectionName, docId) => {
    return mockDocuments[`${collectionName}/${docId}`];
  },
});

// Mock FieldValue for advanced operations
export const FieldValue = {
  serverTimestamp: jest.fn(() => new Date()),
  delete: jest.fn(() => Symbol("delete")),
  increment: jest.fn((n) => n),
  arrayUnion: jest.fn((...items) => items),
  arrayRemove: jest.fn((...items) => items),
};

// Mock Timestamp for date handling
export const Timestamp = {
  now: jest.fn(() => new Date()),
  fromDate: jest.fn((date) => date),
  fromMillis: jest.fn((millis) => new Date(millis)),
};

// Export with both default and named exports for compatibility
export default mockFirestore;
export const getFirestore = jest.fn(() => mockFirestore());

// Reset mock data before each test
beforeEach(() => {
  resetMockData();
});
