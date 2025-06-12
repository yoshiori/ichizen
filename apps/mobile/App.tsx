import React from 'react';
import './src/i18n';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider } from './src/contexts/AuthContext';
import { TabNavigation } from './src/components/TabNavigation';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TabNavigation />
      </AuthProvider>
    </ErrorBoundary>
  );
}
