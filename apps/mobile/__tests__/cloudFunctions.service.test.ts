import { getTodayTask, completeTask } from '../src/services/cloudFunctions';

// Mock Firebase Functions
const mockGetFunctions = jest.fn();
const mockHttpsCallable = jest.fn();
const mockConnectFunctionsEmulator = jest.fn();

jest.mock('firebase/functions', () => ({
  getFunctions: (...args: any[]) => mockGetFunctions(...args),
  httpsCallable: (...args: any[]) => mockHttpsCallable(...args),
  connectFunctionsEmulator: (...args: any[]) => mockConnectFunctionsEmulator(...args),
}));

// Mock Firebase app
jest.mock('../src/config/firebase', () => ({
  app: { name: 'test-app' },
}));

// Mock window object for test environment
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    href: 'http://localhost:3000'
  },
  writable: true
});

describe('Cloud Functions Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock setup for getFunctions
    mockGetFunctions.mockReturnValue({ name: 'test-functions' });
  });

  describe('getTodayTask', () => {
    it('should successfully get today task from cloud function', async () => {
      // Arrange
      const mockTaskResponse = {
        task: {
          id: 'task_1',
          text: { ja: 'ありがとうを言う', en: 'Say thank you' },
          category: { ja: '人間関係', en: 'Relationships' },
          icon: '💝',
          difficulty: 'easy'
        },
        completed: false,
        selectedAt: new Date('2025-06-12T10:00:00Z'),
        simplified: true
      };

      const mockFunction = jest.fn().mockResolvedValue({
        data: mockTaskResponse
      });
      mockHttpsCallable.mockReturnValue(mockFunction);

      // Act
      const result = await getTodayTask();

      // Assert
      expect(mockHttpsCallable).toHaveBeenCalledWith(
        expect.anything(),
        'getTodayTask'
      );
      expect(mockFunction).toHaveBeenCalled();
      expect(result).toEqual(mockTaskResponse);
    });

    it('should handle error when cloud function fails', async () => {
      // Arrange
      const mockError = new Error('Authentication required');
      const mockFunction = jest.fn().mockRejectedValue(mockError);
      mockHttpsCallable.mockReturnValue(mockFunction);

      // Act & Assert
      await expect(getTodayTask()).rejects.toThrow('Authentication required');
      expect(mockFunction).toHaveBeenCalled();
    });

    it('should handle network error gracefully', async () => {
      // Arrange
      const networkError = { 
        code: 'functions/unavailable',
        message: 'Network error'
      };
      const mockFunction = jest.fn().mockRejectedValue(networkError);
      mockHttpsCallable.mockReturnValue(mockFunction);

      // Act & Assert
      await expect(getTodayTask()).rejects.toMatchObject({
        code: 'functions/unavailable',
        message: 'Network error'
      });
    });
  });

  describe('completeTask', () => {
    it('should successfully complete task via cloud function', async () => {
      // Arrange
      const mockCompleteResponse = {
        success: true,
        completedAt: new Date('2025-06-12T10:30:00Z')
      };

      const mockFunction = jest.fn().mockResolvedValue({
        data: mockCompleteResponse
      });
      mockHttpsCallable.mockReturnValue(mockFunction);

      // Act
      const result = await completeTask();

      // Assert
      expect(mockHttpsCallable).toHaveBeenCalledWith(
        expect.anything(),
        'completeTask'
      );
      expect(mockFunction).toHaveBeenCalled();
      expect(result).toEqual(mockCompleteResponse);
    });

    it('should handle task already completed error', async () => {
      // Arrange
      const mockError = new Error('Task already completed');
      const mockFunction = jest.fn().mockRejectedValue(mockError);
      mockHttpsCallable.mockReturnValue(mockFunction);

      // Act & Assert
      await expect(completeTask()).rejects.toThrow('Task already completed');
    });

    it('should handle authentication error', async () => {
      // Arrange
      const authError = {
        code: 'functions/unauthenticated',
        message: 'Authentication required'
      };
      const mockFunction = jest.fn().mockRejectedValue(authError);
      mockHttpsCallable.mockReturnValue(mockFunction);

      // Act & Assert
      await expect(completeTask()).rejects.toMatchObject({
        code: 'functions/unauthenticated'
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete workflow: get task -> complete task', async () => {
      // Arrange
      const mockTaskResponse = {
        task: {
          id: 'task_2',
          text: { ja: 'ゴミを一個拾う', en: 'Pick up one piece of trash' },
          category: { ja: '環境', en: 'Environment' },
          icon: '♻️',
          difficulty: 'easy'
        },
        completed: false,
        selectedAt: new Date('2025-06-12T10:00:00Z'),
        simplified: true
      };

      const mockCompleteResponse = {
        success: true,
        completedAt: new Date('2025-06-12T10:30:00Z')
      };

      const mockGetTodayTask = jest.fn().mockResolvedValue({ data: mockTaskResponse });
      const mockCompleteTask = jest.fn().mockResolvedValue({ data: mockCompleteResponse });

      mockHttpsCallable
        .mockReturnValueOnce(mockGetTodayTask)  // First call for getTodayTask
        .mockReturnValueOnce(mockCompleteTask); // Second call for completeTask

      // Act
      const taskResult = await getTodayTask();
      const completeResult = await completeTask();

      // Assert
      expect(taskResult.task.id).toBe('task_2');
      expect(taskResult.completed).toBe(false);
      expect(completeResult.success).toBe(true);
      expect(mockHttpsCallable).toHaveBeenCalledTimes(2);
    });
  });
});