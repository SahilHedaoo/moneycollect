import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute } from '@react-navigation/native';
import { SettingsContext } from '../context/SettingsContext';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';
import { showToast } from '../ui/toast';
import DateButton from '../components/DateButton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Button } from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
const UserCollectionHistoryScreen = () => {
  const { currency, symbol } = useContext(SettingsContext);
  const { theme } = useContext(ThemeContext);
  const selectedTheme = theme === 'dark' ? darkTheme : lightTheme;

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
  const [accessToken, setAccessToken] = useState(null);
  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await api.get(`/users/access-token?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccessToken(response.data.access_token);
      } catch (err) {
        console.error(err);
        showToast('error', 'Failed to fetch User Link');
      }
    };
    fetchAccessToken();
  }, [userId]);
  const handleShareLink = () => {
    if (!accessToken) return;

    const publicLink = `http://localhost:5173/collections/${accessToken}`;
    Clipboard.setString(publicLink);
    Toast.show({ type: 'success', text1: 'Link copied to clipboard!' });
  };

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

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await api.delete(`/collections/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('success', 'Collection deleted successfully');
      fetchCollections(); // Refresh list
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to delete collection');
    }
  };
  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(id) },
      ]
    );
  };

  const renderCollection = (item) => (
    <View key={item.id} style={[styles.item, {
      backgroundColor: selectedTheme.card, borderColor: selectedTheme.text + '33',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }]}>
      <View>
        <Text style={[styles.amount, { color: selectedTheme.primary }]}>{symbol}{item.amount}</Text>
        <Text style={[styles.frequency, { color: selectedTheme.text }]}>{item.frequency.toUpperCase()}</Text>
        <Text style={[styles.date, { color: selectedTheme.text + '99' }]}>
          {new Date(item.collected_at).toLocaleString()}
        </Text></View>
      <TouchableOpacity onPress={() => confirmDelete(item.id)}>
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: selectedTheme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.subcontainer, { backgroundColor: selectedTheme.background }]}>
        <Text style={[styles.title, { color: selectedTheme.text }]}>{userName}'s Collection History</Text>

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
          <Button icon="link" mode="outlined" onPress={handleShareLink}>
            Copy User Link
          </Button>
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
          <ActivityIndicator size="large" color={selectedTheme.primary} />
        ) : (
          <>
            {collections.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: selectedTheme.text + 'AA' }}>
                No collections found.
              </Text>
            ) : (
              <>
                <Text style={[styles.total, { color: 'green' }]}>
                  Total Collected: {symbol}{totalAmount}
                </Text>
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
  button: {
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
    fontWeight: 'bold',
    fontSize: 14,
  },
  item: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 1,
    lineHeight: 24,
  },
  frequency: {
    fontWeight: '600',
    marginTop: 4,
  },
  date: {
    marginTop: 4,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 4,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default UserCollectionHistoryScreen;
