
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
import { showToast } from '../ui/toast';

const SettingsScreen = () => {
  const [country, setCountry] = useState(null);
  const [currency, setCurrency] = useState('');
  const [symbol, setSymbol] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencySearch, setShowCurrencySearch] = useState(false);

  const { updateSettings } = useContext(SettingsContext);

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
      await updateSettings(currency, symbol, country);
      showToast('success', `Country: ${country.name.en}\nCurrency: ${currency} ${symbol}`);
    } catch (e) {
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
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

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

      <Modal visible={showCurrencySearch} animationType="slide">
        <View style={styles.dropdown}>
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
      </Modal>

      {symbol !== '' && <Text style={styles.infoText}>Currency Symbol: {symbol}</Text>}

      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Save Settings
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  infoText: {
    marginBottom: 15,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#1E88E5',
    borderRadius: 6,
    paddingVertical: 10,
  },
  dropdown: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5E2CA5',
    lineHeight: 24,
  },
  closeIcon: {
    fontSize: 24,
    color: '#5E2CA5',
    padding: 4,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F4',
    margin: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#777',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#000',
    height: 44,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    lineHeight: 22,
  },
  currencyName: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  currencySymbol: {
    fontSize: 22,
    width: 40,
    textAlign: 'center',
  },
});

export default SettingsScreen;
