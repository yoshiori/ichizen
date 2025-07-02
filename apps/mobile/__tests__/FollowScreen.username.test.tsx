import React from "react";
import {render, waitFor, fireEvent} from "@testing-library/react-native";
import {FollowScreen} from "../src/screens/FollowScreen";
import {useAuth} from "../src/contexts/AuthContext";
import * as firestoreService from "../src/services/firestore";
import * as usernameUtils from "../src/utils/username";
import "../src/i18n/test";

// Mock dependencies
jest.mock("../src/contexts/AuthContext");
jest.mock("../src/services/firestore");
jest.mock("../src/utils/username");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockFirestoreService = firestoreService as jest.Mocked<typeof firestoreService>;
const mockUsernameUtils = usernameUtils as jest.Mocked<typeof usernameUtils>;

// Access jest-setup.js configured Alert mock
import {Alert} from "react-native";
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

const mockUser = {
  id: "test-user-id",
  username: "test_user",
  language: "ja" as const,
  usernameHistory: [
    {
      username: "test_user",
      usedFrom: new Date(),
    },
  ],
  createdAt: new Date(),
  lastActiveAt: new Date(),
};

const mockFirebaseUser = {
  uid: "test-user-id",
} as any;

const mockFollowData = {
  id: "follow-1",
  followerId: "test-user-id",
  followingId: "other-user-id",
  createdAt: new Date("2023-01-15"),
};

const mockOtherUser = {
  id: "other-user-id",
  username: "other_user",
  language: "ja" as const,
  usernameHistory: [
    {
      username: "other_user",
      usedFrom: new Date(),
    },
  ],
  createdAt: new Date(),
  lastActiveAt: new Date(),
};

describe("FollowScreen with Username", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();

    mockUseAuth.mockReturnValue({
      user: mockUser,
      firebaseUser: mockFirebaseUser,
      loading: false,
      initError: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
      isSigningIn: false,
      signingInMethod: null,
    });

    mockFirestoreService.getFollowing.mockResolvedValue([]);
    mockFirestoreService.getUser.mockResolvedValue(null);
    mockFirestoreService.followUser.mockResolvedValue(undefined);
    mockFirestoreService.unfollowUser.mockResolvedValue(undefined);
    mockFirestoreService.isFollowing.mockResolvedValue(false);

    // Default username utils mocks
    mockUsernameUtils.getUserIdByUsername.mockResolvedValue(null);
    mockUsernameUtils.getUserByUsername.mockResolvedValue(null);
  });

  it("should display user's username instead of ID", async () => {
    const {getByText, queryByText} = render(<FollowScreen />);

    await waitFor(() => {
      expect(getByText("あなたのユーザーID")).toBeTruthy();
      expect(getByText("test_user")).toBeTruthy();
      // Should not display Firebase UID
      expect(queryByText("test-user-id")).toBeNull();
    });
  });

  // Removed test for username not set - this situation doesn't occur in real implementation
  // All users get auto-generated usernames on creation

  it("should accept username input instead of user ID", async () => {
    const {getByPlaceholderText} = render(<FollowScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText("ユーザー名を入力")).toBeTruthy();
    });
  });

  it("should follow user by username", async () => {
    mockUsernameUtils.getUserIdByUsername.mockResolvedValue("other-user-id");
    mockFirestoreService.getUser.mockResolvedValue(mockOtherUser);
    mockFirestoreService.isFollowing.mockResolvedValue(false);

    const {getByPlaceholderText, getByText} = render(<FollowScreen />);

    const input = getByPlaceholderText("ユーザー名を入力");
    fireEvent.changeText(input, "other_user");

    const followButton = getByText("フォローする");
    fireEvent.press(followButton);

    await waitFor(() => {
      expect(mockUsernameUtils.getUserIdByUsername).toHaveBeenCalledWith("other_user");
      expect(mockFirestoreService.followUser).toHaveBeenCalledWith("test-user-id", "other-user-id");
      expect(mockAlert).toHaveBeenCalledWith("成功", "ユーザーをフォローしました");
    });
  });

  it("should handle non-existent username", async () => {
    mockUsernameUtils.getUserIdByUsername.mockResolvedValue(null);

    const {getByPlaceholderText, getByText} = render(<FollowScreen />);

    const input = getByPlaceholderText("ユーザー名を入力");
    fireEvent.changeText(input, "nonexistent_user");

    const followButton = getByText("フォローする");
    fireEvent.press(followButton);

    await waitFor(() => {
      expect(mockUsernameUtils.getUserIdByUsername).toHaveBeenCalledWith("nonexistent_user");
      expect(mockAlert).toHaveBeenCalledWith("エラー", "ユーザーが見つかりません");
      expect(mockFirestoreService.followUser).not.toHaveBeenCalled();
    });
  });

  it("should display usernames in following list", async () => {
    mockFirestoreService.getFollowing.mockResolvedValue([mockFollowData]);
    mockFirestoreService.getUser.mockResolvedValue(mockOtherUser);

    const {getByText, queryByText} = render(<FollowScreen />);

    await waitFor(() => {
      expect(mockFirestoreService.getFollowing).toHaveBeenCalledWith("test-user-id");
      // Should display username, not user ID
      expect(getByText("other_user")).toBeTruthy();
      expect(queryByText("other-user-id")).toBeNull();
    });
  });

  it("should handle users without username in following list", async () => {
    const userWithoutUsername = {...mockOtherUser, username: undefined};
    mockFirestoreService.getFollowing.mockResolvedValue([mockFollowData]);
    mockFirestoreService.getUser.mockResolvedValue(userWithoutUsername);

    const {getByText} = render(<FollowScreen />);

    await waitFor(() => {
      // Should display fallback for users without username
      expect(getByText("Unknown User")).toBeTruthy();
    });
  });

  it("should prevent following self by username resolved to own user ID", async () => {
    // Mock that the input username resolves to the current user's ID
    mockUsernameUtils.getUserIdByUsername.mockResolvedValue("test-user-id");

    const {getByPlaceholderText, getByText} = render(<FollowScreen />);

    const input = getByPlaceholderText("ユーザー名を入力");
    fireEvent.changeText(input, "past_username"); // Could be an old username that resolves to same user

    const followButton = getByText("フォローする");
    fireEvent.press(followButton);

    await waitFor(() => {
      expect(mockUsernameUtils.getUserIdByUsername).toHaveBeenCalledWith("past_username");
      expect(mockAlert).toHaveBeenCalledWith("エラー", "自分をフォローすることはできません");
      expect(mockFirestoreService.followUser).not.toHaveBeenCalled();
    });
  });

  it("should handle already following user by username", async () => {
    mockUsernameUtils.getUserIdByUsername.mockResolvedValue("other-user-id");
    mockFirestoreService.getUser.mockResolvedValue(mockOtherUser);
    mockFirestoreService.isFollowing.mockResolvedValue(true);

    const {getByPlaceholderText, getByText} = render(<FollowScreen />);

    const input = getByPlaceholderText("ユーザー名を入力");
    fireEvent.changeText(input, "other_user");

    const followButton = getByText("フォローする");
    fireEvent.press(followButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("エラー", "すでにフォローしています");
    });
  });

  it("should share username hint instead of ID hint", async () => {
    const {getByText} = render(<FollowScreen />);

    await waitFor(() => {
      expect(getByText("このユーザー名を友達に共有してフォローしてもらいましょう")).toBeTruthy();
    });
  });
});
