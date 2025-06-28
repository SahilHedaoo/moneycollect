import { View, Text, Platform, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Appbar, Divider, Icon, Menu } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Mainmenu = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
    closeMenu();
  };

  
  const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';

  return (
    <View>
      <Appbar.Action icon={MORE_ICON} iconColor='#fff' onPress={openMenu} />
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        onRequestClose={closeMenu} // Handles hardware back press on Android
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeMenu} // Closes modal when clicking outside
        >
          <View style={styles.menuContainer}>
              <Menu.Item
                leadingIcon="account-circle-outline"
                onPress={() => {
                  navigation.navigate('BankProfile');
                  closeMenu();
                }}
                title="Profile"
              />
              <Menu.Item
                leadingIcon="account-plus-outline"
                onPress={() => {
                  navigation.navigate('AddUser');
                  closeMenu();
                }}
                title="Add User"
              />
              <Menu.Item
                leadingIcon="bank-plus"
                onPress={() => {
                  navigation.navigate('AddCollection');
                  closeMenu();
                }}
                title="Add Collection"
              />
              <Menu.Item
                leadingIcon="account-multiple-outline"
                title="Users"
                onPress={() => {
                  navigation.navigate('UserList');
                  closeMenu();
                }}
              />
              <Divider style={{ height: 1 }} />
              <Menu.Item
                leadingIcon={() => <Icon source="power" size={24} color="red" />}
                onPress={handleLogout}
                title="Logout"
                titleStyle={{ color: 'red' }}
              />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end', // Align menu to the right
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginTop: 40, // Adjust based on Appbar height
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 10,
  },
  menu: {
    backgroundColor: '#fff', 
  },
});

export default Mainmenu;