const mockDocumentSnapshot = (exists, data, id = 'mock-doc-id') => ({
  exists,
  id,
  data: () => data,
  ref: {
    delete: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
  },
});

const mockQuerySnapshot = (docs) => ({
  empty: docs.length === 0,
  size: docs.length,
  docs: docs.map((doc, index) => ({
    exists: true,
    id: doc.id || `doc-${index}`,
    data: () => doc.data || doc,
    ref: {
      delete: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
    },
  })),
});

const mockFirestore = () => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve(mockDocumentSnapshot(false, null))),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
      onSnapshot: jest.fn((callback) => {
        callback(mockDocumentSnapshot(true, {}));
        return jest.fn(); // unsubscribe
      }),
    })),
    add: jest.fn(() => Promise.resolve({ id: 'new-doc-id' })),
    get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
    where: jest.fn(() => ({
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
          limit: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
          })),
          orderBy: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
            limit: jest.fn(() => ({
              get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
            })),
          })),
        })),
        limit: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
        })),
        orderBy: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
        })),
        get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
      })),
      limit: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
        limit: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
        })),
      })),
      get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
    })),
    orderBy: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
      limit: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
      })),
    })),
    limit: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve(mockQuerySnapshot([]))),
    })),
  })),
});

// FieldValue mocks
mockFirestore.FieldValue = {
  serverTimestamp: jest.fn(() => new Date()),
  increment: jest.fn((n) => n),
  arrayUnion: jest.fn((...elements) => elements),
  arrayRemove: jest.fn((...elements) => elements),
};

// Timestamp mock
mockFirestore.Timestamp = {
  now: jest.fn(() => ({
    toDate: () => new Date(),
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: 0,
  })),
  fromDate: jest.fn((date) => ({
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  })),
};

export default mockFirestore;