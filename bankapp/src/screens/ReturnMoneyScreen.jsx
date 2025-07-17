import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { TextInput, Button, Text, Switch } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';

const ReturnMoneyScreen = ({ route }) => {
  const { user } = route.params;
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [rate, setRate] = useState('5');
  const [result, setResult] = useState(null);
  const [isCompound, setIsCompound] = useState(false);
  const [compoundFreq, setCompoundFreq] = useState('daily');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleReturn = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.post(
        `/returns/${user.id}`,
        {
          from_date: fromDate.toISOString().split('T')[0],
          to_date: toDate.toISOString().split('T')[0],
          rate: parseFloat(rate),
          is_compound: isCompound,
          compound_frequency: compoundFreq,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text variant="titleMedium" style={[styles.headerText, { color: currentTheme.text }]}>
        Return to {user.first_name} {user.last_name}
      </Text>

      <TextInput
        label="Interest Rate (%)"
        value={rate}
        onChangeText={setRate}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: currentTheme.primary } }}
      />

      <Button
        mode="outlined"
        onPress={() => setShowFromPicker(true)}
        style={styles.dateButton}
        textColor={currentTheme.primary}
      >
        From Date: {fromDate.toDateString()}
      </Button>
      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) setFromDate(selectedDate);
          }}
        />
      )}

      <Button
        mode="outlined"
        onPress={() => setShowToPicker(true)}
        style={styles.dateButton}
        textColor={currentTheme.primary}
      >
        To Date: {toDate.toDateString()}
      </Button>
      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowToPicker(false);
            if (selectedDate) setToDate(selectedDate);
          }}
        />
      )}

      <View style={styles.switchRow}>
        <Text style={{ color: currentTheme.text }}>Use Compound Interest</Text>
        <Switch value={isCompound} onValueChange={setIsCompound} />
      </View>

      {isCompound && (
        <View style={styles.pickerContainer}>
          <Text style={{ marginBottom: 4, color: currentTheme.text }}>Compounding Frequency</Text>
          <Picker
            selectedValue={compoundFreq}
            onValueChange={(itemValue) => setCompoundFreq(itemValue)}
            mode="dropdown"
            style={{ backgroundColor: currentTheme.card, color: currentTheme.text }}
            dropdownIconColor={currentTheme.text}
          >
            <Picker.Item label="Daily" value="daily" />
            <Picker.Item label="Monthly" value="monthly" />
            <Picker.Item label="Quarterly" value="quarterly" />
            <Picker.Item label="Yearly" value="yearly" />
          </Picker>
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleReturn}
        style={{ marginTop: 20, backgroundColor: currentTheme.primary }}
      >
        Process Return
      </Button>

      {result && (
        <View style={[styles.resultBox, { backgroundColor: currentTheme.card }]}>
          <Text style={{ color: currentTheme.text }}>Principal: ₹{result.principal}</Text>
          <Text style={{ color: currentTheme.text }}>Interest: ₹{result.interest}</Text>
          <Text style={{ color: currentTheme.text }}>Total Returned: ₹{result.amount_returned}</Text>
          <Text style={{ color: currentTheme.text }}>Method: {result.compounding}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  headerText: { marginBottom: 16, fontWeight: 'bold' },
  input: { marginBottom: 10 },
  dateButton: { marginTop: 10 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  pickerContainer: {
    marginTop: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  resultBox: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
  },
});

export default ReturnMoneyScreen;
