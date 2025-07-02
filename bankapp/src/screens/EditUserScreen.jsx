import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showToast } from '../ui/toast';
import { SettingsContext } from '../context/SettingsContext';

const EditUserScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;
  const { dialCode } = useContext(SettingsContext);

  if (!dialCode) {
    console.warn('dialCode is not available in SettingsContext');
    showToast('error', 'Phone dial code is missing');
    return <Text>Configuration error. Please try again later.</Text>;
  }

  const initialPhone = user.phone?.replace(/^\+?[0-9]{1,4}/, '') || '';
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(user.email || '');
  const [packageName, setPackageName] = useState(user.package_name || 'daily');
  const [packageAmount, setPackageAmount] = useState(String(user.package_amount || ''));

  const handleUpdate = async () => {
    if (!firstName || !lastName || !phone || !packageName || !packageAmount) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    if (phone.length < 7) {
      showToast('error', 'Phone number is too short');
      return;
    }

    const packageAmountNum = parseFloat(packageAmount);
    if (isNaN(packageAmountNum)) {
      showToast('error', 'Package amount must be a valid number');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showToast('error', 'Authentication token not found');
        return;
      }

      console.log('Updating user with data:', {
        first_name: firstName,
        last_name: lastName,
        phone: `${dialCode}${phone}`,
        email,
        package_name: packageName,
        package_amount: packageAmountNum,
      });

      await api.put(
        `/users/${user.id}`,
        {
          first_name: firstName,
          last_name: lastName,
          phone: `${dialCode}    ${phone}`,
          email,
          package_name: packageName,
          package_amount: packageAmountNum,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast('success', 'User updated successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Error updating user:', err.message, err.response?.data);
      showToast('error', 'Failed to update user');
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

        <Text style={styles.label}>Phone *</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.dialCode}>{dialCode}</Text>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
          />
        </View>
        <View style={{ marginBottom: 15 }} />

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
  subcontainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  dialCode: {
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#eee',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    height: '100%',
    textAlignVertical: 'center',
    color: '#333',
  },
});

export default EditUserScreen;