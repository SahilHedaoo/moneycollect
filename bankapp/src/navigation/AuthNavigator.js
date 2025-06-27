import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddCollectionScreen from '../screens/AddCollectionScreen';
import AddUserScreen from '../screens/AddUserScreen';
import UserCollectionHistoryScreen from '../screens/UserCollectionHistoryScreen';
import BankProfileScreen from '../screens/BankProfileScreen';
import EditUserScreen from '../screens/EditUserScreen';
import UserListScreen from '../screens/UserListScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FilteredCollectionsScreen from '../screens/FilteredCollectionsScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchtoken = async () => {
      const token = await AsyncStorage.getItem('token');
      setToken(token);
    }
  }, [])

  return (
    <Stack.Navigator initialRouteName={token ? "Dashboard" : "Login"} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="AddCollection" component={AddCollectionScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="UserCollectionHistory" component={UserCollectionHistoryScreen} />
      <Stack.Screen name="BankProfile" component={BankProfileScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
      <Stack.Screen name="UserList" component={UserListScreen} />
      <Stack.Screen name="FilteredCollections" component={FilteredCollectionsScreen}/>

    </Stack.Navigator>
  );
}

export default AuthNavigator;
