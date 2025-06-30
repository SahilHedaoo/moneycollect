import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AppBar from '../components/AppBar';
import useFetch from '../hooks/useFetch';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';



const FilteredCollectionsScreen = () => {
  const { data: usersData, loading: usersLoading } = useFetch('/users');
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const route = useRoute();
  const { filterType } = route.params || {}; // Get filterType from route params
  const navigation = useNavigation();

  useEffect(() => {
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

    const fetchCollections = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const res = await api.get('/collections/get', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCollections(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not load collections');
      }
    };

    fetchUsers();
    fetchCollections();
  }, []);

  useEffect(() => {
    if (collections.length > 0 && filterType) {
      const filterCollections = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const startOfWeek = new Date(today);
        // Set to Monday of the current week (MySQL YEARWEEK mode 1 starts on Monday)
        startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const filtered = collections.filter((item) => {
          const collectedAt = new Date(item.collected_at); // Parse collected_at
          if (!collectedAt || isNaN(collectedAt)) return false; // Skip invalid dates

          switch (filterType) {
            case 'today':
              return (
                collectedAt.getFullYear() === today.getFullYear() &&
                collectedAt.getMonth() === today.getMonth() &&
                collectedAt.getDate() === today.getDate()
              );
            case 'yesterday':
              return (
                collectedAt.getFullYear() === yesterday.getFullYear() &&
                collectedAt.getMonth() === yesterday.getMonth() &&
                collectedAt.getDate() === yesterday.getDate()
              );
            case 'week':
              // Check if collected_at is in the same week (Monday to Sunday)
              const weekStart = new Date(startOfWeek);
              const weekEnd = new Date(startOfWeek);
              weekEnd.setDate(startOfWeek.getDate() + 6); // End of week (Sunday)
              return collectedAt >= weekStart && collectedAt <= new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate(), 23, 59, 59, 999);
            case 'month':
              return (
                collectedAt.getMonth() === now.getMonth() &&
                collectedAt.getFullYear() === now.getFullYear()
              );
            case 'year':
              return collectedAt.getFullYear() === now.getFullYear();
            default:
              return true; // No filter applied
          }
        });

        // Enrich collections with user data
        const enrichedCollections = filtered.map((item) => {
          const userData = users.find((user) => user.id === item.user_id && user.bank_id === item.bank_id);
          return {
            ...item,
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
          };
        });

        setFilteredCollections(enrichedCollections);
      };

      filterCollections();
    }
  }, [collections, filterType, users]);

  return (
    <View style={styles.container}>
      <View style={styles.subcontainer}>
        <Text style={styles.heading}>
          {filterType
            ? `Collections for ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`
            : 'Collections'}
        </Text>
        <FlatList
          data={filteredCollections}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('Receipt', { item })}>
              <View style={styles.card}>
                <Text style={styles.name}>
                  {item.first_name} {item.last_name}
                </Text>
                <Text style={styles.amount}>Amount: ₹{item.amount}</Text>
                <Text>Date: {new Date(item.collected_at).toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          )}

          ListEmptyComponent={<Text>No collections found for this period.</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  subcontainer: { padding: 16, backgroundColor: '#fff', flex: 1 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#000' },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e88e5',
    marginTop: 4,
    lineHeight: 22,
  },

  name: { fontWeight: 'bold', fontSize: 16 },
});

export default FilteredCollectionsScreen;