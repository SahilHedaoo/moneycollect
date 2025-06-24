// screens/UserListScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Button, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import AppBar from '../components/AppBar';
import api from '../services/api';

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not load users');
    }
  };

  const confirmDelete = (userId, userName) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => handleDelete(userId) }
      ]
    );
  };

  const handleDelete = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await api.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Deleted', 'User deleted');
      fetchUsers();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  useEffect(() => {
    if (isFocused) fetchUsers();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <AppBar title="Users" route={route.name} />
      <ScrollView contentContainerStyle={styles.subcontainer}>
        {users.map((user) => (
          <View key={user.id} style={styles.card}>
            <Text style={styles.name}>{user.name}</Text>
            <Text>{user.shop_name}</Text>
            <Text>{user.frequency}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() =>
                  navigation.navigate('UserCollectionHistory', {
                    userId: user.id,
                    userName: user.name,
                  })
                }
              >
                <Text style={styles.viewText}>View</Text>
              </TouchableOpacity>

              <Button
                title="✏️ Edit"
                onPress={() => navigation.navigate('EditUser', { user })}
              />
              <TouchableOpacity onPress={() => confirmDelete(user.id, user.name)}>
                <Text style={styles.deleteText}>🗑 Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  subcontainer: { flexGrow: 1, padding: 20 },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  viewText: { color: '#fff', fontWeight: 'bold' },
  deleteText: { color: 'red', fontWeight: 'bold' },
});

export default UserListScreen;
