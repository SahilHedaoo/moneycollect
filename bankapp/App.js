import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Appearance, StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';

const App = () => {
  useEffect(() => {
    Appearance.setColorScheme('light');
  }, [])
  
   
  return (
    <PaperProvider>
    <SafeAreaProvider>
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
    <StatusBar
      animated= {true}
      backgroundColor={'#00bbff'}
      barStyle={'dark-content'}
    />
    </SafeAreaProvider></PaperProvider>
  );
};

export default App;
