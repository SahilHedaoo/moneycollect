import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateButton from '../components/DateButton';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';


const CollectionReportScreen = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [collections, setCollections] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();


  const fetchCollectionData = async () => {
    try {
      setLoading(true);

      const from = moment(startDate).format('YYYY-MM-DD');
      const to = moment(endDate).format('YYYY-MM-DD');

      const token = await AsyncStorage.getItem('token'); // assuming token is stored in AsyncStorage

      const res = await api.get(`/collections/by-date?start=${from}&end=${to}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data, total } = res.data;
      setCollections(data || []);
      setTotal(total || 0);
    } catch (error) {
      console.error('Fetch error:', error.response?.data || error.message);
      console.log("err", error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Text style={styles.value}>{moment(item.collected_at).format('MMM D, YYYY')}</Text>
      <Text style={styles.value}>{item.first_name} {item.last_name}</Text>
      <Text style={styles.value}>{item.amount.toFixed(2)}</Text>
      <Icon name="eye" size={20} color="#ccc" />
    </View>
  );


  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.datePickers}>
        <DateButton
          date={startDate}
          onPress={() => setShowStartPicker(true)}
          color="green"
        />

        <DateButton
          date={endDate}
          onPress={() => setShowEndPicker(true)}
          color="red"
        />
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      <TouchableOpacity style={styles.fetchButton} onPress={fetchCollectionData}>
        <Text style={styles.fetchText}>Get Report</Text>
      </TouchableOpacity>

      <View style={styles.totalCard}>
        <Text style={styles.totalText}>Total Collection:</Text>
        <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={collections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={() => (
          <>
            <Header />
            <View style={styles.headerRow}>
              <Text style={styles.headerCell}>Date</Text>
              <Text style={styles.headerCell}>User</Text>
              <Text style={styles.headerCell}>Amount</Text>
              <Text style={styles.headerCell}>View</Text>
            </View>
          </>
        )}
        contentContainerStyle={styles.contentContainer}
      />

    </View>
  );
};

export default CollectionReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  headerContainer: {
    marginBottom: 10,
  },
  datePickers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fetchButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  fetchText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  totalCard: {
    backgroundColor: '#90CAF9',
    padding: 16,
    borderRadius: 15,
    marginVertical: 10,
  },
  totalText: {
    fontSize: 16,
    color: '#1A237E',
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 22,
    color: '#1A237E',
    fontWeight: 'bold',
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderColor: '#2e2e3e',
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  value: {
    color: '#',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },


});
