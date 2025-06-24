import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';

const App = () => {
  return (
    <PaperProvider>
    <SafeAreaProvider>
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
    <StatusBar
      animated= {true}
      backgroundColor={'#00bbfff'}
      barStyle={'dark-content'}
    />
    </SafeAreaProvider></PaperProvider>
  );
};

export default App;
