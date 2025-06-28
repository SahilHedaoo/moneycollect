import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import InputField from '../components/InputField';
import api from '../services/api';
import { TouchableOpacity, isValidForm } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SignupScreen = () => {
  const [bankName, setBankName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleSignup = async () => {
    const trimmedBankName = (bankName || '').trim();
    const trimmedEmail = (email || '').trim();
    const trimmedPassword = (password || '').trim();

    if (!trimmedBankName) {
      Alert.alert('Validation Error', 'Bank name is required');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const response = await api.post('/banks/register', {
        name: trimmedBankName, // still send as `name` in backend
        email: trimmedEmail,
        password: trimmedPassword,
      });

      Alert.alert('Success', 'Bank registered successfully');
      navigation.navigate('Login');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    }
  };

  const isValidForm = () => {
    return (
      bankName.trim().length > 0 &&
      email.trim().includes('@') &&
      email.trim().includes('.') &&
      password.trim().length >= 6
    );
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Bank</Text>
      <InputField placeholder="Bank Name" value={bankName} onChangeText={setBankName} />
      <InputField placeholder="Email" value={email} onChangeText={setEmail} />
      <InputField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />


      <TouchableOpacity
        onPress={handleSignup}
        disabled={!isValidForm()}
        style={[
          styles.button,
          { backgroundColor: isValidForm() ? 'blue' : 'gray' }
        ]}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Log in
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  link: { marginTop: 15, color: 'blue', textAlign: 'center' },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }

});

export default SignupScreen;
