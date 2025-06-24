import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddCollectionScreen from '../screens/AddCollectionScreen';
import AddUserScreen from '../screens/AddUserScreen';
import UserCollectionHistoryScreen from '../screens/UserCollectionHistoryScreen';
import BankProfileScreen from '../screens/BankProfileScreen';
import EditUserScreen from '../screens/EditUserScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="AddCollection" component={AddCollectionScreen} />
    <Stack.Screen name="AddUser" component={AddUserScreen} />
    <Stack.Screen name="UserCollectionHistory" component={UserCollectionHistoryScreen} />
    <Stack.Screen name="BankProfile" component={BankProfileScreen} />
    <Stack.Screen name="EditUser" component={EditUserScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
