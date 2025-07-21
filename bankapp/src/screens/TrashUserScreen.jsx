import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreUser } from '../services/api';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import { showToast } from '../ui/toast';
import { ThemeContext } from '../context/themeContext';
import { lightTheme, darkTheme } from '../styles/themes';
import ConfirmModal from '../components/ConfirmModal'; // ✅ Reuse this

const TrashUserScreen = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const styles = createStyles(currentTheme);

  const fetchDeletedUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/deleted');
      setDeletedUsers(res.data);
    } catch (error) {
      console.error('Error fetching deleted users:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      await restoreUser(selectedUserId, token);
      showToast('success', 'User Restored', 'User and all collections restored successfully');
      fetchDeletedUsers();
    } catch (err) {
      console.error(err);
      showToast('error', 'Usernot Restored', 'User and all collections are not restored successfully');
    } finally {
      setSelectedUserId(null);
      setConfirmVisible(false);
    }
  };

  const askRestore = (userId) => {
    setSelectedUserId(userId);
    setConfirmVisible(true);
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} color={currentTheme.primary} />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {deletedUsers.length === 0 ? (
        <Text style={styles.emptyText}>No deleted users</Text>
      ) : (
        deletedUsers.map((user) => (
          <Card key={user.id} style={styles.card}>
            <Card.Title
              title={`${user.custom_user_id} ${user.first_name} ${user.last_name}`}
              subtitle={`${user.dial_code} ${user.phone}`}
              titleStyle={{ color: currentTheme.text }}
              subtitleStyle={{ color: currentTheme.text }}
            />
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => askRestore(user.id)} // ✅ Trigger confirmation
                buttonColor={currentTheme.primary}
                textColor="#fff"
              >
                Restore
              </Button>
            </Card.Actions>
          </Card>
        ))
      )}
      <ConfirmModal
        visible={confirmVisible}
        message="Are you sure you want to restore this user and their collections?"
        onConfirm={handleRestore}
        onCancel={() => {
          setConfirmVisible(false);
          setSelectedUserId(null);
        }}
      />
      <Toast />
    </ScrollView>
  );
};

export default TrashUserScreen;

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.background,
      flexGrow: 1,
    },
    card: {
      marginBottom: 12,
      backgroundColor: theme.card,
    },
    emptyText: {
      marginTop: 30,
      textAlign: 'center',
      fontSize: 16,
      color: theme.text,
    },
    loading: {
      marginTop: 30,
    },
  });
