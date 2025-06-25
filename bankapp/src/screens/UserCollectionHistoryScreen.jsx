import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Button
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppBar from '../components/AppBar';

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
 
      console.log("Collections from API:", res.data);
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

  const handleFilter = () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }
    fetchCollections();
  };

  const renderCollection = (item) => (
    <View key={item.id} style={styles.item}>
      <Text style={styles.amount}>₹{item.amount}</Text>
      <Text style={styles.frequency}>{item.frequency.toUpperCase()}</Text>
      <Text style={styles.date}>{new Date(item.collected_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppBar title="User Collection" route={route.name} />
      <ScrollView contentContainerStyle={styles.subcontainer}>
        <Text style={styles.title}>{userName}'s Collection History</Text>

        <View style={styles.filterRow}>
          <Button title="🗓 Start Date" onPress={() => setShowStart(true)} />
          <Text style={styles.dateLabel}>
            {startDate ? startDate.toDateString() : 'No date selected'}
          </Text>

          <Button title="🗓 End Date" onPress={() => setShowEnd(true)} />
          <Text style={styles.dateLabel}>
            {endDate ? endDate.toDateString() : 'No date selected'}
          </Text>

          <Button title="🔍 Filter" onPress={handleFilter} color="#2196F3" />
        </View>

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
          <ActivityIndicator size="large" color="#2196F3" />
        ) : (
          <>
            {collections.length === 0 ? (
              <Text>No collections found.</Text>
            ) : (
              <>
                <Text style={styles.total}>Total Collected: ₹{totalAmount}</Text>
                {collections.map(renderCollection)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  subcontainer: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  filterRow: { marginBottom: 20, gap: 10 },
  dateLabel: { fontSize: 14, color: '#555', marginBottom: 10 },
  item: {
    backgroundColor: '#f1f1f1',
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#1e88e5' },
  frequency: { fontWeight: '600', color: '#444' },
  date: { color: '#666', marginTop: 4 },
  total: { fontSize: 18, fontWeight: 'bold', color: 'green', marginVertical: 15 },
});

export default UserCollectionHistoryScreen;
