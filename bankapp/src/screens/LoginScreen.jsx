import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from '../components/InputField';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';
import LoaderKit from 'react-native-loader-kit';
import { showToast } from '../ui/toast';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await api.post('/banks/login', { email, password });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('id', res.data.id.toString());
      showToast("success", "Logged in");
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (err) {
      showToast("error", "Login Failed", err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <View style={styles.loadingContainer}>
      <LoaderKit style={styles.loader} name='BallSpinFadeLoader' color="#2196F3" />
    </View>
  ) : (
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
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  loader: { width: 80, height: 80 },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  link: { marginTop: 15, color: 'blue', textAlign: 'center' },
});

export default LoginScreen;
