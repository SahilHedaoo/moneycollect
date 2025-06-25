import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useIsFocused, useRoute } from '@react-navigation/native';
import AppBar from '../components/AppBar';
import { Pressable, Animated } from 'react-native';



const DashboardScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const isFocused = useIsFocused();
  const route = useRoute();
  
useEffect(() => {
  fetchSummary();
}, []);

const [summary, setSummary] = useState(null);

const fetchSummary = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const res = await api.get('/collections/summary', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSummary(res.data);
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to fetch collection summary");
  }
};

  const fetchUsers = async () => {
    const token = await AsyncStorage.getItem('token');
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

  const confirmDelete = (userId, userName) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${userName}? All their collections will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(userId) },
      ]
    );
  };

  const handleDelete = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await api.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'User deleted');
      fetchUsers();
    } catch (err) {
      console.error('Delete Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  return (
    <View style={styles.container}>
      <AppBar title='Dashboard' route={route.name} />
      <ScrollView contentContainerStyle={styles.subcontainer} showsVerticalScrollIndicator={false}>
        {/* Action Buttons */}
        {summary && (
  <View style={styles.cardContainer}>
    <View style={styles.card}><Text>Today: ₹{summary.today}</Text></View>
    <View style={styles.card}><Text>Yesterday: ₹{summary.yesterday}</Text></View>
    <View style={styles.card}><Text>This Week: ₹{summary.week}</Text></View>
    <View style={styles.card}><Text>This Month: ₹{summary.month}</Text></View>
    <View style={styles.card}><Text>This Year: ₹{summary.year}</Text></View>
  </View>
)}


        {/* User Cards */}
    { /*   {users.map((item) => (
          <View key={item.id} style={styles.userCard}>
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
        ))} */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  subcontainer: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  buttonGroup: {},
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
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
  cardContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  padding: 10,
},
card: {
  backgroundColor: '#f0f0f0',
  borderRadius: 8,
  padding: 15,
  marginBottom: 10,
  width: '48%',
},

});

export default DashboardScreen;
