import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFetch from '../hooks/useFetch';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerdatarefresh = () => {
       setRefreshKey(prevKey => prevKey + 1);
  }

  const { data: users, loading: usersLoading } = useFetch('/users', refreshKey);
  const { data: collections, loading: collectionsLoading } = useFetch('/collections/get', refreshKey);
  const { data: bankData, loading: bankLoading } = useFetch('/banks/profile', refreshKey);
  const [currency, setCurrency] = useState('');
  const [symbol, setSymbol] = useState('');
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const loader = usersLoading + collectionsLoading + bankLoading;

  console.log("data", collections);

  useEffect(() => {
    const loadSettings = async () => {
      const savedCurrency = await AsyncStorage.getItem('selectedCurrency');
      const savedSymbol = await AsyncStorage.getItem('selectedSymbol');
      const savedCountry = await AsyncStorage.getItem('selectedCountry');

      if (savedCurrency) setCurrency(savedCurrency);
      if (savedSymbol) setSymbol(savedSymbol);
      if (savedCountry) setCountry(JSON.parse(savedCountry));

      setLoading(false); // NEW
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

  const values = {
    currency, symbol, country, dialCode: country?.dial_code ?? '', updateSettings, loading, users, collections, loader, bankData
  }

  return (
    <SettingsContext.Provider value={values}>
      {children}
    </SettingsContext.Provider>
  );
};
