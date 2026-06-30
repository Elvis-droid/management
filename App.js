import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { StockProvider } from './src/context/StockContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StockProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </StockProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
