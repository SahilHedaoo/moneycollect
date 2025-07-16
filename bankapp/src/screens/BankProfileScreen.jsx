import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import useFetch from '../hooks/useFetch';
import { showToast } from '../ui/toast';
import { ThemeContext } from '../context/themeContext';
import { darkTheme, lightTheme } from '../styles/themes';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BankProfileScreen = ({ navigation }) => {
  const { data: users } = useFetch('/users');
  const { data: collections } = useFetch('/collections/get');
  const [bank, setBank] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { theme, toggleTheme } = useContext(ThemeContext);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        setLoading(true);
        const res = await api.get('/banks/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBank(res.data);
      } catch (err) {
        console.error(err);
        showToast('error', 'Failed to load bank profile');
      }finally{
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const togglePasswordForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPasswordForm(!showPasswordForm);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Validation Error', 'Please fill in all fields');
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert('Validation Error', 'New passwords do not match');
    }

    try {
      const token = await AsyncStorage.getItem('token');
      await api.post(
        '/banks/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('success', 'Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
          {loading && (
            <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginVertical: 10 }} />
          )}
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>

      <ScrollView
        contentContainerStyle={[styles.subcontainer, { backgroundColor: currentTheme.card }]}
        showsVerticalScrollIndicator={false}
      >
        {bank ? (
          <>
            <Text style={[styles.label, { backgroundColor: currentTheme.background, color: currentTheme.text }]}>
              Name: {bank.name}
            </Text>
            <Text style={[styles.label, { backgroundColor: currentTheme.background, color: currentTheme.text }]}>
              Email: {bank.email}
            </Text>
          </>
        ) : (
          <Text style={{ color: currentTheme.text }}>Loading...</Text>
        )}

        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: currentTheme.primary }]}
          onPress={togglePasswordForm}
        >
          <Text style={styles.toggleBtnText}>
            {showPasswordForm ? 'Cancel Change Password' : 'Change Password'}
          </Text>
        </TouchableOpacity>

        {/* 🔄 Theme Toggle Button */}
        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: theme === 'dark' ? '#444' : '#ccc', marginTop: 12 }]}
          onPress={toggleTheme}
        >
          <Text style={[styles.toggleBtnText, { color: theme === 'dark' ? '#fff' : '#000' }]}>
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </Text>
        </TouchableOpacity>

        {showPasswordForm && (
          <View style={styles.formSection}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: currentTheme.input,
                  color: currentTheme.text,
                  borderColor: currentTheme.border,
                },
              ]}
              secureTextEntry
              placeholder="Old Password"
              placeholderTextColor="#888"
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: currentTheme.input,
                  color: currentTheme.text,
                  borderColor: currentTheme.border,
                },
              ]}
              secureTextEntry
              placeholder="New Password"
              placeholderTextColor="#888"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: currentTheme.input,
                  color: currentTheme.text,
                  borderColor: currentTheme.border,
                },
              ]}
              secureTextEntry
              placeholder="Confirm New Password"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
              <Text style={styles.buttonText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subcontainer: {
    flexGrow: 1,
    padding: 24,
    margin: 16,
    borderRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 18,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  toggleBtn: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleBtnText: {
    fontWeight: 'bold',
  },
  formSection: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BankProfileScreen;
