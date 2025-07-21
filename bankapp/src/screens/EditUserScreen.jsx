import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showToast } from '../ui/toast';
import { SettingsContext } from '../context/SettingsContext';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';
import { extractPhoneWithoutDialCode } from '../utils/phoneUtils';

const EditUserScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;
  const { dialCode } = useContext(SettingsContext);
  const { theme } = useContext(ThemeContext);
  const selectedTheme = theme === 'dark' ? darkTheme : lightTheme;

  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user.email || '');
  const [packageName, setPackageName] = useState(user.package_name || 'daily');
  const [packageAmount, setPackageAmount] = useState(String(user.package_amount || ''));

  useEffect(() => {
    setPhone(extractPhoneWithoutDialCode(dialCode, user.phone));
  }, [dialCode]);

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

      await api.put(`/users/${user.id}`, {
        first_name: firstName,
        last_name: lastName,
        dial_code: dialCode,
        phone: phone,
        email,
        package_name: packageName,
        package_amount: packageAmountNum,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showToast('success', 'User updated successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Error updating user:', err);
      showToast('error', 'Failed to update user');
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    subcontainer: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: selectedTheme.background,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
      backgroundColor: selectedTheme.card,
      color: selectedTheme.text,
    },
    label: {
      fontWeight: 'bold',
      marginBottom: 5,
      color: selectedTheme.text,
    },
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      backgroundColor: selectedTheme.card,
    },
    dialCode: {
      paddingHorizontal: 12,
      fontSize: 16,
      fontWeight: '600',
      backgroundColor: selectedTheme.card,
      color: selectedTheme.text,
      borderRightWidth: 1,
      borderColor: '#ccc',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.subcontainer}>
        <TextInput
          style={styles.input}
          placeholder="First Name *"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor={selectedTheme.text + 'AA'}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name *"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor={selectedTheme.text + 'AA'}
        />
        <Text style={styles.label}>Phone *</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.dialCode}>{dialCode}</Text>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
            placeholderTextColor={selectedTheme.text + 'AA'}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Email (optional)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor={selectedTheme.text + 'AA'}
        />
        <Text style={styles.label}>Package Name *</Text>
        <View style={{ borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 15 }}>
          <Picker
            selectedValue={packageName}
            onValueChange={setPackageName}
            style={{ color: selectedTheme.text }}
            dropdownIconColor={selectedTheme.text}
          >
            <Picker.Item label="Daily" value="daily" />
            <Picker.Item label="Weekly" value="weekly" />
            <Picker.Item label="Monthly" value="monthly" />
          </Picker>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Package Amount *"
          value={packageAmount}
          onChangeText={setPackageAmount}
          keyboardType="numeric"
          placeholderTextColor={selectedTheme.text + 'AA'}
        />
        <Button title="Update User" onPress={handleUpdate} color={selectedTheme.primary} />
      </ScrollView>
    </View>
  );
};

export default EditUserScreen;
