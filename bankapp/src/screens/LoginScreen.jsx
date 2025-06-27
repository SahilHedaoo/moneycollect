import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from '../components/InputField';
import api from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/banks/login', { email, password });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('id', res.data.id.toString());
      console.log("data", res.data);
      Alert.alert('Success', 'Logged in!');
      // Redirect to Dashboard screen 
      // navigation.navigate('Dashboard');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      }); // Redirect to Dashboard
    } catch (err) {
      Alert.alert('Login Failed', err?.response?.data?.message || 'Something went wrong');
    }
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bank Login</Text>
      <InputField placeholder="Email" value={email} onChangeText={setEmail} />
      <InputField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
        Don't have an account? Sign up
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  link: { marginTop: 15, color: 'blue', textAlign: 'center' },
});

export default LoginScreen;
