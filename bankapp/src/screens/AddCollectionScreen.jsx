import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useRoute } from '@react-navigation/native';
import { Searchbar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { showToast } from '../ui/toast';

import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';

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

  const { theme } = useContext(ThemeContext);
  const selectedTheme = theme === 'light' ? lightTheme : darkTheme;

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
        showToast('error', 'Failed to load users');
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
    setShowDropdown(true);
  };

  const handleSubmit = async () => {
    if (!selectedUser || !amount) {
      showToast('error', 'Please fill in all required fields');
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
          frequency: selectedUser.package_name,
          collected_at: collectionDate.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('success', 'Collection recorded!');
      setSelectedUser(null);
      setAmount('');
      setSearchTerm('');
    } catch (err) {
      console.error(err);
      showToast('error', 'Could not save collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: selectedTheme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.subcontainer,
          { backgroundColor: selectedTheme.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {users.length === 0 ? (
          <ActivityIndicator size="large" color={selectedTheme.primary} />
        ) : (
          <>
            <Text style={[styles.label, { color: selectedTheme.text }]}>Search User</Text>
        <Searchbar
  style={[
    styles.search,
    { backgroundColor: selectedTheme.card, borderColor: selectedTheme.text },
  ]}
  placeholder="Search by name"
  onChangeText={handleSearch}
  value={searchTerm}
  inputStyle={{ color: selectedTheme.text }}
  placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
  iconColor={selectedTheme.text}
/>

            {showDropdown && filteredUsers.length > 0 && (
              <View style={[styles.dropdown, { backgroundColor: selectedTheme.card }]}>
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
                    <Text style={{ color: selectedTheme.text }}>
                      {user.first_name} {user.last_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.label, { color: selectedTheme.text }]}>Collection Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
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

            <Text style={[styles.label, { color: selectedTheme.text }]}>Amount</Text>
           <TextInput
  style={[
    styles.input,
    {
      backgroundColor: selectedTheme.card,
      color: selectedTheme.text,
      borderColor: selectedTheme.text,
    },
  ]}
  value={amount}
  onChangeText={setAmount}
  keyboardType="numeric"
  placeholder="Enter amount"
  placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
/>


            <Text style={[styles.label, { color: selectedTheme.text }]}>Package Name</Text>
           <TextInput
  style={[
    styles.input,
    {
      backgroundColor: selectedTheme.card,
      color: selectedTheme.text,
      borderColor: selectedTheme.text,
    },
  ]}
  value={selectedUser?.package_name || ''}
  editable={false}
  placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
/>

            <Button
              title={loading ? 'Saving...' : 'Submit'}
              onPress={handleSubmit}
              color={selectedTheme.primary}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  subcontainer: {
    flexGrow: 1,
    padding: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 15,
    fontSize: 15,
  },
 input: {
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 8,
  marginBottom: 10,
},

  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    maxHeight: '100%',
    marginBottom: 10,
    elevation: 3,
    zIndex: 10,
  },
  dropdownItem: {
    padding: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  
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
    height: 40,
    justifyContent: 'center',
    marginBottom: 10,
  },
});

export default AddCollectionScreen;
