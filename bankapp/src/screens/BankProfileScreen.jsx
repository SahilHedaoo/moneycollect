import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AppBar from '../components/AppBar';
import { useRoute } from '@react-navigation/native';
import useFetch from '../hooks/useFetch';

const BankProfileScreen = ({ navigation }) => {
  const { data: users, loading: usersLoading } = useFetch('/users');
  const { data: collections, loading: collectionsLoading } = useFetch('/collections/get');
  const [bank, setBank] = useState(null);
  const route = useRoute();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token); // 🔍 ADD THIS
      try {
        const res = await api.get('/banks/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBank(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load bank profile');
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login'); // Send back to login
  };

  return (
    <View style={styles.container}>
      <AppBar title='Bank Profile' route={route.name} />
      <ScrollView contentContainerStyle={styles.subcontainer} showsVerticalScrollIndicator={false}>
        {bank ? (
          <>
            <Text style={styles.label}>Name: {bank.name}</Text>
            <Text style={styles.label}>Email: {bank.email}</Text>
            <Button title="Logout" onPress={handleLogout} />
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  subcontainer: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 18, marginBottom: 10 },
});

export default BankProfileScreen;
