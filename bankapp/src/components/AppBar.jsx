import React from 'react';
import { Appbar } from 'react-native-paper';
import Mainmenu from '../ui/mainmenu';

const AppBar = ({ route, title, navigation }) => {
  const displayCss = (title === "Login" || title === "Signup");

  return (
    <Appbar.Header elevated={1} style={{ backgroundColor: '#2196F3', display: displayCss ? "none" : "block" }}>
      {route === 'Dashboard' ? (
        <Appbar.Action icon="home" size={24} color="#fff" />
      ) : (
        <Appbar.BackAction iconColor='#fff' onPress={() => navigation.goBack()} />
      )}
      <Appbar.Content title={title} titleStyle={{color: "#fff"}} />
      <Mainmenu />
    </Appbar.Header>
  );
};

export default AppBar;