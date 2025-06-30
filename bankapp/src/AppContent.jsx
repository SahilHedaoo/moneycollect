import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import AuthNavigator from './navigation/AuthNavigator';

const AppContent = () => {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <AuthNavigator />
        <StatusBar
          animated={true}
          backgroundColor={'#00bbff'}
          barStyle={'light-content'}
        />
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default AppContent;