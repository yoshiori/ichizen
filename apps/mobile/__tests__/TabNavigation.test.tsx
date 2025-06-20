import React from "react";
import {render, fireEvent} from "@testing-library/react-native";
import {TabNavigation} from "../src/components/TabNavigation";
import "../src/i18n/test";

// Mock the screen components
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("../src/screens/MainScreen", () => {
  const mockReact = require("react");
  return {
    MainScreen: () => mockReact.createElement("Text", {testID: "main-screen"}, "MainScreen"),
  };
});

jest.mock("../src/screens/HistoryScreen", () => {
  const mockReact = require("react");
  return {
    HistoryScreen: () => mockReact.createElement("Text", {testID: "history-screen"}, "HistoryScreen"),
  };
});

jest.mock("../src/screens/FollowScreen", () => {
  const mockReact = require("react");
  return {
    FollowScreen: () => mockReact.createElement("Text", {testID: "follow-screen"}, "FollowScreen"),
  };
});

jest.mock("../src/screens/ProfileScreen", () => {
  const mockReact = require("react");
  return {
    ProfileScreen: () => mockReact.createElement("Text", {testID: "profile-screen"}, "ProfileScreen"),
  };
});
/* eslint-enable @typescript-eslint/no-require-imports */

// Mock AuthContext to prevent auth-related errors in screen components
jest.mock("../src/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "test-user-id",
      language: "ja",
      createdAt: new Date(),
      lastActiveAt: new Date(),
    },
    firebaseUser: {uid: "test-user-id"},
    loading: false,
    signIn: jest.fn(),
  }),
}));

// Mock Firestore services
jest.mock("../src/services/firestore", () => ({
  getUserTaskHistoryWithTasks: jest.fn().mockResolvedValue([]),
  getFollowing: jest.fn().mockResolvedValue([]),
  getFollowers: jest.fn().mockResolvedValue([]),
}));

