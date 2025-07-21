import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Checkbox, Button, FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';
import { SettingsContext } from '../context/SettingsContext';

const FilteredUsersScreen = ({ route, navigation }) => {
  const { amount, package: packageType, matchMode } = route.params;
  const { currency, symbol } = useContext(SettingsContext);
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allUsers = response.data;
      let filtered = [];

      if (matchMode === 'and' && amount && packageType) {
        filtered = allUsers.filter(
          (u) =>
            parseFloat(u.package_amount) === parseFloat(amount) &&
            u.package_name === packageType
        );
      } else {
        filtered = allUsers.filter((u) => {
          const matchesAmount = amount
            ? parseFloat(u.package_amount) === parseFloat(amount)
            : false;
          const matchesType = packageType ? u.package_name === packageType : false;
          return matchesAmount || matchesType;
        });
      }
      setUsers(filtered);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]); // Deselect all
    } else {
      setSelectedUserIds(users.map((u) => u.id)); // Select all
    }
  };

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      Toast.show({ type: 'error', text1: 'Select at least one user' });
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const collections = selectedUserIds.map((user_id) => {
        const user = users.find((u) => u.id === user_id);
        return {
          user_id,
          amount: parseFloat(user.package_amount),
          frequency: user.package_name,
        };
      });
      await api.post('/collections/bulk', { collections }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Toast.show({ type: 'success', text1: 'Collection submitted' });
      navigation.goBack();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Submission failed' });
    }
  };

  const totalAmount = selectedUserIds.reduce((sum, uid) => {
    const user = users.find((u) => u.id === uid);
    return sum + (user ? parseFloat(user.package_amount) : 0);
  }, 0);

  const filterTag = () => {
    if (matchMode === 'and') {
      return `Matching:   ${symbol} ${amount}  AND   ${packageType}`;
    } else if (amount && packageType) {
      return `Matching: ${symbol}${amount} OR ${packageType}`;
    } else if (amount) {
      return `Matching: ${symbol}${amount}`;
    } else if (packageType) {
      return `Matching: ${packageType}`;
    } else {
      return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={currentTheme.primary} />
      ) : (
        <>
          <Text style={[styles.header, { color: currentTheme.primary }]}>
            Filtered Users ({users.length})
          </Text>
          {filterTag() ? (
            <Text style={[styles.tag, { color: currentTheme.text }]}>{filterTag()}</Text>
          ) : null}

          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Checkbox
                  status={selectedUserIds.includes(item.id) ? 'checked' : 'unchecked'}
                  onPress={() => toggleUser(item.id)}
                  color={currentTheme.primary}
                />
                <Text style={{ color: currentTheme.text }}>
                  {item.first_name} {item.last_name} – {symbol}{item.package_amount} ({item.package_name})
                </Text>
              </View>
            )}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}

            ListFooterComponent={
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: currentTheme.text, fontWeight: 'bold' }}>
                  Selected Users: {selectedUserIds.length}
                </Text>
                <Text style={{ color: currentTheme.text, fontWeight: 'bold' }}>
                  Total Amount: {symbol}{totalAmount.toFixed(2)}
                </Text>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  labelStyle={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}
                >
                  Submit {symbol}{totalAmount.toFixed(2)}
                </Button>
              </View>}
          />
        </>
      )}

      {/* FAB for Select All / Deselect All */}
      {!loading && users.length > 0 && (
        <FAB
          icon={selectedUserIds.length === users.length ? 'close' : 'check'}
          onPress={toggleSelectAll}
          style={[styles.fab, { backgroundColor: currentTheme.primary }]}
          color="#fff"
        />
      )}
    </View>
  );

};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: '#2196F3',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tag: {
    fontStyle: 'italic',
    fontSize: 14,
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    right: 5,
    top: 5,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default FilteredUsersScreen;
