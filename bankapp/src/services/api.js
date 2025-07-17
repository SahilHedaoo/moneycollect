// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';

const api = axios.create({
  baseURL: 'http://192.168.1.15:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to auto logout on 401 or 403
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('id');

      // Navigation reference for redirect
      if (global.navigationRef?.current) {
        global.navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }

      Alert.alert('Session Expired', 'Please login again.');
    }

    return Promise.reject(error);
  }
);


export const restoreUser = (userId) => {
  return api.put(`/users/restore/${userId}`, {}); // send empty JSON object
};


export default api;
