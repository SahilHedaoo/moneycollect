import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppBar from '../components/AppBar';

const UserCollectionHistoryScreen = ({ route }) => {
  const { userId, userName } = route.params;
  const { width } = useWindowDimensions();

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
      <Text style={styles.date}>
        {new Date(item.collected_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppBar title="User Collection" route={route.name} />
      <ScrollView contentContainerStyle={styles.subcontainer}>
        <Text style={styles.title}>{userName}'s Collection History</Text>

        <View style={[styles.filterRow, { flexDirection: width < 400 ? 'column' : 'row' }]}>
          <TouchableOpacity style={styles.button} onPress={() => setShowStart(true)}>
            <Text style={styles.buttonText}>🗓 Start Date</Text>
          </TouchableOpacity>
          <Text style={styles.dateLabel}>
            {startDate ? startDate.toDateString() : 'No date selected'}
          </Text>

          <TouchableOpacity style={styles.button} onPress={() => setShowEnd(true)}>
            <Text style={styles.buttonText}>🗓 End Date</Text>
          </TouchableOpacity>
          <Text style={styles.dateLabel}>
            {endDate ? endDate.toDateString() : 'No date selected'}
          </Text>

          <TouchableOpacity style={[styles.button, styles.filterButton]} onPress={handleFilter}>
            <Text style={styles.buttonText}>🔍 Filter</Text>
          </TouchableOpacity>
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
          <ActivityIndicator size="large" color="#1e88e5" />
        ) : (
          <>
            {collections.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>No collections found.</Text>
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
  subcontainer: { padding: 16, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  filterRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  button: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  filterButton: {
    backgroundColor: '#1e88e5',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: '#f8f8f8',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  frequency: {
    fontWeight: '600',
    color: '#444',
    marginTop: 4,
  },
  date: {
    color: '#666',
    marginTop: 4,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default UserCollectionHistoryScreen;
