const mockAuth = () => ({
  signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'anonymous-123' } })),
  signInWithCredential: jest.fn(() => Promise.resolve({ user: { uid: 'user-123' } })),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((callback) => {
    // Initially call with null
    callback(null);
    // Return unsubscribe function
    return jest.fn();
  }),
  currentUser: null,
});

// Create GoogleAuthProvider mock
mockAuth.GoogleAuthProvider = jest.fn(() => ({
  credential: jest.fn((token) => ({ providerId: 'google.com', token })),
}));

mockAuth.GoogleAuthProvider.PROVIDER_ID = 'google.com';
mockAuth.GoogleAuthProvider.credential = jest.fn((token) => ({ providerId: 'google.com', token }));

// Create OAuthProvider mock for Apple
mockAuth.OAuthProvider = jest.fn((providerId) => ({
  providerId,
  credential: jest.fn((token) => ({ providerId, token })),
  addScope: jest.fn(),
}));

mockAuth.AppleAuthProvider = {
  PROVIDER_ID: 'apple.com',
  credential: jest.fn((token) => ({ providerId: 'apple.com', token })),
};

// Export the mock function as default
export default mockAuth;