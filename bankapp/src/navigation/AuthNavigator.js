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

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setToken(token);
    };
    fetchToken();
  }, []);

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
    </Stack.Navigator>
  );
};

export default AuthNavigator;