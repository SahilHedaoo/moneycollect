import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const FilteredCollectionsScreen = ({ route }) => {
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [ userId, userName ] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not load users');
    }
  };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchcollections = async () => {
      const id = await AsyncStorage.getItem('id');
      try {
        const res = await api.get(`/collections/collections?user_id=${Number(id)}`);
        console.log("res", res);
        setCollections(res);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not load collections');
      }
    };

    fetchcollections();
  }, []);

  const fetchcollections = async () => {
    const id = await AsyncStorage.getItem('id');
    try {
      const res = await api.get(`/collections/collections?user_id=${Number(id)}`);
      console.log("res", res);
      setCollections(res);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not load collections');
    }
  };

  console.log('collections', collections);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Collections:</Text>
      {/* <FlatList
        data={collections}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
            <Text>Amount: ₹{item.amount}</Text>
            <Text>Date: {item.date}</Text>
          </View>
        )}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: "#fff" },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  name: { fontWeight: 'bold', fontSize: 16 },
});

export default FilteredCollectionsScreen;
