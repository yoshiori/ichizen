import { 
  AUTH_PROVIDERS, 
  getFirebaseConsoleUrl, 
  getProjectInfo, 
  checkProviderConfig 
} from '../auth-provider-test';

describe('Authentication Provider Test Utility', () => {
  describe('Provider Configuration', () => {
    it('should have all required auth providers configured', () => {
      expect(AUTH_PROVIDERS).toHaveLength(3);
      
      const providerNames = AUTH_PROVIDERS.map(p => p.name);
      expect(providerNames).toContain('Anonymous');
      expect(providerNames).toContain('Google');
      expect(providerNames).toContain('Apple');
    });

    it('should have implementation status for each provider', () => {
      AUTH_PROVIDERS.forEach(provider => {
        expect(provider.name).toBeDefined();
        expect(typeof provider.isImplemented).toBe('boolean');
        expect(typeof provider.requiresConsoleSetup).toBe('boolean');
        expect(provider.setupInstructions).toBeDefined();
        expect(typeof provider.testFunction).toBe('function');
      });
    });

    it('should mark all providers as implemented', () => {
      AUTH_PROVIDERS.forEach(provider => {
        expect(provider.isImplemented).toBe(true);
      });
    });

    it('should require console setup for all providers', () => {
      AUTH_PROVIDERS.forEach(provider => {
        expect(provider.requiresConsoleSetup).toBe(true);
      });
    });
  });

  describe('Project Information', () => {
    it('should return correct Firebase Console URL', () => {
      const url = getFirebaseConsoleUrl();
      expect(url).toBe('https://console.firebase.google.com/project/ichizen-daily-good-deeds/authentication/providers');
    });

    it('should return project information', () => {
      const info = getProjectInfo();
      expect(info.projectId).toBe('ichizen-daily-good-deeds');
      expect(info.authDomain).toBe('ichizen-daily-good-deeds.firebaseapp.com');
      expect(info.consoleUrl).toBe('https://console.firebase.google.com/project/ichizen-daily-good-deeds/authentication/providers');
      expect(info.currentAuthState).toBeDefined(); // Can be null or user object
    });
  });

  describe('Provider Config Check', () => {
    it('should return false for unconfigured providers', async () => {
      const anonymousConfigured = await checkProviderConfig('anonymous');
      const googleConfigured = await checkProviderConfig('google');
      const appleConfigured = await checkProviderConfig('apple');

      // All should return false since they require manual console configuration
      expect(anonymousConfigured).toBe(false);
      expect(googleConfigured).toBe(false);
      expect(appleConfigured).toBe(false);
    });

    it('should handle unknown providers', async () => {
      const unknownConfigured = await checkProviderConfig('unknown');
      expect(unknownConfigured).toBe(false);
    });
  });

  describe('Setup Instructions', () => {
    it('should provide setup instructions for Anonymous auth', () => {
      const anonymousProvider = AUTH_PROVIDERS.find(p => p.name === 'Anonymous');
      expect(anonymousProvider?.setupInstructions).toContain('Anonymous');
      expect(anonymousProvider?.setupInstructions).toContain('Enable toggle switch');
    });

    it('should provide setup instructions for Google auth', () => {
      const googleProvider = AUTH_PROVIDERS.find(p => p.name === 'Google');
      expect(googleProvider?.setupInstructions).toContain('Google');
      expect(googleProvider?.setupInstructions).toContain('support email');
      expect(googleProvider?.setupInstructions).toContain('signInWithPopup may not work in React Native');
    });

    it('should provide setup instructions for Apple auth', () => {
      const appleProvider = AUTH_PROVIDERS.find(p => p.name === 'Apple');
      expect(appleProvider?.setupInstructions).toContain('Apple');
      expect(appleProvider?.setupInstructions).toContain('App ID');
      expect(appleProvider?.setupInstructions).toContain('Team ID');
      expect(appleProvider?.setupInstructions).toContain('signInWithPopup may not work in React Native');
    });
  });
});