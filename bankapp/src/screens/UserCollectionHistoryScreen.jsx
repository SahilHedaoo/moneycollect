import React, { useEffect, useState } from 'react';
import {
  Button, View, Text, StyleSheet, FlatList, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const UserCollectionHistoryScreen = ({ route }) => {
  const { userId, userName } = route.params;

  const [collections, setCollections] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const calculateTotal = (data) => {
    const total = data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    setTotalAmount(total);
  };

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      let url = `/collections/user/${userId}`;
      if (startDate && endDate) {
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        url += `?start=${start}&end=${end}`;
      }

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCollections(res.data);
      calculateTotal(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch collection history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [userId]);

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }

    await fetchCollections();
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.amount}>₹{item.amount}</Text>
      <Text>{item.frequency.toUpperCase()}</Text>
      <Text>{new Date(item.collected_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{userName}'s Collection History</Text>

      {/* Date Filter Section */}
      <View style={styles.filterRow}>
        <Button title="📅 Select Start Date" onPress={() => setShowStart(true)} />
        <Text style={styles.dateLabel}>
          {startDate ? startDate.toDateString() : 'No date selected'}
        </Text>

        <Button title="📅 Select End Date" onPress={() => setShowEnd(true)} />
        <Text style={styles.dateLabel}>
          {endDate ? endDate.toDateString() : 'No date selected'}
        </Text>

        <Button title="🔍 Filter" onPress={handleFilter} color="#2196F3" />
      </View>

      {/* Show Date Pickers */}
      {showStart && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, selected) => {
            setShowStart(false);
            if (selected) setStartDate(selected);
          }}
        />
      )}

      {showEnd && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, selected) => {
            setShowEnd(false);
            if (selected) setEndDate(selected);
          }}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" />
      ) : collections.length === 0 ? (
        <Text>No collections found.</Text>
      ) : (
        <>
          <Text style={styles.total}>Total Collected: ₹{totalAmount}</Text>

          <FlatList
            data={collections}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  filterRow: {
    marginBottom: 16,
    gap: 10,
  },
  dateLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  amount: { fontSize: 18, fontWeight: 'bold' },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'green',
  },
});

export default UserCollectionHistoryScreen;
