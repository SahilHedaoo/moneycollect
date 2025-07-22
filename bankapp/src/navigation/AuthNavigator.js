import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddCollectionScreen from '../screens/AddCollectionScreen';
import AddUserScreen from '../screens/AddUserScreen';
import UserCollectionHistoryScreen from '../screens/UserCollectionHistoryScreen';
import BankProfileScreen from '../screens/BankProfileScreen';
import EditUserScreen from '../screens/EditUserScreen';
import UserListScreen from '../screens/UserListScreen';
import FilteredCollectionsScreen from '../screens/FilteredCollectionsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import Wrapper from '../components/Wrapper';
import ReceiptScreen from '../screens/ReceiptScreen';
import ReportsScreen from '../screens/ReportsScreen';
import UserReportScreen from '../screens/UserReportScreen';
import TutorialsScreen from '../screens/TutorialsScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import CollectionReportScreen from '../screens/CollectionReportScreen';
import LoaderKitView from 'react-native-loader-kit';
import { StyleSheet, View } from 'react-native';
import BulkCollectionScreen from '../screens/BulkCollectionScreen';
import FilteredUsersScreen from '../screens/FilteredUsersScreen';
import ReturnMoneyScreen from '../screens/ReturnMoneyScreen';
import TrashUserScreen from '../screens/TrashUserScreen';
const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ loading state

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
      setLoading(false);
    };
    fetchToken();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoaderKitView style={styles.loader} name='BallSpinFadeLoader' color="#2196F3" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={token ? 'Dashboard' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login">
        {({ navigation, route }) => (
          <Wrapper title="Login" route={route} navigation={navigation}>
            <LoginScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="Signup">
        {({ navigation, route }) => (
          <Wrapper title="Signup" route={route} navigation={navigation}>
            <SignupScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="Dashboard">
        {({ navigation, route }) => (
          <Wrapper title="Dashboard" route={route} navigation={navigation}>
            <DashboardScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="AddCollection">
        {({ navigation, route }) => (
          <Wrapper title="Add Collection" route={route} navigation={navigation}>
            <AddCollectionScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="AddUser">
        {({ navigation, route }) => (
          <Wrapper title="Add User" route={route} navigation={navigation}>
            <AddUserScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="UserCollectionHistory">
        {({ navigation, route }) => (
          <Wrapper title="User Collection History" route={route} navigation={navigation}>
            <UserCollectionHistoryScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="BankProfile">
        {({ navigation, route }) => (
          <Wrapper title="Bank Profile" route={route} navigation={navigation}>
            <BankProfileScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="EditUser">
        {({ navigation, route }) => (
          <Wrapper title="Edit User" route={route} navigation={navigation}>
            <EditUserScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="UserList">
        {({ navigation, route }) => (
          <Wrapper title="User List" route={route} navigation={navigation}>
            <UserListScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="FilteredCollections">
        {({ navigation, route }) => (
          <Wrapper title="Filtered Collections" route={route} navigation={navigation}>
            <FilteredCollectionsScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="Settings">
        {({ navigation, route }) => (
          <Wrapper title="Settings" route={route} navigation={navigation}>
            <SettingsScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="Receipt">
        {({ navigation, route }) => (
          <Wrapper title="Receipt" route={route} navigation={navigation}>
            <ReceiptScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="Reports">
        {({ navigation, route }) => (
          <Wrapper title="Reports" route={route} navigation={navigation}>
            <ReportsScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="UserReport">
        {({ navigation, route }) => (
          <Wrapper title="UserReport" route={route} navigation={navigation}>
            <UserReportScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="Tutorials">
        {({ navigation, route }) => (
          <Wrapper title="Tutorials" route={route} navigation={navigation}>
            <TutorialsScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="VideoPlayer">
        {({ navigation, route }) => (
          <Wrapper title="VideoPlayer" route={route} navigation={navigation}>
            <VideoPlayerScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="CollectionReport">
        {({ navigation, route }) => (
          <Wrapper title="CollectionReport" route={route} navigation={navigation}>
            <CollectionReportScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="BulkCollection">
        {({ navigation, route }) => (
          <Wrapper title="BulkCollection" route={route} navigation={navigation}>
            <BulkCollectionScreen />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="FilteredUsers">
        {({ navigation, route }) => (
          <Wrapper title="FilteredUsers" route={route} navigation={navigation}>
            <FilteredUsersScreen navigation={navigation} route={route} />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="ReturnMoney">
        {({ navigation, route }) => (
          <Wrapper title="ReturnMoney" route={route} navigation={navigation}>
            <ReturnMoneyScreen navigation={navigation} route={route} />
          </Wrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="TrashUser">
        {({ navigation, route }) => (
          <Wrapper title="TrashUser" route={route} navigation={navigation}>
            <TrashUserScreen navigation={navigation} route={route} />
          </Wrapper>
        )}
      </Stack.Screen>
    </Stack.Navigator>

  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  loader: { width: 80, height: 80 },

});

export default AuthNavigator;