// import React, { useRef, useContext } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import Share from 'react-native-share';
// import { Button } from 'react-native-paper';
// import ViewShot from 'react-native-view-shot';
// import RNFS from 'react-native-fs';
// import { SettingsContext } from '../context/SettingsContext';
// import { ThemeContext } from '../context/themeContext';
// import { lightTheme, darkTheme } from '../styles/themes';
// import { showToast } from '../ui/toast';
// import { Linking } from 'react-native';
// const sanitizePhoneNumber = (dialCode, phone) => {
//   let cleanDial = (dialCode || '').replace(/\D/g, '');
//   let cleanPhone = (phone || '').replace(/^0+/, '').replace(/\D/g, '');
//   return `${cleanDial}${cleanPhone}`;
// };

// const ReceiptScreen = () => {
//   const { symbol, dialCode } = useContext(SettingsContext);
//   const { theme } = useContext(ThemeContext);
//   const selectedTheme = theme === 'dark' ? darkTheme : lightTheme;

//   const { params } = useRoute();
//   const { item } = params || {};
//   const viewShotRef = useRef();

//  const handleShareReceipt = async () => {
//   try {
//     const receiptPhone = item?.phone;
//     // Use item.dial_code if available, otherwise use dialCode from context
//     const receiptDialCode = item?.dial_code || dialCode;
//     if (!receiptPhone || !receiptDialCode) {
//       return showToast('error', `No phone (${receiptPhone}) or dial code (${receiptDialCode}) found for this user.`);
//     }

//     // Build WhatsApp number in international format (no +, no spaces)
//     const formattedPhone = `${receiptDialCode}${receiptPhone}`.replace(/\D/g, '');

//     const message = `Hi ${item.first_name}, here is your receipt:\nAmount: ${symbol}${item.amount}\nDate: ${new Date(item.collected_at).toLocaleString()}`;

//     const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

//     const canOpen = await Linking.canOpenURL(whatsappUrl);
//     if (!canOpen) {
//       showToast('error', 'WhatsApp is not installed or number is invalid.');
//       return;
//     }
//     await Linking.openURL(whatsappUrl);
//   } catch (error) {
//     showToast('error', error.message || 'Could not open WhatsApp.');
//   }
// };

//   if (!item) return <Text style={[styles.error, { color: selectedTheme.text }]}>No receipt data found.</Text>;

//   return (
//     <View style={{ flex: 1, backgroundColor: selectedTheme.background }}>
//     <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
//       <View style={[styles.receiptBox, { backgroundColor: selectedTheme.card, borderColor: selectedTheme.text }]}>
//         <TextRow label="Name:" value={`${item.first_name} ${item.last_name}`} textColor={selectedTheme.text} />
//         <TextRow label="Amount:" value={`${symbol}${item.amount}`} textColor={selectedTheme.text} />
//         <TextRow label="Package Name:" value={item.frequency} textColor={selectedTheme.text} />
//         <TextRow label="Date:" value={new Date(item.collected_at).toLocaleString()} textColor={selectedTheme.text} />
//         <TextRow label="User ID:" value={item.user_id} textColor={selectedTheme.text} />
//         <TextRow label="Bank ID:" value={item.bank_id} textColor={selectedTheme.text} />
//         <TextRow label="Phone:" value={`${dialCode} ${item.phone}`} textColor={selectedTheme.text} />

//         <View style={{ marginTop: 20, alignItems: 'center' }}>
//           <Button mode="contained" style={{ backgroundColor: '#25D366' }} onPress={handleShareReceipt}>
//             Share Receipt via WhatsApp
//           </Button>
//         </View>
//       </View>
//     </ViewShot>
//     </View>
//   );
// };

