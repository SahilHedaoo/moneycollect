import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';
import { CountryPicker } from 'react-native-country-codes-picker';
import { showToast } from '../ui/toast';
import { formatPhoneNumber } from '../utils/phoneUtils';

import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';

const AddUserScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [packageName, setPackageName] = useState('Daily');
  const [packageAmount, setPackageAmount] = useState('');
  const [show, setShow] = useState(false);

  const { theme } = useContext(ThemeContext);
  const selectedTheme = theme === 'light' ? lightTheme : darkTheme;

  const route = useRoute();

  const handleAddUser = async () => {
    if (!firstName || !lastName || !phoneNumber || !packageName || !packageAmount) {
      showToast('error', 'Please fill all required fields');
      return;
    }

    const token = await AsyncStorage.getItem('token');

    try {
      await api.post(
        '/users',
        {
          first_name: firstName,
          last_name: lastName,
          dial_code: dialCode,
          phone: phoneNumber,
          email,
          package_name: packageName,
          package_amount: parseFloat(packageAmount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('success', 'User added successfully!');
      setFirstName('');
      setLastName('');
      setDialCode('');
      setPhoneNumber('');
      setEmail('');
      setPackageName('Daily');
      setPackageAmount('');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to add user');
    }
  };

  const handlePhoneChange = (text) => {
    const numeric = text.replace(/[^0-9]/g, '');
    const cleaned = numeric.replace(new RegExp(`^${dialCode.replace('+', '')}`), '');
    setPhoneNumber(cleaned);
  };

  return (
    <View style={[styles.container, { backgroundColor: selectedTheme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: selectedTheme.text }]}>First Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter first name"
            placeholderTextColor="#999"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={[styles.label, { color: selectedTheme.text }]}>Last Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter last name"
            placeholderTextColor="#999"
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={[styles.label, { color: selectedTheme.text }]}>Phone Number *</Text>
          <View style={styles.phoneContainer}>
            <TouchableOpacity style={styles.dialCodeBox} onPress={() => setShow(true)}>
              <Text style={styles.dialCodeText}>{dialCode}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
            />
          </View>

          <CountryPicker
            show={show}
            pickerButtonOnPress={(item) => {
              setDialCode(item.dial_code);
              setShow(false);
            }}
            onBackdropPress={() => setShow(false)}
            lang="en"
            style={{
              modal: { height: '75%' },
            }}
          />

          <Text style={[styles.label, { color: selectedTheme.text }]}>Email (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={[styles.label, { color: selectedTheme.text }]}>Package Name *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={packageName}
              onValueChange={setPackageName}
              style={styles.picker}
              dropdownIconColor="#333"
            >
              <Picker.Item label="Daily" value="Daily" />
              <Picker.Item label="Weekly" value="Weekly" />
              <Picker.Item label="Monthly" value="Monthly" />
            </Picker>
          </View>

          <Text style={[styles.label, { color: selectedTheme.text }]}>Package Amount *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor="#999"
            value={packageAmount}
            onChangeText={setPackageAmount}
            keyboardType="numeric"
          />

          <View style={styles.buttonWrapper}>
            <Button title="Add User" onPress={handleAddUser} color="#2196F3" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#000',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dialCodeBox: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#e6e6e6',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  dialCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#000',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    paddingHorizontal: 12,
  },
  buttonWrapper: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default AddUserScreen;
