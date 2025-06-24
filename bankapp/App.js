import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
