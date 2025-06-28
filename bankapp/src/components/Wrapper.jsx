import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import AppBar from './AppBar';
import BottomBar from './BottomBar';

export default function Wrapper({ title, route, navigation, children }) {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <View style={styles.wrap_container}>
      <AppBar title={title} route={route?.name} navigation={navigation} />
      <View style={{ flex: 1 }}>{children}</View>
      {!isKeyboardVisible && <BottomBar title={title} navigation={navigation} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap_container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});