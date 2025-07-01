import React, { useRef, useContext } from 'react';
import { View, Text, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Share from 'react-native-share';
import { Button } from 'react-native-paper';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import { SettingsContext } from '../context/SettingsContext';
import { showToast } from '../ui/toast';

const ReceiptScreen = () => {
  const { currency, symbol } = useContext(SettingsContext);
  const { params } = useRoute();
  const { item } = params || {};
  const viewShotRef = useRef();

  const handleShareImage = async () => {
  try {
    if (!item.phone) {
      showToast('error', 'Phone number not available for WhatsApp.');
      return;
    }

    const uri = await viewShotRef.current.capture();
    const filePath = `${RNFS.CachesDirectoryPath}/receipt_${Date.now()}.png`;
    await RNFS.copyFile(uri, filePath);

    let formattedPhone = item.phone.startsWith('+') ? item.phone : '+91' + item.phone;
    formattedPhone = formattedPhone.replace(/[^0-9]/g, '');

    const shareOptions = {
      url: `file://${filePath}`,
      type: 'image/png',
      social: Share.Social.WHATSAPP,
      whatsAppNumber: formattedPhone,
      failOnCancel: false,
    };

    // ✅ Add slight delay to ensure file is ready and WhatsApp can load it
    setTimeout(() => {
      Share.shareSingle(shareOptions);
    }, 800); // 800ms delay
  } catch (error) {
    console.error('Error sharing receipt image:', error);
    showToast('error', 'Could not share the receipt image.');
  }
};

  if (!item) {
    return <Text style={styles.error}>No receipt data found.</Text>;
  }

  return (
    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
      <View style={styles.receiptBox}>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{item.first_name} {item.last_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>{symbol}{item.amount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Package Name:</Text>
          <Text style={styles.value}>{item.frequency}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{new Date(item.collected_at).toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{item.user_id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bank ID:</Text>
          <Text style={styles.value}>{item.bank_id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{item.phone}</Text>
        </View>
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Button style={{ backgroundColor: '#25D366' }} mode="contained" onPress={handleShareImage}>
            Share Receipt via WhatsApp
          </Button>
        </View>
      </View>
    </ViewShot>
  );
};

const styles = StyleSheet.create({
  receiptBox: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin: 12,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#444',
    flex: 0.4,
    paddingVertical: 4,
  },
  value: {
    fontSize: 15,
    color: '#000',
    flex: 0.6,
    paddingVertical: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
    paddingVertical: 2,
  },
  error: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
    fontSize: 16,
  },
});

export default ReceiptScreen;
