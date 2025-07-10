import React, { useRef, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Share from 'react-native-share';
import { Button } from 'react-native-paper';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import { SettingsContext } from '../context/SettingsContext';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';
import { showToast } from '../ui/toast';
import { Linking } from 'react-native';

const ReceiptScreen = () => {
  const { symbol, dialCode } = useContext(SettingsContext);
  const { theme } = useContext(ThemeContext);
  const selectedTheme = theme === 'dark' ? darkTheme : lightTheme;

  const { params } = useRoute();
  const { item } = params || {};
  const viewShotRef = useRef();

  const handleShareImage = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      if (!uri) throw new Error('Failed to capture receipt image.');

      const filePath = `${RNFS.CachesDirectoryPath}/receipt_${Date.now()}.png`;
      await RNFS.copyFile(uri, filePath);

      const isWAInstalled = await Share.isPackageInstalled('com.whatsapp');
      if (!isWAInstalled) {
        return showToast('error', 'WhatsApp is not installed on this device.');
      }

      await Share.shareSingle({
        url: `file://${filePath}`,
        type: 'image/png',
        failOnCancel: false,
        social: Share.Social.WHATSAPP,
      });

      if (item?.phone && item?.dial_code) {
        const formattedPhone = `${item.dial_code}${item.phone}`.replace(/\s+/g, '');
        const message = `Hi ${item.first_name}, here is your receipt:\nAmount: ${symbol}${item.amount}\nDate: ${new Date(item.collected_at).toLocaleString()}`;
        const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;

        setTimeout(() => {
          Linking.openURL(whatsappUrl).catch(() => {
            showToast('error', 'Could not open WhatsApp to send message.');
          });
        }, 800);
      }
    } catch (error) {
      console.error('Error during WhatsApp share:', error);
      showToast('error', error.message || 'Could not share receipt.');
    }
  };

  if (!item) return <Text style={[styles.error, { color: selectedTheme.text }]}>No receipt data found.</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: selectedTheme.background }}>
    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
      <View style={[styles.receiptBox, { backgroundColor: selectedTheme.card, borderColor: selectedTheme.text }]}>
        <TextRow label="Name:" value={`${item.first_name} ${item.last_name}`} textColor={selectedTheme.text} />
        <TextRow label="Amount:" value={`${symbol}${item.amount}`} textColor={selectedTheme.text} />
        <TextRow label="Package Name:" value={item.frequency} textColor={selectedTheme.text} />
        <TextRow label="Date:" value={new Date(item.collected_at).toLocaleString()} textColor={selectedTheme.text} />
        <TextRow label="User ID:" value={item.user_id} textColor={selectedTheme.text} />
        <TextRow label="Bank ID:" value={item.bank_id} textColor={selectedTheme.text} />
        <TextRow label="Phone:" value={`${dialCode} ${item.phone}`} textColor={selectedTheme.text} />

        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Button mode="contained" style={{ backgroundColor: '#25D366' }} onPress={handleShareImage}>
            Share Receipt via WhatsApp
          </Button>
        </View>
      </View>
    </ViewShot>
    </View>
  );
};

const TextRow = ({ label, value, textColor }) => (
  <View style={styles.row}>
    <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    <Text style={[styles.value, { color: textColor }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  receiptBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    margin: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    flex: 0.4,
  },
  value: {
    flex: 0.6,
  },
  error: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default ReceiptScreen;
