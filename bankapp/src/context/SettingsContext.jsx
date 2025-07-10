// bankapp/src/context/SettingsContext.jsx
import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFetch from '../hooks/useFetch';
import { extractPhoneWithoutDialCode } from '../utils/phoneUtils'; // Import the utility

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currency, setCurrency] = useState('');
  const [symbol, setSymbol] = useState('');
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: users, loading: usersLoading } = useFetch('/users', refreshKey);
  const { data: collections, loading: collectionsLoading } = useFetch('/collections/get', refreshKey);
  const { data: bankData, loading: bankLoading } = useFetch('/banks/profile', refreshKey);
  const loader = usersLoading + collectionsLoading + bankLoading;

  const triggerdatarefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const loadSettings = async () => {
      const savedCurrency = await AsyncStorage.getItem('selectedCurrency');
      const savedSymbol = await AsyncStorage.getItem('selectedSymbol');
      const savedCountry = await AsyncStorage.getItem('selectedCountry');

      if (savedCurrency) setCurrency(savedCurrency);
      if (savedSymbol) setSymbol(savedSymbol);
      if (savedCountry) setCountry(JSON.parse(savedCountry));

      setLoading(false);
    };

    loadSettings();
  }, []);

  const updateSettings = async (newCurrency, newSymbol, newCountry) => {
    const oldCountry = country; // Store the previous country to get old dial code
    setCurrency(newCurrency);
    setSymbol(newSymbol);
    setCountry(newCountry);

    // Save to AsyncStorage
    await AsyncStorage.setItem('selectedCurrency', newCurrency);
    await AsyncStorage.setItem('selectedSymbol', newSymbol);
    await AsyncStorage.setItem('selectedCountry', JSON.stringify(newCountry));

    // Normalize phone numbers in users and collections if country has changed
    if (oldCountry?.dial_code !== newCountry.dial_code && users) {
      const updatedUsers = users.map((user) => {
        if (user.phone) {
          const phoneWithoutDial = extractPhoneWithoutDialCode(oldCountry?.dial_code || '', user.phone);
          return { ...user, dial_code: `${newCountry.dial_code}`, phone: `${phoneWithoutDial}` };
        }
        return user;
      });

      // If collections also contain phone numbers, update them similarly
      if (collections) {
        const updatedCollections = collections.map((collection) => {
          if (collection.phone) {
            const phoneWithoutDial = extractPhoneWithoutDialCode(oldCountry?.dial_code || '', collection.phone);
            return { ...collection, dial_code: `${newCountry.dial_code}`, phone: `${phoneWithoutDial}` };
          }
          return collection;
        });
        console.log('Updated collections with new dial code:', updatedCollections);
      }

      // Trigger data refresh to fetch updated data
      triggerdatarefresh();
    }
  };

  const values = {
    currency,
    symbol,
    country,
    dialCode: country?.dial_code ?? '',
    updateSettings,
    loading,
    users,
    collections,
    loader,
    bankData,
    triggerdatarefresh,
  };

  return (
    <SettingsContext.Provider value={values}>
      {children}
    </SettingsContext.Provider>
  );
};