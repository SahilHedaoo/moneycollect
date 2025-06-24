import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useIsFocused } from '@react-navigation/native';



const DashboardScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const isFocused = useIsFocused(); // refetch users on screen focus

  const fetchUsers = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('Token:', token);

    try {
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not load users');
    }
  };

  useEffect(() => {
    if (isFocused) fetchUsers();
  }, [isFocused]);

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() =>
        navigation.navigate('UserCollectionHistory', {
          userId: item.id,
          userName: item.name,
        })
      }
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text>{item.phone} • {item.location}</Text>
      <Text>Shop: {item.shop_name}</Text>
      <Text>Collection: {item.frequency.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  const confirmDelete = (userId, userName) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${userName}? All their collections will be deleted.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(userId), // 🔁 Call real delete
        },
      ]
    );
  };


  const handleDelete = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Deleting user with token:', token); // 🪵 Log token

      const res = await api.delete(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Success', 'User deleted');
      fetchUsers();
    } catch (err) {
      console.error('Delete Error:', err.response?.data || err.message); // 🔍 Log reason
      Alert.alert('Error', 'Failed to delete user');
    }
  };



  return (

    <View style={styles.container}>
  <Text style={styles.heading}>Bank Dashboard</Text>

  {/* Custom Styled Buttons */}
  <View style={styles.buttonGroup}>
    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BankProfile')}>
      <Text style={styles.buttonText}>👤 PROFILE</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddUser')}>
      <Text style={styles.buttonText}>➕ ADD USER</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddCollection')}>
      <Text style={styles.buttonText}>💰 ADD COLLECTION</Text>
    </TouchableOpacity>
  </View>

  {/* User List */}
  <FlatList
    data={users}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <View style={styles.userCard}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userDetail}>{item.shop_name}</Text>
        <Text style={styles.userDetail}>{item.frequency}</Text>

        <View style={styles.cardButtons}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() =>
              navigation.navigate('UserCollectionHistory', {
                userId: item.id,
                userName: item.name,
              })
            }
          >
            <Text style={styles.viewButtonText}>VIEW</Text>
          </TouchableOpacity>
          <Button
  title="✏️ Edit"
  onPress={() => navigation.navigate('EditUser', { user: item })}
/>


          <TouchableOpacity onPress={() => confirmDelete(item.id, item.name)}>
            <Text style={styles.deleteText}>🗑 Delete</Text>
          </TouchableOpacity>

          
        </View>
      </View>
    )}
  />
</View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2, // shadow for Android
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  cardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default DashboardScreen;
