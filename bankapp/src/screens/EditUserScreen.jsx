import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import AppBar from '../components/AppBar';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditUserScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [packageName, setPackageName] = useState(user.package_name || 'daily');
  const [packageAmount, setPackageAmount] = useState(String(user.package_amount || ''));

  const handleUpdate = async () => {
    if (!firstName || !lastName || !phone || !packageName || !packageAmount) {
      Alert.alert('Validation', 'Please fill in all required fields');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      await api.put(
        `/users/${user.id}`,
        {
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          package_name: packageName,
          package_amount: parseFloat(packageAmount)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Alert.alert('Success', 'User updated successfully!');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update user');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.subcontainer} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.input}
          placeholder="First Name *"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name *"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone *"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Email (optional)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Package Name *</Text>
        <Picker
          selectedValue={packageName}
          onValueChange={(itemValue) => setPackageName(itemValue)}
          style={styles.input}
        >
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
          <Picker.Item label="Monthly" value="monthly" />
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Package Amount *"
          value={packageAmount}
          onChangeText={setPackageAmount}
          keyboardType="numeric"
        />

        <Button title="Update User" onPress={handleUpdate} color="#2196F3" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  subcontainer: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5
  }
});

export default EditUserScreen;
