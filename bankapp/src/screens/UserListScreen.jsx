import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { showToast } from '../ui/toast';
import ConfirmModal from '../components/ConfirmModal';
import { SettingsContext } from '../context/SettingsContext';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';
import { extractPhoneWithoutDialCode } from '../utils/phoneUtils';

const UserListScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { dialCode: newDialCode } = useContext(SettingsContext);
  const { theme } = useContext(ThemeContext);
  const selectedTheme = theme === 'dark' ? darkTheme : lightTheme;

  const fetchUsers = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      showToast('error', 'Token not found');
      return;
    }

    try {
      for (const user of users) {
        const oldDial = user.dial_code || '+91';
        const rawPhone = extractPhoneWithoutDialCode(oldDial, user.phone);

        const payload = {
          first_name: user.first_name,
          last_name: user.last_name,
          phone: rawPhone,
          dial_code: newDialCode,
          email: user.email || '',
          package_name: user.package_name,
          package_amount: user.package_amount,
        };

        await api.put(`/users/${user.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      showToast('success', 'All users updated with new dial code!');
      fetchUsers();
    } catch (error) {
      console.error('Bulk update failed:', error);
      showToast('error', 'Failed to update users');
    }
  };

  const handleDelete = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      await api.delete(`/users/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('success', 'User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to delete user');
    } finally {
      setConfirmVisible(false);
      setSelectedUserId(null);
    }
  };

  const askDelete = (id) => {
    setSelectedUserId(id);
    setConfirmVisible(true);
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
    <View style={[styles.card, { backgroundColor: selectedTheme.card }]}>
      <Text style={[styles.name, { color: selectedTheme.text }]}>
        {item.custom_user_id} {item.first_name} {item.last_name}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => navigation.navigate('UserCollectionHistory', {
            userId: item.id,
            userName: `${item.custom_user_id} ${item.first_name} ${item.last_name}`
          })}
        >
          <Icon name="eye" size={20} color={selectedTheme.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('EditUser', { user: item })}>
          <Icon name="pencil" size={20} color={selectedTheme.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => askDelete(item.id)}>
          <Icon name="trash" size={20} color="#ff4d4d" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ReturnMoney', { user: item })}>
          <Icon name="undo" size={20} color={selectedTheme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: selectedTheme.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: selectedTheme.card }]}>
        <Icon name="search" size={18} color={selectedTheme.text} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: selectedTheme.text }]}
          placeholderTextColor={selectedTheme.text + '99'}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="times-circle" size={20} color={selectedTheme.text} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={selectedTheme.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <TouchableOpacity style={styles.updateAllButton} onPress={handleBulkUpdate}>
                <Text style={styles.updateAllButtonText}>Apply Dial Code to All Users</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.updateAllButton, { backgroundColor: '#dc3545' }]}
                onPress={() => navigation.navigate('TrashUser')}
              >
                <Text style={styles.updateAllButtonText}>View Deleted Users</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <ConfirmModal
        visible={confirmVisible}
        message="Are you sure you want to delete this user?"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmVisible(false);
          setSelectedUserId(null);
        }}
      />
    </View>
  );
};

export default UserListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  actions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  updateAllButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
