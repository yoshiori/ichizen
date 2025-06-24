/* eslint-env jest */

const mockMessaging = () => ({
  requestPermission: jest.fn(() => Promise.resolve(true)),
  getToken: jest.fn(() => Promise.resolve("mock-token")),
  onTokenRefresh: jest.fn(),
  onMessage: jest.fn(),
  onNotificationOpenedApp: jest.fn(),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
  setBackgroundMessageHandler: jest.fn(),
  hasPermission: jest.fn(() => Promise.resolve(true)),
});

export default mockMessaging;
