import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createMaterialBottomTabNavigator();

const BottomBar = () => {
  return (
    <NavigationContainer independent={true}> {/* 👈 Important to avoid nesting errors */}
      <Tab.Navigator
        initialRouteName="Settings"
        shifting={true}
        barStyle={{ backgroundColor: '#2196F3' }}
        activeColor="#fff"
      >
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="cog" color={color} size={24} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default BottomBar;
