/* eslint-env jest */

const mockFunctions = () => ({
  region: jest.fn(() => ({
    httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({data: {}}))),
  })),
  httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({data: {}}))),
});

// Mock modular API for v22
const mockGetFunctions = jest.fn(() => ({}));
const mockHttpsCallable = jest.fn(() => jest.fn(() => Promise.resolve({data: {}})));

// Export with both default and named exports for compatibility
export default mockFunctions;
export const getFunctions = mockGetFunctions;
export const httpsCallable = mockHttpsCallable;
