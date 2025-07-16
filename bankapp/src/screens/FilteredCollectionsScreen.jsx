import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';
import { SettingsContext } from '../context/SettingsContext';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';
import { showToast } from '../ui/toast';
import { ActivityIndicator } from 'react-native-paper'; 

const FilteredCollectionsScreen = () => {
  const { currency, symbol } = useContext(SettingsContext);
  const { theme } = useContext(ThemeContext);
  const selectedTheme = theme === 'dark' ? darkTheme : lightTheme;

  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loading, setLoading] = useState(true); 

  const route = useRoute();
  const { filterType } = route.params || {};
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      try {
        const [userRes, collectionRes] = await Promise.all([
          api.get('/users', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/collections/get', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUsers(userRes.data);
        setCollections(collectionRes.data);
      } catch (err) {
        console.error(err);
        showToast('error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (collections.length > 0 && filterType) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const filtered = collections.filter((item) => {
        const collectedAt = new Date(item.collected_at);
        if (!collectedAt || isNaN(collectedAt)) return false;

        switch (filterType) {
          case 'today':
            return collectedAt.toDateString() === today.toDateString();
          case 'yesterday':
            return collectedAt.toDateString() === yesterday.toDateString();
          case 'week':
            const weekEnd = new Date(startOfWeek);
            weekEnd.setDate(startOfWeek.getDate() + 6);
            return collectedAt >= startOfWeek && collectedAt <= new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate(), 23, 59, 59, 999);
          case 'month':
            return collectedAt.getMonth() === now.getMonth() && collectedAt.getFullYear() === now.getFullYear();
          case 'year':
            return collectedAt.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });

      const enrichedCollections = filtered.map((item) => {
        const userData = users.find((u) => u.id === item.user_id && u.bank_id === item.bank_id);
        return {
          ...item,
          first_name: userData?.first_name || '',
          last_name: userData?.last_name || '',
          phone: userData?.phone || '',
        };
      });
      setFilteredCollections(enrichedCollections);
    }
  }, [collections, filterType, users]);

  const styles = StyleSheet.create({
    container: { backgroundColor: selectedTheme.background, flex: 1 },
    subcontainer: { padding: 16, backgroundColor: selectedTheme.background, flex: 1 },
    heading: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      color: selectedTheme.text,
    },
    card: {
      padding: 12,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      marginBottom: 10,
      backgroundColor: selectedTheme.card,
    },
    amount: {
      fontSize: 16,
      fontWeight: '600',
      color: selectedTheme.primary,
      marginTop: 4,
      lineHeight: 22,
    },
    name: {
      fontWeight: 'bold',
      fontSize: 16,
      color: selectedTheme.text,
    },
    date: {
      color: selectedTheme.text,
      marginTop: 4,
    },
    emptyText: {
      color: selectedTheme.text,
      textAlign: 'center',
      marginTop: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.subcontainer}>
        <Text style={styles.heading}>
          {filterType
            ? `Collections for ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`
            : 'Collections'}
        </Text>

        {/* 👇 Loading Indicator */}
        {loading ? (
          <ActivityIndicator
            animating={true}
            size="large"
            color={selectedTheme.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={filteredCollections}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => navigation.navigate('Receipt', { item })}>
                <View style={styles.card}>
                  <Text style={styles.name}>
                    {item.first_name} {item.last_name}
                  </Text>
                  <Text style={styles.amount}>
                    Amount: {symbol}
                    {item.amount}
                  </Text>
                  <Text style={styles.date}>
                    Date: {new Date(item.collected_at).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No collections found for this period.
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
};

export default FilteredCollectionsScreen;
