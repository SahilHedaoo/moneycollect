import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  SectionList,
  Animated,
} from 'react-native';
import { Checkbox, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';

const BulkCollectionScreen = () => {
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const animation = new Animated.Value(0);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      const initial = {};
      data.forEach(user => {
        initial[user.id.toString()] = {
          selected: false,
          amount: user.package_amount,
          package: user.package_name,
        };
      });

      setUsers(data);
      setSelectedUsers(initial);
    } catch (err) {
      console.error('🔥 Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUser = (id) => {
    setSelectedUsers(prev => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id].selected }
    }));

    Animated.sequence([
      Animated.timing(animation, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(animation, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const updateAmount = (id, amount) => {
    setSelectedUsers(prev => ({
      ...prev,
      [id]: { ...prev[id], amount }
    }));
  };

  const selectedCollections = Object.entries(selectedUsers).filter(([_, val]) => val.selected);
  const totalAmount = selectedCollections.reduce((sum, [id, val]) => sum + parseFloat(val.amount || 0), 0);

  const handleSelectAll = () => {
    const updated = {};
    Object.entries(selectedUsers).forEach(([id, val]) => {
      updated[id] = { ...val, selected: !selectAll };
    });
    setSelectedUsers(updated);
    setSelectAll(!selectAll);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const collections = selectedCollections.map(([user_id, val]) => ({
        user_id,
        amount: parseFloat(val.amount),
        frequency: val.package || 'Daily',
      }));

      if (collections.length === 0) {
        Toast.show({ type: 'error', text1: 'No users selected!' });
        return;
      }

      await api.post('/collections/bulk', { collections }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Toast.show({ type: 'success', text1: 'Collections added!' });

      const reset = {};
      users.forEach(user => {
        reset[user.id.toString()] = {
          selected: false,
          amount: user.package_amount,
          package: user.package_name
        };
      });
      setSelectedUsers(reset);
      setSelectAll(false);

    } catch (error) {
      console.error("Error submitting collections:", error);
      Toast.show({ type: 'error', text1: 'Failed to submit collections.' });
    } finally {
      setLoading(false);
    }
  };

  const groupedData = users.reduce((acc, user) => {
    const pkg = user.package_name || 'Other';
    if (!acc[pkg]) acc[pkg] = [];
    acc[pkg].push(user);
    return acc;
  }, {});

  const sections = Object.entries(groupedData).map(([title, data]) => ({ title, data }));

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {loading && (
        <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginVertical: 10 }} />
      )}

      <View style={styles.selectAllRow}>
        <Checkbox
          status={selectAll ? 'checked' : 'unchecked'}
          onPress={handleSelectAll}
          color={currentTheme.primary}
        />
        <Text style={{ color: currentTheme.text }}>Select All</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, { color: currentTheme.primary }]}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <Animated.View style={[styles.item, {
            transform: [{
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05]
              })
            }]
          }]}>
            {selectedUsers[item.id] && (
              <Checkbox
                status={selectedUsers[item.id].selected ? 'checked' : 'unchecked'}
                onPress={() => toggleUser(item.id)}
                color={currentTheme.primary}
              />
            )}
            <Text style={[styles.nameText, { color: currentTheme.text }]}>
              {item.first_name} {item.last_name}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: currentTheme.text,
                  borderBottomColor: currentTheme.primary
                }
              ]}
              keyboardType='numeric'
              value={selectedUsers[item.id]?.amount?.toString() || ''}
              onChangeText={(text) => updateAmount(item.id, text)}
              placeholder="Amount"
              placeholderTextColor={currentTheme.text + '80'}
            />
          </Animated.View>
        )}
      />

      <View style={styles.summary}>
        <Text style={{ color: currentTheme.text }}>Total Users Selected: {selectedCollections.length}</Text>
        <Text style={{ color: currentTheme.text }}>Total Amount: ₹{totalAmount.toFixed(2)}</Text>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={selectedCollections.length === 0 || loading}
        style={[
          styles.submitButton,
          {
            backgroundColor:
              selectedCollections.length > 0 ? currentTheme.primary : '#e0e0e0',
          },
        ]}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{
          color: selectedCollections.length > 0 ? '#fff' : '#333',
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        Submit All
      </Button>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  input: {
    borderBottomWidth: 1,
    marginLeft: 10,
    width: 80,
    fontSize: 14,
  },
  nameText: {
    flex: 1,
    fontSize: 16,
  },
  summary: {
    paddingVertical: 10,
    borderTopWidth: 1,
    marginTop: 10,
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  }
});

export default BulkCollectionScreen;
