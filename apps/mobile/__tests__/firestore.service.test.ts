import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../src/config/firebase';
import {
  createUser,
  getUser,
  updateUser,
  updateUserFCMToken,
  getTasks,
  getTask,
  addDailyTaskHistory,
  getUserTaskHistory,
  getUserTaskHistoryRange,
  getUserTaskHistoryWithTasks,
  getGlobalCounter,
  incrementGlobalCounter,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  isFollowing
} from '../src/services/firestore';

// Mock Firestore
jest.mock('firebase/firestore');
jest.mock('../src/config/firebase');

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockIncrement = increment as jest.MockedFunction<typeof increment>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;

// Mock data
const mockUserData = {
  language: 'ja' as const,
  createdAt: new Date('2023-01-01'),
  lastActiveAt: new Date('2023-01-01')
};

const mockUser = {
  id: 'test-user-id',
  ...mockUserData
};

const mockTask = {
  id: 'test-task-id',
  text: { ja: 'テストタスク', en: 'Test task' },
  category: { ja: 'テスト', en: 'Test' },
  icon: '🧪'
};

const mockDailyTaskHistory = {
  id: 'test-history-id',
  userId: 'test-user-id',
  taskId: 'test-task-id',
  date: '2023-01-01',
  completed: true,
  selectedAt: new Date('2023-01-01T09:00:00Z'),
  completedAt: new Date('2023-01-01T10:00:00Z')
};

const mockGlobalCounter = {
  totalCompleted: 100,
  todayCompleted: 10,
  lastUpdated: new Date('2023-01-01')
};

const mockDocSnapshot = (exists: boolean, data?: any, id: string = 'test-id') => ({
  exists: () => exists,
  id: id,
  data: () => data,
  ref: {}
});

const mockQuerySnapshot = (docs: any[]) => ({
  empty: docs.length === 0,
  docs: docs.map((doc, index) => ({
    id: doc.id || `test-id-${index}`,
    data: () => doc,
    ref: {}
  }))
});

