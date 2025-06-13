// Mock firebase-admin before importing functions
jest.mock('firebase-admin', () => {
  const mockFirestore = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
      })),
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
      limit: jest.fn(() => ({
        get: jest.fn(),
      })),
      get: jest.fn(),
    })),
  };

  return {
    initializeApp: jest.fn(),
    firestore: Object.assign(jest.fn(() => mockFirestore), {
      FieldValue: {
        serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
        increment: jest.fn((n: number) => `INCREMENT(${n})`),
      },
    }),
  };
});

// Import functions after mocking
import * as admin from 'firebase-admin';

describe('Cloud Functions Tests', () => {
  const mockFirestore = admin.firestore() as any;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodayTask', () => {
    // Import the actual function implementation for testing
    const { getTodayTask } = require('../index');
    
    it('should throw error when not authenticated', async () => {
      const mockRequest = {
        auth: null,
        data: {},
        rawRequest: {} as any,
      };

      await expect(getTodayTask.run(mockRequest)).rejects.toThrow('Authentication required');
    });

    it('should return a random task when authenticated', async () => {
      const mockTask = {
        id: 'task1',
        data: () => ({
          text: { ja: 'ありがとうを言う', en: 'Say thank you' },
          category: { ja: '人間関係', en: 'Relationships' },
          icon: '💝'
        })
      };

      mockFirestore.collection.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          empty: false,
          size: 1,
          docs: [mockTask]
        })
      });

      const mockRequest = {
        auth: { uid: 'test-user-123' },
        data: {},
        rawRequest: {} as any,
      };
      
      const result = await getTodayTask.run(mockRequest);
      
      expect(result).toMatchObject({
        task: {
          id: 'task1',
          text: { ja: 'ありがとうを言う', en: 'Say thank you' },
          category: { ja: '人間関係', en: 'Relationships' },
          icon: '💝'
        },
        completed: false,
        simplified: true
      });
      expect(result.selectedAt).toBeDefined();
    });

    it('should throw error when no tasks available', async () => {
      mockFirestore.collection.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          empty: true,
          size: 0,
          docs: []
        })
      });

      const mockRequest = {
        auth: { uid: 'test-user-123' },
        data: {},
        rawRequest: {} as any,
      };
      
      await expect(getTodayTask.run(mockRequest)).rejects.toThrow('No tasks available');
    });
  });

  describe('completeTask', () => {
    const { completeTask } = require('../index');
    
    it('should throw error when not authenticated', async () => {
      const mockRequest = {
        auth: null,
        data: {},
        rawRequest: {} as any,
      };
      
      await expect(completeTask.run(mockRequest)).rejects.toThrow('Authentication required');
    });

    it('should return success when authenticated', async () => {
      const mockDocRef = {
        update: jest.fn().mockResolvedValue(null)
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const mockRequest = {
        auth: { uid: 'test-user-123' },
        data: {},
        rawRequest: {} as any,
      };
      
      const result = await completeTask.run(mockRequest);
      
      expect(result).toMatchObject({
        success: true,
        userId: 'test-user-123',
        simplified: true
      });
      expect(result.completedAt).toBeDefined();
    });

    it('should handle global counter update error gracefully', async () => {
      const mockDocRef = {
        update: jest.fn().mockRejectedValue(new Error('Update failed'))
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const mockRequest = {
        auth: { uid: 'test-user-123' },
        data: {},
        rawRequest: {} as any,
      };
      
      // Should not throw even if counter update fails
      const result = await completeTask.run(mockRequest);
      
      expect(result).toMatchObject({
        success: true,
        userId: 'test-user-123',
        simplified: true
      });
    });
  });

  describe('testFunction', () => {
    const { testFunction } = require('../index');
    
    it('should return hello message', async () => {
      const mockRequest = {
        auth: null,
        data: {},
        rawRequest: {} as any,
      };
      
      const result = await testFunction.run(mockRequest);
      
      expect(result).toEqual({
        message: 'Hello from Cloud Functions!'
      });
    });
  });

  describe('testFirestore', () => {
    const { testFirestore } = require('../index');
    
    it('should return task data when tasks exist', async () => {
      const mockTask = {
        data: () => ({
          text: { ja: 'ゴミを拾う', en: 'Pick up trash' },
          category: { ja: '環境', en: 'Environment' },
          icon: '🌱'
        })
      };

      mockFirestore.collection.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            empty: false,
            size: 1,
            docs: [mockTask]
          })
        })
      });

      const mockRequest = {
        auth: null,
        data: {},
        rawRequest: {} as any,
      };
      
      const result = await testFirestore.run(mockRequest);
      
      expect(result).toEqual({
        success: true,
        taskCount: 1,
        firstTask: {
          text: { ja: 'ゴミを拾う', en: 'Pick up trash' },
          category: { ja: '環境', en: 'Environment' },
          icon: '🌱'
        }
      });
    });

    it('should return error when no tasks found', async () => {
      mockFirestore.collection.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            empty: true,
            size: 0,
            docs: []
          })
        })
      });

      const mockRequest = {
        auth: null,
        data: {},
        rawRequest: {} as any,
      };
      
      const result = await testFirestore.run(mockRequest);
      
      expect(result).toEqual({
        error: 'No tasks in collection'
      });
    });
  });

  describe('dailyTaskScheduler', () => {
    const { dailyTaskScheduler } = require('../index');
    
    it('should initialize global counter for today', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ totalDoneAllTime: 100 })
        }),
        set: jest.fn().mockResolvedValue(null)
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const mockEvent = {
        scheduleTime: new Date().toISOString(),
        jobName: 'test-job',
      };
      
      await dailyTaskScheduler.run(mockEvent);
      
      expect(mockDocRef.set).toHaveBeenCalledWith({
        date: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
        totalDoneToday: 0,
        totalDoneAllTime: 100,
        lastUpdated: 'SERVER_TIMESTAMP'
      });
    });

    it('should handle missing yesterday counter gracefully', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: false
        }),
        set: jest.fn().mockResolvedValue(null)
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const mockEvent = {
        scheduleTime: new Date().toISOString(),
        jobName: 'test-job',
      };
      
      await dailyTaskScheduler.run(mockEvent);
      
      expect(mockDocRef.set).toHaveBeenCalledWith({
        date: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
        totalDoneToday: 0,
        totalDoneAllTime: 0,
        lastUpdated: 'SERVER_TIMESTAMP'
      });
    });
  });
});