// const TextRow = ({ label, value, textColor }) => (
//   <View style={styles.row}>
//     <Text style={[styles.label, { color: textColor }]}>{label}</Text>
//     <Text style={[styles.value, { color: textColor }]}>{value}</Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   receiptBox: {
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     margin: 12,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   label: {
//     fontWeight: 'bold',
//     flex: 0.4,
//   },
//   value: {
//     flex: 0.6,
//   },
//   error: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//   },
// });

// export default ReceiptScreen;
import React, { useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Share from 'react-native-share';
import { Button } from 'react-native-paper';
import ViewShot from 'react-native-view-shot';
import { SettingsContext } from '../context/SettingsContext';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';
import { showToast } from '../ui/toast';

const ReceiptScreen = () => {
  const { symbol, dialCode } = useContext(SettingsContext);
  const { theme } = useContext(ThemeContext);
  const selectedTheme = theme === 'dark' ? darkTheme : lightTheme;

  const { params } = useRoute();
  const { item } = params || {};
  const viewShotRef = useRef();

  const handleShareReceipt = async () => {
    try {
      const uri = await viewShotRef.current.capture();

      const shareOptions = {
        title: 'Share Receipt',
        message: `Hi ${item.first_name}, here is your receipt.`,
        url: 'file://' + uri,
        type: 'image/png',
      };

      await Share.open(shareOptions);
    } catch (error) {
      showToast('error', error.message || 'Could not share receipt.');
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      const receiptPhone = item?.phone;
      const receiptDialCode = item?.dial_code || dialCode;

      if (!receiptPhone || !receiptDialCode) {
        return showToast('error', `No phone (${receiptPhone}) or dial code (${receiptDialCode}) found for this user.`);
      }

      const formattedPhone = `${receiptDialCode}${receiptPhone}`.replace(/\D/g, '');
      const message = `Hi ${item.first_name}, here is your receipt:\nAmount: ${symbol}${item.amount}\nDate: ${new Date(item.collected_at).toLocaleString()}`;

      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);

      if (!canOpen) {
        showToast('error', 'WhatsApp is not installed or number is invalid.');
        return;
      }

      await Linking.openURL(whatsappUrl);
    } catch (error) {
      showToast('error', error.message || 'Could not open WhatsApp.');
    }
  };

  if (!item) {
    return <Text style={[styles.error, { color: selectedTheme.text }]}>No receipt data found.</Text>;
  }

  const formattedDate = new Date(item.collected_at);
  const displayPhone = `${item?.dial_code || dialCode} ${item.phone}`;

  return (
    <View style={{ flex: 1, backgroundColor: selectedTheme.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
          <View style={[styles.receiptBox, { backgroundColor: selectedTheme.card, borderColor: selectedTheme.text }]}>
            <TextRow label="Name:" value={`${item.first_name} ${item.last_name}`} textColor={selectedTheme.text} />
            <TextRow label="Amount:" value={`${symbol}${item.amount}`} textColor={selectedTheme.text} />
            <TextRow label="Package Name:" value={item.frequency} textColor={selectedTheme.text} />
            <TextRow
              label="Date:"
              value={`${formattedDate.toLocaleDateString()} ${formattedDate.toLocaleTimeString()}`}
              textColor={selectedTheme.text}
            />
            <TextRow label="User ID:" value={item.user_id} textColor={selectedTheme.text} />
            <TextRow label="Bank ID:" value={item.bank_id} textColor={selectedTheme.text} />
            <TextRow label="Phone:" value={displayPhone} textColor={selectedTheme.text} />

            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                style={[styles.shareButton, { backgroundColor: '#25D366' }]}
                onPress={handleWhatsAppShare}
              >
                Share via WhatsApp
              </Button>
              <Button
                mode="contained"
                style={[styles.shareButton, { backgroundColor: '#1e88e5' }]}
                onPress={handleShareReceipt}
              >
                Share Receipt (Image)
              </Button>
            </View>
          </View>
        </ViewShot>
      </ScrollView>
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
    margin: 16,
    maxWidth: 500,
    alignSelf: 'center',
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
  buttonGroup: {
    marginTop: 20,
    gap: 10,
  },
  shareButton: {
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
  },
});

export default ReceiptScreen;
