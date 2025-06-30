import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator ,TextInput} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AppBar from '../components/AppBar';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Menu, IconButton } from 'react-native-paper';


const UserListScreen = () => {

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);


  const [menuVisible, setMenuVisible] = useState(null);
  const openMenu = (id) => setMenuVisible(id);
  const closeMenu = () => setMenuVisible(null);
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
      setFilteredUsers(response.data);
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

  useEffect(() => {
  if (searchQuery.trim() === '') {
    setFilteredUsers(users);
  } else {
    const filtered = users.filter(user => 
      user.first_name.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }
}, [searchQuery, users]);


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
     {/* <Text style={styles.details}>📞 {item.phone}</Text>
      {item.email ? <Text style={styles.details}>✉️ {item.email}</Text> : null}
      <Text style={styles.details}>📦 {item.package_name} - ₹{item.package_amount}</Text> */}

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('UserCollectionHistory', {
          userId: item.id,
          userName: `${item.first_name} ${item.last_name}`
        })}>
          <Icon name="eye" size={20} color="#007bff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('EditUser', { user: item })}>
          <Icon name="pencil" size={20} color="#007bff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Icon name="trash" size={20} color="#ff4d4d" />
        </TouchableOpacity>
      </View>


    </View>
  );

  return (
    <View style={styles.container}>
     <View style={styles.searchContainer}>
  <Icon name="search" size={18} color="#555" style={{ marginRight: 8 }} />
  <TextInput
    placeholder="Search by name..."
    value={searchQuery}
    onChangeText={setSearchQuery}
    style={styles.searchInput}
    placeholderTextColor="#888"
  />
  {searchQuery.length > 0 && (
    <TouchableOpacity onPress={() => setSearchQuery('')}>
      <Icon name="times-circle" size={20} color="#888" style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  )}
</View>


      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
  actions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 16,
  },


  icon: {
    marginRight: 16,
  }
  ,
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  marginHorizontal: 14,
  marginTop: 9,
  marginBottom: 1,
  paddingHorizontal: 12,
  paddingVertical: 4,
  borderRadius: 8,
  elevation: 2,
},
searchInput: {
  flex: 1,
  fontSize: 16,
  color: '#333',
},


});


export default UserListScreen;
