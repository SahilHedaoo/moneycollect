import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { Picker } from '@react-native-picker/picker';
import AppBar from '../components/AppBar';
import { useRoute } from '@react-navigation/native';

const AddUserScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [packageName, setPackageName] = useState('Daily');
  const [packageAmount, setPackageAmount] = useState('');

  const route = useRoute();

  const handleAddUser = async () => {
    if (!firstName || !lastName || !phone || !packageName || !packageAmount) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    try {
      await api.post(
        '/users',
        {
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          package_name: packageName,
          package_amount: parseFloat(packageAmount)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'User added successfully!');
      // Clear inputs
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setPackageName('Daily');
      setPackageAmount('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add user');
    }
  };

  return (
    <View style={styles.container}>
      <AppBar title='Add User' route={route.name} />
      <ScrollView contentContainerStyle={styles.subcontainer} showsVerticalScrollIndicator={false}>
        <TextInput style={styles.input} placeholder="First Name *" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Last Name *" value={lastName} onChangeText={setLastName} />
        <TextInput style={styles.input} placeholder="Phone *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Text style={styles.label}>Package Name *</Text>
        <Picker selectedValue={packageName} onValueChange={setPackageName} style={styles.input}>
          <Picker.Item label="Daily" value="Daily" />
          <Picker.Item label="Weekly" value="Weekly" />
          <Picker.Item label="Monthly" value="Monthly" />
        </Picker>

        <TextInput style={styles.input} placeholder="Package Amount *" value={packageAmount} onChangeText={setPackageAmount} keyboardType="numeric" />

        <Button title="Add User" onPress={handleAddUser} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subcontainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
});

export default AddUserScreen;
