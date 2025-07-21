import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateButton from '../components/DateButton';
import { useContext } from 'react';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';
import { SettingsContext } from '../context/SettingsContext';

const ReportsScreen = () => {
  const { theme } = useContext(ThemeContext);
  const selectedTheme = theme === 'dark' ? darkTheme : lightTheme;
  const { currency, symbol } = useContext(SettingsContext);
  const navigation = useNavigation();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastFilePath, setLastFilePath] = useState(null);
  const { width } = useWindowDimensions();
  const formatDate = (date) => date?.toISOString().split('T')[0];

  const downloadReport = async () => {
    if (!startDate || !endDate) {
      Toast.show({
        type: 'error',
        text1: 'Missing Dates',
        text2: 'Please select both start and end dates',
      });
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const start = formatDate(startDate);
      const end = formatDate(endDate);
      const response = await api.get(`/collections/by-date?start=${start}&end=${end}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const collections = response.data.data;
      const total = response.data.total;

      if (!collections.length) {
        Toast.show({
          type: 'info',
          text1: 'No Data',
          text2: 'No collections found for selected date range.',
        });
        return;
      }
      // Group by user
      const userMap = {};
      collections.forEach(item => {
        const key = `${item.user_id}`;
        if (!userMap[key]) {
          userMap[key] = {
            first_name: item.first_name,
            last_name: item.last_name,
            total: 0,
          };
        }
        userMap[key].total += parseFloat(item.amount);
      });

      const groupedData = Object.values(userMap);
      // Excel data
      const wsData = [
        [`Selected Date Range: ${start} to ${end}`],
        [`Total Amount Collected: ${symbol}${total}`],
        [],
        ['First Name', 'Last Name', 'Total Amount'],
        ...groupedData.map(user => [
          user.first_name,
          user.last_name,
          user.total,
        ]),
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      const filePath = `${RNFS.DownloadDirectoryPath}/report_${Date.now()}.xlsx`;
      await RNFS.writeFile(filePath, wbout, 'ascii');
      setLastFilePath(filePath);

      Toast.show({
        type: 'success',
        text1: 'Report Saved',
        text2: 'Excel file saved successfully!',
      });
    } catch (err) {
      console.log('Download error:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to generate report.',
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
        title: 'Collection Report',
        message: 'Please find the attached collection report.',
        url: 'file://' + lastFilePath,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (err) {
      console.error('Share error:', err);
      Alert.alert('Error', 'Failed to share report.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.subcontainer, { backgroundColor: selectedTheme.background }]}>
        <View style={styles.filterRow}>
          <DateButton
            date={startDate || new Date()}
            onPress={() => setShowStartPicker(true)}
            color="green"
          />
          <DateButton
            date={endDate || new Date()}
            onPress={() => setShowEndPicker(true)}
            color="red"
          />
          <TouchableOpacity
            style={[styles.button, styles.filterButton]}
            onPress={downloadReport}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: selectedTheme.text }]}>📥 Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.shareButton]}
            onPress={shareReport}
          >
            <Text style={[styles.buttonText, { color: selectedTheme.text }]}>📤 Share Report</Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selected) => {
              setShowStartPicker(false);
              if (selected) setStartDate(selected);
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selected) => {
              setShowEndPicker(false);
              if (selected) setEndDate(selected);
            }}
          />
        )}
        {loading && (
          <ActivityIndicator size="large" color={selectedTheme.primary} style={{ marginTop: 20 }} />
        )}
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: selectedTheme.primary }]}
        icon="plus"
        color={selectedTheme.text}
        onPress={() => navigation.navigate('UserReport')}
      />
    </View>
  );
};
export default ReportsScreen;

const styles = StyleSheet.create({
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
    width: '100%',
  },
  filterButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
  },
  shareButton: {
    backgroundColor: '#43a047',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#1e88e5',
    margin: 16
  },
});
