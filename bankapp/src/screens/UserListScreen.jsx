import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AppBar from '../components/AppBar';
import { useNavigation, useRoute } from '@react-navigation/native';

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  const fetchUsers = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');

    try {
      const response = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = await AsyncStorage.getItem('token');

    Alert.alert('Confirm Delete', 'Are you sure you want to delete this user?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await api.delete(`/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Deleted', 'User deleted successfully');
            fetchUsers(); // Refresh list
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to delete user');
          }
        }
      }
    ]);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
      <Text style={styles.details}>📞 {item.phone}</Text>
      {item.email ? <Text style={styles.details}>✉️ {item.email}</Text> : null}
      <Text style={styles.details}>📦 {item.package_name} - ₹{item.package_amount}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UserCollectionHistory', {
  userId: item.id,
  userName: `${item.first_name} ${item.last_name}`
})}>
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditUser', { user: item })}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#ff4d4d' }]} onPress={() => handleDelete(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppBar title="Users" route={route.name} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  details: { fontSize: 14, marginBottom: 3 },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between'
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  }
});

export default UserListScreen;
