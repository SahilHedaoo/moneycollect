import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { Picker } from '@react-native-picker/picker';

const AddUserScreen = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [shopName, setShopName] = useState('');
  const [frequency, setFrequency] = useState('daily');

  const handleAddUser = async () => {
    if (!name || !phone || !location || !shopName || !frequency) {
      Alert.alert('Validation', 'Please fill in all fields');
      return;
    }

    const token = await AsyncStorage.getItem('token');

    try {
      await api.post(
        '/users',
        { name, phone, location, shop_name: shopName, frequency },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'User added successfully!');
      setName('');
      setPhone('');
      setLocation('');
      setShopName('');
      setFrequency('daily');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add user');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Customer</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={styles.input}
        placeholder="Shop Name"
        value={shopName}
        onChangeText={setShopName}
      />

      <Text style={styles.label}>Money Receiving Frequency</Text>
      <Picker
        selectedValue={frequency}
        onValueChange={(itemValue) => setFrequency(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Monthly" value="monthly" />
      </Picker>

      <Button title="Add Customer" onPress={handleAddUser} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default AddUserScreen;
