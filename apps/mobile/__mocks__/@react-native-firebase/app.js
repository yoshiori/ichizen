/* eslint-env jest */

const mockApp = () => ({
  // Mock Firebase app functionality
});

// Export Firebase app mock
export const firebase = {
  app: jest.fn(() => ({})),
};

export default mockApp;
