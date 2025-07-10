import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableHighlight, Dimensions, FlatList,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { FAB } from 'react-native-paper';
import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { showToast } from '../ui/toast'; 
import { ThemeContext } from '../context/themeContext';
import { darkTheme, lightTheme } from '../styles/themes';
import { BarChart } from 'react-native-chart-kit';

const DashboardScreen = () => {
  const [summary, setSummary] = useState(null);
  const [collections, setCollections] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const topChartUsers = topUsers.slice(0, 6);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const USERS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  const { currency, symbol } = useContext(SettingsContext);
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
      const topUsersRes = await api.get('/collections/top-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopUsers(topUsersRes.data);

    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to fetch collections');
    }
  };

  const totalPages = Math.ceil(topUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = topUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  const renderCard = (label, value, filterType) => (
    <TouchableHighlight
      key={filterType}
      underlayColor="#ddd"
      style={styles.cardTouchable}
      onPress={() => navigation.navigate('FilteredCollections', { filterType })}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{label}</Text>
        <Text style={styles.cardValue}>{symbol}{value.toFixed(2)}</Text>
      </View>
    </TouchableHighlight>
  );

  return (

    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.subcontainer, { backgroundColor: currentTheme.card, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {summary && (
          <View style={[styles.cardContainer, { backgroundColor: currentTheme.input }]}>
            {renderCard('Today', summary.today, 'today')}
            {renderCard('Yesterday', summary.yesterday, 'yesterday')}
            {renderCard('This Week', summary.week, 'week')}
            {renderCard('This Month', summary.month, 'month')}
            {renderCard('This Year', summary.year, 'year')}

            <TouchableHighlight
              underlayColor="#ddd"
              style={styles.cardTouchable}
              onPress={() => navigation.navigate('CollectionReport')}
            >
              <View style={[styles.card, { backgroundColor: '#ffe0b2' }]}>
                <Text style={[styles.cardTitle, { color: '#e65100', height: 50 }]}>
                  Custom Collection Report
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        )}

        {topChartUsers.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: currentTheme.text }]}>
              Top Contributing Users
            </Text>
            
            <BarChart
              data={{
                labels: topChartUsers.map((u) =>
                  u.name.length > 10 ? u.name.slice(0, 10) + '…' : u.name
                ),
                datasets: [
                  {
                    data: topChartUsers.map((u) => parseFloat(u.total) || 0),
                  },
                ],
              }}
              width={screenWidth - 32}
              height={220}
              yAxisLabel={symbol}
              chartConfig={{
                backgroundGradientFrom: currentTheme.card,
                backgroundGradientTo: currentTheme.card,
                fillShadowGradient: '#1e88e5',
                fillShadowGradientOpacity: 1,
                decimalPlaces: 0,
                barRadius: 4,
                color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
                labelColor: () => currentTheme.text,
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: '#ccc',
                },
                propsForLabels: {
                  fontSize: 12,
                },
              }}
              verticalLabelRotation={45}
              style={{
                borderRadius: 12,
                marginVertical: 8,
              }}
            />
          </View>
        )}

        {topUsers.length > 0 && (
          <View style={styles.flatListContainer}>
            <Text style={[styles.chartTitle, { color: currentTheme.text }]}>
              All Contributing Users
            </Text>

            <View style={styles.userListContainer}>        
              {paginatedUsers.map((user, index) => (
                <View key={startIndex + index} style={styles.userRow}>
                  <Text style={[styles.userName, { color: currentTheme.text }]}>
                    {startIndex + index + 1}. {user.name}
                  </Text>
                  <Text style={[styles.userAmount, { color: currentTheme.text }]}>
                    {symbol}{user.total}
                  </Text>
                </View>
              ))}

              {/* Pagination Buttons */}
              <View style={styles.paginationButtons}>
                
                <Text
                  style={[styles.paginationText, currentPage === 1 && styles.disabled]}
                  onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                >
                  ◀ Prev
                </Text>
                <Text
                  style={[styles.paginationText, currentPage === totalPages && styles.disabled]}
                  onPress={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                >
                  Next ▶
                </Text>
                
              </View>
              
               <Text style={[styles.chartTitle, { color: currentTheme.text }]}>
                Users (Page {currentPage} of {totalPages})
              </Text>
            </View>


          </View>
        )}

      </ScrollView>
      <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={() => navigation.navigate('AddCollection')}
      />
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
    paddingVertical: 20,
    paddingHorizontal: 16,
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
    paddingBottom: 4,
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 0,
    bottom: 10,
    backgroundColor: '#1e88e5',
    margin: 16
  },
  chartContainer: {
    marginTop: 32,
    marginBottom:32,
    paddingVertical: 8,
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  userListContainer: {
    marginTop: 16,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  userName: {
    fontSize: 14,
    flex: 1,
  },
  userAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  paginationText: {
    fontSize: 15,
    color: '#1e88e5',
    fontWeight: 'bold',
    lineHeight: 30
  },
  disabled: {
    color: '#aaa',
  },

  toggleText: {
    textAlign: 'center',
    color: '#1e88e5',
    fontWeight: '600',
    marginTop: 10,
    fontSize: 14,
  },

});

export default DashboardScreen;
