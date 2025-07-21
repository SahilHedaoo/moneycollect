import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function BottomBar({ title, navigation, route }) {
  const { bottom } = useSafeAreaInsets();
  const hideBar = ['Login', 'Signup'].includes(title);

  if (hideBar) return null;

  return (
    <Appbar
      style={{
        height: 70 + bottom,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#2196F3',
      }}
    >
      <Pressable
        onPress={() => navigation.navigate('Dashboard')}
        style={{ alignItems: 'center' }}
      >
        <MaterialCommunityIcons
          name="view-dashboard"
          color={title === 'Dashboard' ? '#fff' : '#b6dcfb'}
          size={25}
        />
        <Text style={{ color: title === 'Dashboard' ? '#fff' : '#b6dcfb' }}>
          Dashboard
        </Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('UserList')}
        style={{ alignItems: 'center' }}
      >
        <MaterialCommunityIcons
          name="account-multiple"
          color={title === 'User List' ? '#fff' : '#b6dcfb'}
          size={25}
        />
        <Text style={{ color: title === 'User List' ? '#fff' : '#b6dcfb' }}>
          Users
        </Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('BankProfile')}
        style={{ alignItems: 'center' }}
      >
        <MaterialCommunityIcons
          name="bank"
          color={title === 'Bank Profile' ? '#fff' : '#b6dcfb'}
          size={25}
        />
        <Text style={{ color: title === 'Bank Profile' ? '#fff' : '#b6dcfb' }}>
          Account
        </Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('Settings')}
        style={{ alignItems: 'center' }}
      >
        <MaterialCommunityIcons
          name="cog"
          color={title === 'Settings' ? '#fff' : '#b6dcfb'}
          size={25}
        />
        <Text style={{ color: title === 'Settings' ? '#fff' : '#b6dcfb' }}>
          Settings
        </Text>
      </Pressable>
    </Appbar>
  );
}