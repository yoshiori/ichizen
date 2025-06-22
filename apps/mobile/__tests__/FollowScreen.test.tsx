import React from "react";
import {render, waitFor, fireEvent} from "@testing-library/react-native";
import {FollowScreen} from "../src/screens/FollowScreen";
import {useAuth} from "../src/contexts/AuthContext";
import * as firestoreService from "../src/services/firestore";
import "../src/i18n/test";

// Mock dependencies
jest.mock("../src/contexts/AuthContext");
jest.mock("../src/services/firestore");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockFirestoreService = firestoreService as jest.Mocked<typeof firestoreService>;

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

describe("FollowScreen", () => {
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
    });

    mockFirestoreService.getFollowing.mockResolvedValue([]);
    mockFirestoreService.getUser.mockResolvedValue(null);
    mockFirestoreService.followUser.mockResolvedValue(undefined);
    mockFirestoreService.unfollowUser.mockResolvedValue(undefined);
    mockFirestoreService.isFollowing.mockResolvedValue(false);
  });

  it("should render follow screen when user is authenticated", async () => {
    const {getByText} = render(<FollowScreen />);

    await waitFor(() => {
      expect(getByText("フォロー管理")).toBeTruthy();
      expect(getByText("あなたのユーザーID")).toBeTruthy();
      expect(getByText("test-user-id")).toBeTruthy();
      expect(getByText("ユーザーをフォロー")).toBeTruthy();
    });
  });

  it("should show auth required message when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      firebaseUser: null,
      loading: false,
      initError: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
    });

    const {getByText} = render(<FollowScreen />);

    expect(getByText("ログインが必要です")).toBeTruthy();
  });

  it("should display user ID and hint message", async () => {
    const {getByText} = render(<FollowScreen />);

    await waitFor(() => {
      expect(getByText("test-user-id")).toBeTruthy();
      expect(getByText("このIDを友達に共有してフォローしてもらいましょう")).toBeTruthy();
    });
  });

  it("should load and display following list", async () => {
    mockFirestoreService.getFollowing.mockResolvedValue([mockFollowData]);
    mockFirestoreService.getUser.mockResolvedValue(mockOtherUser);

    const {getByText} = render(<FollowScreen />);

    await waitFor(() => {
      expect(mockFirestoreService.getFollowing).toHaveBeenCalledWith("test-user-id");
      // FollowScreen displays user ID, not username
      expect(getByText("other-user-id")).toBeTruthy();
    });
  });

  it("should show empty state when no one is being followed", async () => {
    mockFirestoreService.getFollowing.mockResolvedValue([]);

    const {getByText} = render(<FollowScreen />);

    await waitFor(() => {
      expect(getByText("フォロー中のユーザーはいません")).toBeTruthy();
    });
  });

  it("should handle input changes in follow user field", async () => {
    const {getByDisplayValue, getByPlaceholderText} = render(<FollowScreen />);

    const input = getByPlaceholderText("ユーザーIDを入力");
    fireEvent.changeText(input, "new-user-id");

    expect(getByDisplayValue("new-user-id")).toBeTruthy();
  });

  it("should prevent following self", async () => {
    const {getByPlaceholderText, getByText} = render(<FollowScreen />);

    const input = getByPlaceholderText("ユーザーIDを入力");
    fireEvent.changeText(input, "test-user-id");

    const followButton = getByText("フォローする");
    fireEvent.press(followButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("エラー", "自分をフォローすることはできません");
    });
  });

  it("should handle following non-existent user", async () => {
    mockFirestoreService.getUser.mockResolvedValue(null);

    const {getByPlaceholderText, getByText} = render(<FollowScreen />);

    const input = getByPlaceholderText("ユーザーIDを入力");
    fireEvent.changeText(input, "nonexistent-user");

    const followButton = getByText("フォローする");
    fireEvent.press(followButton);

    await waitFor(() => {
      expect(mockFirestoreService.getUser).toHaveBeenCalledWith("nonexistent-user");
      expect(mockAlert).toHaveBeenCalledWith("エラー", "ユーザーが見つかりません");
    });
  });

  it("should handle following already followed user", async () => {
    mockFirestoreService.getUser.mockResolvedValue(mockOtherUser);
    mockFirestoreService.isFollowing.mockResolvedValue(true);

    const {getByPlaceholderText, getByText} = render(<FollowScreen />);

    const input = getByPlaceholderText("ユーザーIDを入力");
    fireEvent.changeText(input, "other-user-id");

    const followButton = getByText("フォローする");
    fireEvent.press(followButton);

    await waitFor(() => {
      expect(mockFirestoreService.isFollowing).toHaveBeenCalledWith("test-user-id", "other-user-id");
      expect(mockAlert).toHaveBeenCalledWith("エラー", "すでにフォローしています");
    });
  });

  it("should successfully follow a user", async () => {
    mockFirestoreService.getUser.mockResolvedValue(mockOtherUser);
    mockFirestoreService.isFollowing.mockResolvedValue(false);

    const {getByPlaceholderText, getByText} = render(<FollowScreen />);

    const input = getByPlaceholderText("ユーザーIDを入力");
    fireEvent.changeText(input, "other-user-id");

    const followButton = getByText("フォローする");
    fireEvent.press(followButton);

    await waitFor(() => {
      expect(mockFirestoreService.followUser).toHaveBeenCalledWith("test-user-id", "other-user-id");
      expect(mockAlert).toHaveBeenCalledWith("成功", "ユーザーをフォローしました");
    });
  });

  it("should successfully unfollow a user", async () => {
    mockFirestoreService.getFollowing.mockResolvedValue([mockFollowData]);
    mockFirestoreService.getUser.mockResolvedValue(mockOtherUser);

    const {getByText} = render(<FollowScreen />);

    await waitFor(() => {
      const unfollowButton = getByText("フォロー解除");
      fireEvent.press(unfollowButton);
    });

    // Expect confirmation dialog to be shown first
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "フォロー解除",
        "このユーザーのフォローを解除しますか？",
        expect.arrayContaining([
          expect.objectContaining({text: "キャンセル"}),
          expect.objectContaining({text: "フォロー解除", onPress: expect.any(Function)}),
        ])
      );
    });

    // Simulate pressing the confirm button
    const confirmCall = mockAlert.mock.calls[0];
    const confirmButton = confirmCall[2].find((button: any) => button.text === "フォロー解除");
    await confirmButton.onPress();

    // Now expect the actual unfollow operation
    await waitFor(() => {
      expect(mockFirestoreService.unfollowUser).toHaveBeenCalledWith("test-user-id", "other-user-id");
    });
  });

  it("should handle errors during follow operation", async () => {
    mockFirestoreService.getUser.mockResolvedValue(mockOtherUser);
    mockFirestoreService.isFollowing.mockResolvedValue(false);
    mockFirestoreService.followUser.mockRejectedValue(new Error("Network error"));

    const {getByPlaceholderText, getByText} = render(<FollowScreen />);

    const input = getByPlaceholderText("ユーザーIDを入力");
    fireEvent.changeText(input, "other-user-id");

    const followButton = getByText("フォローする");
    fireEvent.press(followButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("エラー", "フォローに失敗しました");
    });
  });

  it("should handle errors during unfollow operation", async () => {
    mockFirestoreService.getFollowing.mockResolvedValue([mockFollowData]);
    mockFirestoreService.getUser.mockResolvedValue(mockOtherUser);
    mockFirestoreService.unfollowUser.mockRejectedValue(new Error("Network error"));

    const {getByText} = render(<FollowScreen />);

    await waitFor(() => {
      const unfollowButton = getByText("フォロー解除");
      fireEvent.press(unfollowButton);
    });

    // Expect confirmation dialog to be shown first
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "フォロー解除",
        "このユーザーのフォローを解除しますか？",
        expect.arrayContaining([
          expect.objectContaining({text: "キャンセル"}),
          expect.objectContaining({text: "フォロー解除", onPress: expect.any(Function)}),
        ])
      );
    });

    // Simulate pressing the confirm button (which will trigger the error)
    const confirmCall = mockAlert.mock.calls[0];
    const confirmButton = confirmCall[2].find((button: any) => button.text === "フォロー解除");
    await confirmButton.onPress();

    // Now expect error handling
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("エラー", "フォロー解除に失敗しました");
    });
  });

  it("should clear input field after successful follow", async () => {
    mockFirestoreService.getUser.mockResolvedValue(mockOtherUser);
    mockFirestoreService.isFollowing.mockResolvedValue(false);

    const {getByPlaceholderText, getByText, queryByDisplayValue} = render(<FollowScreen />);

    const input = getByPlaceholderText("ユーザーIDを入力");
    fireEvent.changeText(input, "other-user-id");

    const followButton = getByText("フォローする");
    fireEvent.press(followButton);

    await waitFor(() => {
      expect(queryByDisplayValue("other-user-id")).toBeNull();
    });
  });
});
