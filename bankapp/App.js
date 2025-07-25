import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Appearance } from 'react-native';
import AppContent from './src/AppContent';
import { SettingsProvider } from './src/context/SettingsContext';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from './src/context/themeContext';


const App = () => {
  useEffect(() => {
    Appearance.setColorScheme('light');
  }, [])

  return (
    <ThemeProvider>
    <NavigationContainer>
      <SettingsProvider>
        <AppContent />
         <Toast />
      </SettingsProvider><Toast />
    </NavigationContainer>
    <Toast />
    </ThemeProvider>
  );
};

export default App;
