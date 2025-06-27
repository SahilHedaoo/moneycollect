import React from 'react';
import { Appbar } from 'react-native-paper';
import Mainmenu from '../ui/mainmenu';
import { useNavigation } from '@react-navigation/native';

const AppBar = ({ route, title }) => {
    const navigation = useNavigation();

    return (
        <Appbar.Header elevated={1} style={{ backgroundColor: '#fff' }}>
            {route === "Dashboard" ? (
                <Appbar.Action icon="home" size={24} color="#000" />
            ) : (
                <Appbar.BackAction onPress={() => navigation.goBack()} />
            )}

            <Appbar.Content title={title} />
            <Mainmenu />
        </Appbar.Header>
    );
};

export default AppBar;
