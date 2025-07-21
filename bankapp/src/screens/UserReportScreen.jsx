import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import DateButton from '../components/DateButton';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';
import { TextInput, IconButton, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SettingsContext } from '../context/SettingsContext';

const UserReportScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastFilePath, setLastFilePath] = useState(null);
  const { currency, symbol } = useContext(SettingsContext);
  const { theme } = useContext(ThemeContext);
  const selectedTheme = theme === 'dark' ? darkTheme : lightTheme;
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  const formatDate = (date) => date?.toISOString().split('T')[0];

  const downloadUserReport = async () => {
    if (!startDate || !endDate || !selectedUserId) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please select user and date range.',
      });
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const start = formatDate(startDate);
      const end = formatDate(endDate);

      const res = await api.get(`/collections/user/${selectedUserId}/filter?start=${start}&end=${end}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const collections = res.data;

      if (!collections.length) {
        Toast.show({
          type: 'info',
          text1: 'No Data',
          text2: 'No collections found for this user and date range.',
        });
        return;
      }

      const user = users.find(u => u.id === selectedUserId);
      const totalAmount = collections.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const wsData = [
        [`User Name: ${user.first_name} ${user.last_name}`],
        [`Date Range: ${start} to ${end}`],
        [`Total Amount: ${symbol} ${totalAmount}`],
        [],
        ['Amount', 'Package'],
        ...collections.map(c => [c.amount, c.frequency]),
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'User Report');
      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      const filePath = `${RNFS.DownloadDirectoryPath}/user_report_${Date.now()}.xlsx`;
      await RNFS.writeFile(filePath, wbout, 'ascii');
      setLastFilePath(filePath);

      Toast.show({
        type: 'success',
        text1: 'Report Saved',
        text2: 'Excel report for user downloaded successfully!',
      });
    } catch (err) {
      console.error('Error:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to download user report.',
      });
    } finally {
      setLoading(false);
    }
  };

  const shareReport = async () => {
    if (!lastFilePath) {
      Toast.show({
        type: 'error',
        text1: 'No Report',
        text2: 'Please download the report first.',
      });
      return;
    }
    try {
      await Share.open({
        title: 'User Collection Report',
        message: 'Here is the user collection report.',
        url: 'file://' + lastFilePath,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (err) {
      console.error('Share Error:', err);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.container, { backgroundColor: selectedTheme.background }]}>
      <Text style={[styles.title, { color: selectedTheme.text }]}>Individual User Reports</Text>
      <Text style={[styles.label, { color: selectedTheme.text }]}>Search User</Text>
      <View style={styles.searchRow}>
        <TextInput
          mode="outlined"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Type user name..."
          style={[styles.searchInput, { backgroundColor: selectedTheme.card }]}
          outlineColor={selectedTheme.primary}
          activeOutlineColor={selectedTheme.primary}
          textColor={selectedTheme.text}
        />
        {searchQuery.length > 0 && (
          <IconButton icon="close" onPress={() => {
            setSearchQuery('');
            setSelectedUserId('');
          }} />
        )}
      </View>

      {filteredUsers.map((user) => (
        <List.Item
          key={user.id}
          title={`${user.first_name} ${user.last_name}`}
          titleStyle={{ color: selectedTheme.text }}
          onPress={() => {
            setSelectedUserId(user.id);
            setSearchQuery(`${user.first_name} ${user.last_name}`);
            setFilteredUsers([]);
          }}
          style={{ backgroundColor: selectedTheme.card, borderBottomWidth: 1, borderColor: selectedTheme.border }}
        />
      ))}

      <View style={styles.datePickerRow}>
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
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={downloadUserReport} style={[styles.button, styles.downloadButton]}>
          <Icon name="download" size={22} color="#fff" />
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={shareReport} style={[styles.button, styles.shareButton]}>
          <Icon name="share-variant" size={22} color="#fff" />
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} color={selectedTheme.primary} />}
    </ScrollView>
  );
};
export default UserReportScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  userItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 16,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  downloadButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  shareButton: {
    backgroundColor: '#43a047',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
  }, buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});
