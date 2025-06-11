import React from 'react';
import './src/i18n';
import { AuthProvider } from './src/contexts/AuthContext';
import { TabNavigation } from './src/components/TabNavigation';

export default function App() {
  return (
    <AuthProvider>
      <TabNavigation />
    </AuthProvider>
  );
}
