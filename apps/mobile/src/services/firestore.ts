/**
 * Consolidated Firestore service exports
 * This file maintains backward compatibility while organizing code into domain-specific services
 */

// Re-export all user-related functions
export {
  createUser,
  getUser,
  updateUser,
  updateUserFCMToken
} from './userService';

// Re-export all task-related functions
export {
  getTasks,
  getTask
} from './taskService';

// Re-export all history-related functions
export {
  addDailyTaskHistory,
  getUserTaskHistory,
  getUserTaskHistoryRange,
  getUserTaskHistoryWithTasks,
  markTaskAsCompleted
} from './historyService';

// Re-export all counter-related functions
export {
  getGlobalCounter,
  incrementGlobalCounter
} from './counterService';

// Re-export all follow-related functions
export {
  followUser,
  unfollowUser,
  getFollowedUsers,
  getFollowers,
  getFollowing,
  isFollowing
} from './followService';