import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';

const DateButton = ({ date, onPress, color = 'green' }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { borderColor: color }]}
    >
      <Icon name="calendar" size={16} color={color} />
      <Text style={[styles.dateText, { color }]}>
        {moment(date).format('DD/MM/YYYY')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 100,
    width: '48%',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dateText: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default DateButton;
