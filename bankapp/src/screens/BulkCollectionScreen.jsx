import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Button, TextInput, RadioButton } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';
import { useNavigation } from '@react-navigation/native';

const BulkCollectionScreen = () => {
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const navigation = useNavigation();

  const [filterAmount, setFilterAmount] = useState('');
  const [packageType, setPackageType] = useState('');
  const [matchBoth, setMatchBoth] = useState(false);

  const handleFilter = () => {
    if (!filterAmount && !packageType) {
      Toast.show({ type: 'error', text1: 'Enter amount or select package type' });
      return;
    }

    navigation.navigate('FilteredUsers', {
      amount: filterAmount,
      package: packageType,
      matchMode: matchBoth ? 'and' : 'or',
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={[styles.heading, { color: currentTheme.primary }]}>Bulk Collection</Text>

        <TextInput
          label="Filter by Package Amount (optional)"
          value={filterAmount}
          onChangeText={setFilterAmount}
          keyboardType="numeric"
          styles={[styles.input, { backgroundColor: '#1e88e5' }]}
          placeholder="e.g., 100"
        />

        <Text style={[styles.label, { color: currentTheme.text }]}>Or Select Package Type</Text>
        <RadioButton.Group onValueChange={setPackageType} value={packageType}>
          {['Daily', 'Weekly', 'Monthly'].map((type) => (
            <View key={type} style={styles.radioRow}>
              <RadioButton value={type} color={currentTheme.primary} />
              <Text style={{ color: currentTheme.text }}>{type}</Text>
            </View>
          ))}
        </RadioButton.Group>

        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: currentTheme.text }]}>
            Match both amount and type?
          </Text>
          <Switch
            value={matchBoth}
            onValueChange={() => setMatchBoth(!matchBoth)}
            trackColor={{ false: '#aaa', true: currentTheme.primary }}
          />
        </View>

        <Button mode="contained" onPress={handleFilter} style={styles.button}>
          View Users
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
  },
  button: { 
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
    backgroundColor: '#1e88e5',
  },
});

export default BulkCollectionScreen;
