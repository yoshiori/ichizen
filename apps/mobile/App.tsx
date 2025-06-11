import React from 'react';
import './src/i18n';
import { AuthProvider } from './src/contexts/AuthContext';
import { MainScreen } from './src/screens/MainScreen';

export default function App() {
  return (
    <AuthProvider>
      <MainScreen />
    </AuthProvider>
  );
}