describe('Firestore Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockCollection.mockReturnValue({} as any);
    mockDoc.mockReturnValue({} as any);
    mockQuery.mockReturnValue({} as any);
    mockWhere.mockReturnValue({} as any);
    mockOrderBy.mockReturnValue({} as any);
    mockLimit.mockReturnValue({} as any);
    mockIncrement.mockReturnValue({} as any);
  });

  describe('User operations', () => {
    it('should create user', async () => {
      mockSetDoc.mockResolvedValue(undefined);

      await createUser('test-user-id', mockUserData);

      expect(mockDoc).toHaveBeenCalledWith(db, 'users', 'test-user-id');
      expect(mockSetDoc).toHaveBeenCalledWith({}, mockUserData);
    });

    it('should get existing user', async () => {
      mockGetDoc.mockResolvedValue(mockDocSnapshot(true, mockUserData, 'test-user-id') as any);

      const result = await getUser('test-user-id');

      expect(mockDoc).toHaveBeenCalledWith(db, 'users', 'test-user-id');
      expect(mockGetDoc).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existing user', async () => {
      mockGetDoc.mockResolvedValue(mockDocSnapshot(false) as any);

      const result = await getUser('non-existing-id');

      expect(result).toBeNull();
    });

    it('should update user', async () => {
      const updates = { language: 'en' as const };
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateUser('test-user-id', updates);

      expect(mockDoc).toHaveBeenCalledWith(db, 'users', 'test-user-id');
      expect(mockUpdateDoc).toHaveBeenCalledWith({}, updates);
    });

    it('should update user FCM token', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateUserFCMToken('test-user-id', 'new-token');

      expect(mockDoc).toHaveBeenCalledWith(db, 'users', 'test-user-id');
      expect(mockUpdateDoc).toHaveBeenCalledWith({}, { fcmToken: 'new-token' });
    });
  });

  describe('Task operations', () => {
    it('should get all tasks', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([mockTask]) as any);

      const result = await getTasks();

      expect(mockCollection).toHaveBeenCalledWith(db, 'tasks');
      expect(mockGetDocs).toHaveBeenCalled();
      expect(result).toEqual([{ ...mockTask, id: mockTask.id }]);
    });

    it('should get single task', async () => {
      mockGetDoc.mockResolvedValue(mockDocSnapshot(true, mockTask, 'test-task-id') as any);

      const result = await getTask('test-task-id');

      expect(mockDoc).toHaveBeenCalledWith(db, 'tasks', 'test-task-id');
      expect(result).toEqual({ ...mockTask, id: 'test-task-id' });
    });

    it('should return null for non-existing task', async () => {
      mockGetDoc.mockResolvedValue(mockDocSnapshot(false) as any);

      const result = await getTask('non-existing-id');

      expect(result).toBeNull();
    });
  });

  describe('Daily task history operations', () => {
    it('should add daily task history', async () => {
      const historyData = {
        userId: 'test-user-id',
        taskId: 'test-task-id',
        date: '2023-01-01',
        completed: true,
        selectedAt: new Date(),
        completedAt: new Date()
      };
      mockAddDoc.mockResolvedValue({} as any);

      await addDailyTaskHistory(historyData);

      expect(mockCollection).toHaveBeenCalledWith(db, 'daily_task_history');
      expect(mockAddDoc).toHaveBeenCalledWith({}, historyData);
    });

    it('should get user task history for specific date', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([mockDailyTaskHistory]) as any);

      const result = await getUserTaskHistory('test-user-id', '2023-01-01');

      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'test-user-id');
      expect(mockWhere).toHaveBeenCalledWith('date', '==', '2023-01-01');
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result).toEqual({ ...mockDailyTaskHistory, id: mockDailyTaskHistory.id });
    });

    it('should return null when no history found', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([]) as any);

      const result = await getUserTaskHistory('test-user-id', '2023-01-01');

      expect(result).toBeNull();
    });

    it('should get user task history range', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([mockDailyTaskHistory]) as any);

      const result = await getUserTaskHistoryRange('test-user-id', '2023-01-01', '2023-01-31');

      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'test-user-id');
      expect(mockWhere).toHaveBeenCalledWith('date', '>=', '2023-01-01');
      expect(mockWhere).toHaveBeenCalledWith('date', '<=', '2023-01-31');
      expect(mockOrderBy).toHaveBeenCalledWith('date', 'desc');
      expect(result).toEqual([{ ...mockDailyTaskHistory, id: mockDailyTaskHistory.id }]);
    });

    it('should get user task history with task details', async () => {
      // Mock getUserTaskHistoryRange
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([mockDailyTaskHistory]) as any);
      
      // Mock getTask
      mockGetDoc.mockResolvedValue(mockDocSnapshot(true, mockTask, 'test-task-id') as any);

      const result = await getUserTaskHistoryWithTasks('test-user-id', '2023-01-01', '2023-01-31');

      expect(result).toEqual([
        {
          ...mockDailyTaskHistory,
          id: mockDailyTaskHistory.id,
          task: { ...mockTask, id: 'test-task-id' }
        }
      ]);
    });
  });

  describe('Global counter operations', () => {
    it('should get global counter', async () => {
      mockGetDoc.mockResolvedValue(mockDocSnapshot(true, mockGlobalCounter) as any);

      const result = await getGlobalCounter();

      expect(mockDoc).toHaveBeenCalledWith(db, 'global', 'counter');
      expect(result).toEqual(mockGlobalCounter);
    });

    it('should return null when counter does not exist', async () => {
      mockGetDoc.mockResolvedValue(mockDocSnapshot(false) as any);

      const result = await getGlobalCounter();

      expect(result).toBeNull();
    });

    it('should increment global counter for new day', async () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterdayCounter = {
        ...mockGlobalCounter,
        lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      };
      
      mockGetDoc.mockResolvedValue(mockDocSnapshot(true, yesterdayCounter) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await incrementGlobalCounter();

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          totalCompleted: {},
          todayCompleted: 1,
          lastUpdated: expect.any(Date)
        })
      );
    });

    it('should increment global counter for same day', async () => {
      const todayCounter = {
        ...mockGlobalCounter,
        lastUpdated: new Date() // Today
      };
      
      mockGetDoc.mockResolvedValue(mockDocSnapshot(true, todayCounter) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await incrementGlobalCounter();

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          totalCompleted: {},
          todayCompleted: {},
          lastUpdated: expect.any(Date)
        })
      );
    });
  });

  describe('Follow operations', () => {
    it('should follow user when not already following', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([]) as any); // Not following
      mockAddDoc.mockResolvedValue({} as any);

      await followUser('follower-id', 'following-id');

      expect(mockAddDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          followerId: 'follower-id',
          followingId: 'following-id',
          createdAt: expect.any(Date)
        })
      );
    });

    it('should throw error when already following', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([{}]) as any); // Already following

      await expect(followUser('follower-id', 'following-id'))
        .rejects.toThrow('Already following this user');
    });

    it('should unfollow user when following', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([{}]) as any); // Following
      mockDeleteDoc.mockResolvedValue(undefined);

      await unfollowUser('follower-id', 'following-id');

      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('should throw error when not following', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([]) as any); // Not following

      await expect(unfollowUser('follower-id', 'following-id'))
        .rejects.toThrow('Not following this user');
    });

    it('should get following list', async () => {
      const followData = { id: 'follow-1', followerId: 'user-id', followingId: 'other-id' };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([followData]) as any);

      const result = await getFollowing('user-id');

      expect(mockWhere).toHaveBeenCalledWith('followerId', '==', 'user-id');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toEqual([{ ...followData, id: followData.id }]);
    });

    it('should get followers list', async () => {
      const followData = { id: 'follow-2', followerId: 'other-id', followingId: 'user-id' };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([followData]) as any);

      const result = await getFollowers('user-id');

      expect(mockWhere).toHaveBeenCalledWith('followingId', '==', 'user-id');
      expect(result).toEqual([{ ...followData, id: followData.id }]);
    });

    it('should check if following - true', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([{}]) as any); // Following

      const result = await isFollowing('follower-id', 'following-id');

      expect(result).toBe(true);
    });

    it('should check if following - false', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([]) as any); // Not following

      const result = await isFollowing('follower-id', 'following-id');

      expect(result).toBe(false);
    });
  });
});