import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';

const videoList = [
  { id: '1', title: 'How to Add Users', videoId: 'tBe5Ajc6BzE' },
  { id: '2', title: 'How to Collect Money', videoId: 'MJgHwFgov2k' },
  { id: '3', title: 'View Reports', videoId: '6dSkkjEmgQ8' },
];

const TutorialsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const selectedTheme = theme === 'dark' ? darkTheme : lightTheme;

  const handleCardPress = (video) => {
    navigation.navigate('VideoPlayer', { video });
  };

  return (
    <View style={[styles.container, { backgroundColor: selectedTheme.background }]}>
      <FlatList
        data={videoList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: selectedTheme.card }]}
            onPress={() => handleCardPress(item)}
          >
            <Text style={[styles.title, { color: selectedTheme.text }]}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 10,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TutorialsScreen;
