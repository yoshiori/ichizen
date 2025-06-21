import React from "react";
import {render, waitFor} from "@testing-library/react-native";
import {FollowScreen} from "../src/screens/FollowScreen";
import {useAuth} from "../src/contexts/AuthContext";
import * as firestoreService from "../src/services/firestore";
import "../src/i18n/test";

// Mock dependencies
jest.mock("../src/contexts/AuthContext");
jest.mock("../src/services/firestore");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockFirestoreService = firestoreService as jest.Mocked<typeof firestoreService>;
const mockAlert = jest.fn();

// Mock Alert at global level
(global as any).Alert = {
  alert: mockAlert,
};

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
});
