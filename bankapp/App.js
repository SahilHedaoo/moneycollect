import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Appearance } from 'react-native';
import AppContent from './src/AppContent';

const App = () => {
  useEffect(() => {
    Appearance.setColorScheme('light');
  }, [])


  return (
    <NavigationContainer>
      <AppContent />
    </NavigationContainer>
  );
};

export default App;