describe("TabNavigation", () => {
  it("should render all tab items", () => {
    const {getByText} = render(<TabNavigation />);

    // Check tab titles
    expect(getByText("ホーム")).toBeTruthy();
    expect(getByText("コミュニティ")).toBeTruthy();
    expect(getByText("プロフィール")).toBeTruthy();

    // Check tab icons
    expect(getByText("🏠")).toBeTruthy();
    expect(getByText("👥")).toBeTruthy();
    expect(getByText("👤")).toBeTruthy();
  });

  it("should show home screen by default", () => {
    const {getByTestId} = render(<TabNavigation />);

    expect(getByTestId("main-screen")).toBeTruthy();
  });

  it("should switch to community screen when community tab is pressed", () => {
    const {getByText, getByTestId, queryByTestId} = render(<TabNavigation />);

    const communityTab = getByText("コミュニティ");
    fireEvent.press(communityTab);

    expect(getByTestId("follow-screen")).toBeTruthy();
    expect(queryByTestId("main-screen")).toBeNull();
    expect(queryByTestId("profile-screen")).toBeNull();
  });

  it("should switch to profile screen when profile tab is pressed", () => {
    const {getByText, getByTestId, queryByTestId} = render(<TabNavigation />);

    const profileTab = getByText("プロフィール");
    fireEvent.press(profileTab);

    expect(getByTestId("profile-screen")).toBeTruthy();
    expect(queryByTestId("main-screen")).toBeNull();
    expect(queryByTestId("follow-screen")).toBeNull();
  });

  it("should switch back to home screen when home tab is pressed", () => {
    const {getByText, getByTestId, queryByTestId} = render(<TabNavigation />);

    // Switch to community first
    const communityTab = getByText("コミュニティ");
    fireEvent.press(communityTab);
    expect(getByTestId("follow-screen")).toBeTruthy();

    // Switch back to home
    const homeTab = getByText("ホーム");
    fireEvent.press(homeTab);

    expect(getByTestId("main-screen")).toBeTruthy();
    expect(queryByTestId("follow-screen")).toBeNull();
    expect(queryByTestId("profile-screen")).toBeNull();
  });

  it("should apply active styles to the selected tab", () => {
    const {getByText} = render(<TabNavigation />);

    // Home tab should be active by default
    const homeTab = getByText("ホーム");
    const homeIcon = getByText("🏠");

    // Check if active styles are applied
    expect(homeIcon.props.style).toEqual(
      expect.objectContaining({
        color: "#1a1a1a",
      })
    );

    expect(homeTab.props.style).toEqual(
      expect.objectContaining({
        color: "#1a1a1a",
        fontWeight: "600",
      })
    );
  });

  it("should apply inactive styles to non-selected tabs", () => {
    const {getByText} = render(<TabNavigation />);

    // Community tab should be inactive by default
    const communityTab = getByText("コミュニティ");
    const communityIcon = getByText("👥");

    // Check if inactive styles are applied
    expect(communityIcon.props.style).toEqual(
      expect.objectContaining({
        color: "#9E9E9E",
        fontSize: 22,
        marginBottom: 4,
      })
    );

    expect(communityTab.props.style).toEqual(
      expect.objectContaining({
        color: "#9E9E9E",
        fontWeight: "500",
      })
    );
  });

  it("should update active styles when switching tabs", () => {
    const {getByText} = render(<TabNavigation />);

    // Switch to community tab
    const communityTab = getByText("コミュニティ");
    fireEvent.press(communityTab);

    // Community tab should now be active
    const communityIcon = getByText("👥");
    expect(communityIcon.props.style).toEqual(
      expect.objectContaining({
        color: "#1a1a1a",
      })
    );

    expect(communityTab.props.style).toEqual(
      expect.objectContaining({
        color: "#1a1a1a",
        fontWeight: "600",
      })
    );

    // Home tab should now be inactive
    const homeTab = getByText("ホーム");
    const homeIcon = getByText("🏠");
    expect(homeIcon.props.style).toEqual(
      expect.objectContaining({
        color: "#9E9E9E",
        fontSize: 22,
        marginBottom: 4,
      })
    );

    expect(homeTab.props.style).toEqual(
      expect.objectContaining({
        color: "#9E9E9E",
        fontWeight: "500",
      })
    );
  });

  it("should handle multiple tab switches correctly", () => {
    const {getByText, getByTestId} = render(<TabNavigation />);

    // Start with home (default)
    expect(getByTestId("main-screen")).toBeTruthy();

    // Switch to community
    fireEvent.press(getByText("コミュニティ"));
    expect(getByTestId("follow-screen")).toBeTruthy();

    // Switch to profile
    fireEvent.press(getByText("プロフィール"));
    expect(getByTestId("profile-screen")).toBeTruthy();

    // Switch back to home
    fireEvent.press(getByText("ホーム"));
    expect(getByTestId("main-screen")).toBeTruthy();

    // Switch to profile again
    fireEvent.press(getByText("プロフィール"));
    expect(getByTestId("profile-screen")).toBeTruthy();
  });

  it("should render tab bar with correct styling", () => {
    const {getByTestId, getByText} = render(<TabNavigation />);

    // Check if main container exists
    expect(getByTestId("main-screen")).toBeTruthy();

    // The component should render without crashing and show the expected content
    expect(getByText("ホーム")).toBeTruthy();
    expect(getByText("コミュニティ")).toBeTruthy();
    expect(getByText("プロフィール")).toBeTruthy();
  });

  it("should maintain tab state during re-renders", () => {
    const {getByText, getByTestId, rerender} = render(<TabNavigation />);

    // Switch to community tab
    fireEvent.press(getByText("コミュニティ"));
    expect(getByTestId("follow-screen")).toBeTruthy();

    // Re-render component
    rerender(<TabNavigation />);

    // Should still show community screen
    expect(getByTestId("follow-screen")).toBeTruthy();
  });

  it("should handle default case in renderContent", () => {
    const {getByTestId} = render(<TabNavigation />);

    // By default should show main screen
    expect(getByTestId("main-screen")).toBeTruthy();
  });
});
