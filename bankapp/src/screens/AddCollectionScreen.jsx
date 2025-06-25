import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AppBar from '../components/AppBar';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const AddCollectionScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const route = useRoute();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const res = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (err) {
        Alert.alert('Error', 'Failed to load users');
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (text) => {
    setSearchTerm(text);
    const filtered = users.filter((user) =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleUserSelect = (userId) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
    setAmount(user?.package_amount?.toString() || '');
  };

  const handleSubmit = async () => {
    if (!selectedUser || !amount) {
      Alert.alert('Validation', 'Please fill in all required fields');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    setLoading(true);

    try {
      await api.post(
        '/collections',
        {
          user_id: selectedUser.id,
          amount,
          frequency: selectedUser.package_name, // fixed and sent from backend
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Collection recorded!');
      setSelectedUser(null);
      setAmount('');
      setSearchTerm('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not save collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppBar title="Add Collection" route={route.name} />
      <ScrollView contentContainerStyle={styles.subcontainer} showsVerticalScrollIndicator={false}>
        {users.length === 0 ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Text style={styles.label}>Search User</Text>
            <TextInput
              style={styles.input}
              placeholder="Search by name"
              value={searchTerm}
              onChangeText={handleSearch}
            />

            <Text style={styles.label}>Select User</Text>
            <Picker
              selectedValue={selectedUser?.id || ''}
              onValueChange={(value) => handleUserSelect(value)}
              style={styles.input}
            >
              <Picker.Item label="Select User" value="" />
              {filteredUsers.map((user) => (
                <Picker.Item
                  key={user.id}
                  label={`${user.first_name} ${user.last_name}`}
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
            <TextInput
              style={[styles.input, { backgroundColor: '#eee' }]}
              value={selectedUser?.package_name || ''}
              editable={false}
            />

            <Button title={loading ? 'Saving...' : 'Submit'} onPress={handleSubmit} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: { fontWeight: '600', marginBottom: 5, marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  subcontainer: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
});

export default AddCollectionScreen;
