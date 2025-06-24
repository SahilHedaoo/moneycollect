import React, { useState } from 'react';
import { Platform } from 'react-native';
import { Appbar, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const AppBar = ({ route, title }) => {
    const navigation = useNavigation();
    const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';

    const [menuVisible, setMenuVisible] = useState(false);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const handleNavigate = (screen) => {
        closeMenu();
        navigation.navigate(screen);
    };

    const handleLogout = async () => {
        closeMenu();
        await AsyncStorage.removeItem('token');
        navigation.replace('Login');
    };

    return (
        <Appbar.Header elevated={1} style={{ backgroundColor: '#fff' }}>
            {route === "Dashboard" ? (
                <Appbar.Action icon="home" size={24} color="#000" />
            ) : (
                <Appbar.BackAction onPress={() => navigation.goBack()} />
            )}

            <Appbar.Content title={title} />

            <Menu
                visible={menuVisible}
                onDismiss={closeMenu}
                anchor={<Appbar.Action icon={MORE_ICON} onPress={openMenu} />}
            >
                <Menu.Item onPress={() => handleNavigate('BankProfile')} title="👤 Profile" />
                <Menu.Item onPress={() => handleNavigate('AddUser')} title="➕ Add User" />
                <Menu.Item onPress={() => handleNavigate('AddCollection')} title="💰 Add Collection" />
                <Menu.Item title="📋 Users" onPress={() => handleNavigate('UserList')} />

                <Menu.Item onPress={handleLogout} title="🚪 Logout" />
            </Menu>
        </Appbar.Header>
    );
};

export default AppBar;
