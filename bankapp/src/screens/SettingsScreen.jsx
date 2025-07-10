import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { CountryPicker } from 'react-native-country-codes-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';
import currencyCodes from 'currency-codes';
import getSymbolFromCurrency from 'currency-symbol-map';
import { SettingsContext } from '../context/SettingsContext';
import { ThemeContext } from '../context/themeContext';
import { showToast } from '../ui/toast';
import api from '../services/api';
import { lightTheme, darkTheme } from '../styles/themes';

const SettingsScreen = () => {
  const { updateSettings, country: contextCountry } = useContext(SettingsContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [country, setCountry] = useState(null);
  const [currency, setCurrency] = useState('');
  const [symbol, setSymbol] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencySearch, setShowCurrencySearch] = useState(false);

  const selectedTheme = theme === 'light' ? lightTheme : darkTheme;

  const currencies = currencyCodes
    .codes()
    .map((code) => {
      try {
        const data = currencyCodes.code(code);
        if (!data || !data.currency) return null;
        return {
          code,
          currency: data.currency,
          symbol: getSymbolFromCurrency(code) || '',
        };
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);

  const [filteredCurrencies, setFilteredCurrencies] = useState(currencies);

  useEffect(() => {
    const loadSettings = async () => {
      const savedCountry = await AsyncStorage.getItem('selectedCountry');
      const savedCurrency = await AsyncStorage.getItem('selectedCurrency');
      const savedSymbol = await AsyncStorage.getItem('selectedSymbol');

      if (savedCountry) setCountry(JSON.parse(savedCountry));
      if (savedCurrency) setCurrency(savedCurrency);
      if (savedSymbol) setSymbol(savedSymbol);
    };
    loadSettings();
  }, []);

  const handleCountrySelect = (item) => {
    setCountry(item);
    const entry = currencies.find((c) => c.code === item.code);
    if (entry) {
      setCurrency(entry.code);
      setSymbol(entry.symbol);
    } else {
      setCurrency('');
      setSymbol('');
    }
    setShowCountryPicker(false);
  };

  const handleSave = async () => {
    if (!country || !currency) {
      showToast('error', 'Please select both country and currency.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await updateSettings(currency, symbol, country);
      await api.put(
        '/users/updateDialCode',
        { dial_code: country.dial_code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('success', `Country: ${country.name.en}\nCurrency: ${currency} ${symbol}`);
    } catch (e) {
      console.log('err', e);
      showToast('error', 'Failed to save settings.');
    }
  };

  const onSearchCurrency = (text) => {
    setCurrencySearch(text);
    const filtered = currencies.filter(
      (item) =>
        item.code.toLowerCase().includes(text.toLowerCase()) ||
        item.currency.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCurrencies(filtered);
  };

  const handleCurrencySelect = (item) => {
    setCurrency(item.code);
    setSymbol(item.symbol);
    setShowCurrencySearch(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: selectedTheme.background }]}>
      <Text style={[styles.title, { color: selectedTheme.text }]}>Settings</Text>

      <TouchableOpacity onPress={() => setShowCountryPicker(true)} style={styles.selectBox}>
        <Text style={styles.selectText}>
          {country?.name?.en ? `Country: ${country.name.en}` : 'Select Country'}
        </Text>
      </TouchableOpacity>

      <CountryPicker
        show={showCountryPicker}
        pickerButtonOnPress={handleCountrySelect}
        onBackdropPress={() => setShowCountryPicker(false)}
        lang="en"
        style={{ modal: { height: '75%' } }}
      />

      {country && (
        <Text style={styles.infoText}>
          Selected: {country.name.en} ({country.dial_code})
        </Text>
      )}

      <TouchableOpacity onPress={() => setShowCurrencySearch(true)} style={styles.selectBox}>
        <Text style={styles.selectText}>
          {currency ? `Currency: ${currency} (${symbol})` : 'Select Currency'}
        </Text>
      </TouchableOpacity>

      <Modal visible={showCurrencySearch} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.currencyModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencySearch(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                placeholder="Search currencies..."
                value={currencySearch}
                onChangeText={onSearchCurrency}
                style={styles.searchInput}
                placeholderTextColor="#999"
              />
            </View>

            <FlatList
              data={filteredCurrencies}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleCurrencySelect(item)}>
                  <Text style={styles.currencySymbol}>{item.symbol}</Text>
                  <View>
                    <Text style={styles.dropdownText}>{item.code}</Text>
                    <Text style={styles.currencyName}>{item.currency}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>

      {symbol !== '' && <Text style={styles.infoText}>Currency Symbol: {symbol}</Text>}

      <View style={styles.themeToggleContainer}>
        <Text style={styles.infoText}>Current Theme: {theme === 'light' ? 'Light' : 'Dark'}</Text>
        <Button
          mode="outlined"
          onPress={toggleTheme}
          style={styles.toggleButton}
          labelStyle={{ fontSize: 15, fontWeight: '600', color: '#2196F3' }}
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </Button>
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.button}
        labelStyle={{ fontSize: 15, fontWeight: '600', color: '#fff' }}
      >
        Save
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  selectText: {
    fontSize: 16,
    color: '#374151',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignSelf: 'stretch',
    height: 48,
    justifyContent: 'center',
  },

  themeToggleContainer: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'flex-start',
  },

  toggleButton: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#FFFFFF',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },

  currencyModal: {
    height: '75%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },

  dropdown: {
    flex: 1,
    paddingBottom: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },

  closeIcon: {
    fontSize: 24,
    color: '#EF4444',
    paddingVertical: 4,
    paddingHorizontal: 8,
    lineHeight: 10,
  },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#6B7280',
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: 44,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },

  currencyName: {
    fontSize: 13,
    color: '#6B7280',
  },

  currencySymbol: {
    fontSize: 22,
    width: 40,
    textAlign: 'center',
    color: '#1E40AF',
  },
});

export default SettingsScreen;
