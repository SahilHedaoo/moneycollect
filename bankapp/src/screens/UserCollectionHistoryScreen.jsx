import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute } from '@react-navigation/native';
import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { showToast } from '../ui/toast';
import DateButton from '../components/DateButton';


const UserCollectionHistoryScreen = () => {

  const { currency, symbol } = useContext(SettingsContext);

  const route = useRoute();
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
      showToast('error', 'Failed to fetch collection history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [userId]);

  const handleFilter = () => {
    if (!startDate || !endDate) {
     showToast('error', 'Please select both start and end dates');
      return;
    }
    fetchCollections();
  };

  const renderCollection = (item) => (
    <View key={item.id} style={styles.item}>
      <Text style={styles.amount}>{symbol}{item.amount}</Text>
      <Text style={styles.frequency}>{item.frequency.toUpperCase()}</Text>
      <Text style={styles.date}>
        {new Date(item.collected_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.subcontainer}>
        <Text style={styles.title}>{userName}'s Collection History</Text>

          <View style={styles.filterRow}>
          <DateButton
            date={startDate || new Date()}
            onPress={() => setShowStart(true)}
            color="green"
          />


          <DateButton
            date={endDate || new Date()}
            onPress={() => setShowEnd(true)}
            color="red"
          />

          <TouchableOpacity style={[styles.button, styles.filterButton]} onPress={handleFilter}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>🔍 Filter</Text>
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
                <Text style={styles.total}>Total Collected: {symbol}{totalAmount}</Text>
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

  subcontainer: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    maxWidth: '48%',
    gap: 6,
  },

  dateLabel: {
    fontSize: 11,
    color: '#555',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 4,
    paddingHorizontal: 6,
    flex: 1,
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 2,
  },

  filterButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
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
    paddingBottom: 1,
    lineHeight: 24,
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
    marginBottom: 10,
    paddingBottom: 4,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default UserCollectionHistoryScreen;
