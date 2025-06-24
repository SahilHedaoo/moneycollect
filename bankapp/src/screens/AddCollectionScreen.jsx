import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import AppBar from '../components/AppBar';
import { useRoute } from '@react-navigation/native';

const AddCollectionScreen = () => {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [loading, setLoading] = useState(false);

  const [bank, setBank] = useState(null);
      const route = useRoute();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const res = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        Alert.alert('Error', 'Failed to load users');
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    if (!userId || !amount || !frequency) {
      Alert.alert('Validation', 'All fields are required');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    setLoading(true);

    try {
      await api.post(
        '/collections',
        { user_id: userId, amount, frequency },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Collection recorded!');
      setUserId('');
      setAmount('');
      setFrequency('daily');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not save collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppBar title='Add Collection' route={route.name} />
      <ScrollView contentContainerStyle={styles.subcontainer} showsVerticalScrollIndicator={false}>

      {users.length === 0 ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={styles.label}>Select User</Text>
          <Picker
            selectedValue={userId}
            onValueChange={(value) => setUserId(value)}
            style={styles.input}
          >
            <Picker.Item label="Select User" value="" />
            {users.map((user) => (
              <Picker.Item
                key={user.id}
                label={`${user.name} (${user.shop_name})`}
                value={user.id}
              />
            ))}
          </Picker>

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount"
          />

          <Text style={styles.label}>Frequency</Text>
          <Picker
            selectedValue={frequency}
            onValueChange={(value) => setFrequency(value)}
            style={styles.input}
          >
            <Picker.Item label="Daily" value="daily" />
            <Picker.Item label="Weekly" value="weekly" />
            <Picker.Item label="Monthly" value="monthly" />
          </Picker>

          <Button title={loading ? 'Saving...' : 'Submit'} onPress={handleSubmit} />
        </>
      )}
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 5, marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  subcontainer:{ flexGrow: 1, padding:20, backgroundColor: '#fff' },
});

export default AddCollectionScreen;
