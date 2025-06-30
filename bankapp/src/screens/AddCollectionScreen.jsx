import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AppBar from '../components/AppBar';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Searchbar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';


const AddCollectionScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);

  const [collectionDate, setCollectionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);


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
    setShowDropdown(true); // Show dropdown on search
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
    const id = await AsyncStorage.getItem('id');
    setLoading(true);

    try {
      await api.post(
        `/collections?user_id=${Number(id)}`,
        {
          user_id: selectedUser.id,
          amount,
          frequency: selectedUser.package_name, // fixed and sent from backend
           collected_at: collectionDate.toISOString(), 
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
      <ScrollView contentContainerStyle={styles.subcontainer} showsVerticalScrollIndicator={false}>
        {users.length === 0 ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Text style={styles.label}>Search User</Text>
            <Searchbar style={styles.search}
              placeholder="Search by name"
              onChangeText={handleSearch}
              value={searchTerm}
            />

            {showDropdown && filteredUsers.length > 0 && (
              <View style={styles.dropdown}>
                {filteredUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => {
                      setSelectedUser(user);
                      setAmount(user.package_amount.toString());
                      setSearchTerm(`${user.first_name} ${user.last_name}`);
                      setShowDropdown(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text>{user.first_name} {user.last_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Collection Date</Text>
           <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
  <Text style={styles.dateButtonText}>📅 {collectionDate.toDateString()}</Text>
</TouchableOpacity>


            {showDatePicker && (
              <DateTimePicker
                value={collectionDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setCollectionDate(selectedDate);
                }}
              />
            )}


            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
            />

            <Text style={styles.label}>Package Name</Text>
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
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    maxHeight: 150,
    marginBottom: 10,
    elevation: 3,
    zIndex: 10,
  },
  dropdownItem: {
    padding: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor:"#ffe"
  },

  dateButton: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 10,
  backgroundColor: '#f0f8ff',
  marginBottom: 10,
},

dateButtonText: {
  color: '#007bff',
  fontWeight: '600',
  fontSize: 16,
},

search: {
  height:40,
  textAlign:'center',justifyContent:'center',
  backgroundColor:'#e7f3fd',
}
});

export default AddCollectionScreen;
