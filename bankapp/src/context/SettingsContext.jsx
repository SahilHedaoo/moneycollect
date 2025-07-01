import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [currency, setCurrency] = useState('');
  const [symbol, setSymbol] = useState('');
  const [country, setCountry] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      const savedCurrency = await AsyncStorage.getItem('selectedCurrency');
      const savedSymbol = await AsyncStorage.getItem('selectedSymbol');
      const savedCountry = await AsyncStorage.getItem('selectedCountry');

      if (savedCurrency) setCurrency(savedCurrency);
      if (savedSymbol) setSymbol(savedSymbol);
      if (savedCountry) setCountry(JSON.parse(savedCountry));
    };

    loadSettings();
  }, []);

  const updateSettings = async (newCurrency, newSymbol, newCountry) => {
    setCurrency(newCurrency);
    setSymbol(newSymbol);
    setCountry(newCountry);

    await AsyncStorage.setItem('selectedCurrency', newCurrency);
    await AsyncStorage.setItem('selectedSymbol', newSymbol);
    await AsyncStorage.setItem('selectedCountry', JSON.stringify(newCountry));
  };

  return (
    <SettingsContext.Provider value={{ currency, symbol, country, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
