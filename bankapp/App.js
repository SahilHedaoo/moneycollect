import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Appearance } from 'react-native';
import AppContent from './src/AppContent';
import { SettingsProvider } from './src/context/SettingsContext';
import Toast from 'react-native-toast-message';


const App = () => {
  useEffect(() => {
    Appearance.setColorScheme('light');
  }, [])

  return (
    <NavigationContainer>
      <SettingsProvider>
        <AppContent />
         <Toast />
      </SettingsProvider>
    </NavigationContainer>
  );
};

export default App;
