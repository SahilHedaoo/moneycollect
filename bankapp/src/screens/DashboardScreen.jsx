import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableHighlight,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import AppBar from '../components/AppBar';

const DashboardScreen = () => {
  const [summary, setSummary] = useState(null);
  const [collections, setCollections] = useState([]);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (isFocused) {
      fetchCollectionsAndCalculateSummary();
    }
  }, [isFocused]);

  const fetchCollectionsAndCalculateSummary = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.get('/collections/get', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allCollections = res.data;
      setCollections(allCollections);

      const now = new Date();
      const summary = {
        today: 0,
        yesterday: 0,
        week: 0,
        month: 0,
        year: 0,
      };

      allCollections.forEach((collection) => {
        const collectedAt = new Date(collection.collected_at);
        const amount = parseFloat(collection.amount);

        if (collectedAt.toDateString() === now.toDateString()) {
          summary.today += amount;
        }

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (collectedAt.toDateString() === yesterday.toDateString()) {
          summary.yesterday += amount;
        }

        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay());
        if (collectedAt >= currentWeekStart) {
          summary.week += amount;
        }

        if (
          collectedAt.getMonth() === now.getMonth() &&
          collectedAt.getFullYear() === now.getFullYear()
        ) {
          summary.month += amount;
        }

        if (collectedAt.getFullYear() === now.getFullYear()) {
          summary.year += amount;
        }
      });

      setSummary(summary);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch collections');
    }
  };

  const renderCard = (label, value, filterType) => (
    <TouchableHighlight
      key={filterType}
      underlayColor="#ddd"
      style={styles.cardTouchable}
      onPress={() => navigation.navigate('FilteredCollections', { filterType })}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{label}</Text>
        <Text style={styles.cardValue}>₹{value.toFixed(2)}</Text>
      </View>
    </TouchableHighlight>
  );

  return (
    <View style={styles.container}>
      <AppBar title="Dashboard" route={route.name} />
      <ScrollView contentContainerStyle={styles.subcontainer} showsVerticalScrollIndicator={false}>
        {summary && (
          <View style={styles.cardContainer}>
            {renderCard('Today', summary.today, 'today')}
            {renderCard('Yesterday', summary.yesterday, 'yesterday')}
            {renderCard('This Week', summary.week, 'week')}
            {renderCard('This Month', summary.month, 'month')}
            {renderCard('This Year', summary.year, 'year')}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth / 2 - 30;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  subcontainer: {
    flexGrow: 1,
    padding: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    columnGap: 16,
  },
  cardTouchable: {
    width: cardWidth,
  },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
});

export default DashboardScreen;
