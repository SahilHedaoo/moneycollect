import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const ReceiptScreen = () => {
  const { params } = useRoute();
  const { item } = params || {};

  if (!item) {
    return <Text style={styles.error}>No receipt data found.</Text>;
  }

  return (
    <View style={styles.receiptBox}>
  <View style={styles.row}>
    <Text style={styles.label}>Name:</Text>
    <Text style={styles.value}>{item.first_name} {item.last_name}</Text>
  </View>

  <View style={styles.row}>
    <Text style={styles.label}>Amount:</Text>
    <Text style={styles.value}>₹{item.amount}</Text>
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
</View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e88e5',
    textAlign: 'center',
  },
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
    margin:12,
    borderColor:'#ccc',
  },
  label: {
  fontWeight: 'bold',
  fontSize: 15,
  color: '#444',
  flex: 0.4,
},
value: {
  fontSize: 15,
  color: '#000',
  flex: 0.6,
},

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  error: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
    fontSize: 16,
  },
});

export default ReceiptScreen;
