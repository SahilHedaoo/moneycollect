import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const EditUserScreen = ({ route, navigation }) => {
  const { user } = route.params;

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [location, setLocation] = useState(user.location);
  const [shopName, setShopName] = useState(user.shop_name);
  const [frequency, setFrequency] = useState(user.frequency);

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.put(`/users/${user.id}`, {
        name,
        phone,
        location,
        shop_name: shopName,
        frequency,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Success', 'User updated!');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update user');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit User</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Shop Name" value={shopName} onChangeText={setShopName} />
      <TextInput style={styles.input} placeholder="Frequency (daily/weekly/monthly)" value={frequency} onChangeText={setFrequency} />

      <Button title="Update User" onPress={handleUpdate} color="#2196F3" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    borderRadius: 8,
    padding: 10,
  },
});

export default EditUserScreen;
