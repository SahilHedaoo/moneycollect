import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export default function useFetch(apiEndpoint) {
  const [data, setData] = useState(null); // Fix: Use array destructuring
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!apiEndpoint) return;
      setLoading(true);

      try {
        const token = await AsyncStorage.getItem('token');
        const res = await api.get(apiEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiEndpoint]); // Dependency: apiEndpoint passed to the hook

  return { data, loading };
}