import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import DateButton from '../components/DateButton';

const UserReportScreen = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastFilePath, setLastFilePath] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const token = await AsyncStorage.getItem('token');
            const res = await api.get('/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data);
        };
        fetchUsers();
    }, []);

    const formatDate = (date) => date?.toISOString().split('T')[0];
    const downloadUserReport = async () => {
        if (!startDate || !endDate || !selectedUserId) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please select user and date range.',
            });
            return;
        }
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const start = formatDate(startDate);
            const end = formatDate(endDate);

            const res = await api.get(`/collections/user/${selectedUserId}/filter?start=${start}&end=${end}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const collections = res.data;

            if (!collections.length) {
                Toast.show({
                    type: 'info',
                    text1: 'No Data',
                    text2: 'No collections found for this user and date range.',
                });
                return;
            }
            const user = users.find(u => u.id === selectedUserId);
            const totalAmount = collections.reduce((sum, item) => sum + parseFloat(item.amount), 0);
            const wsData = [
                [`User Name: ${user.first_name} ${user.last_name}`],
                [`Date Range: ${start} to ${end}`],
                [`Total Amount: ₹${totalAmount}`],
                [],
                ['Amount', 'Package'],
                ...collections.map(c => [c.amount, c.frequency]),
            ];

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, 'User Report');
            const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

            const filePath = `${RNFS.DownloadDirectoryPath}/user_report_${Date.now()}.xlsx`;
            await RNFS.writeFile(filePath, wbout, 'ascii');
            setLastFilePath(filePath);

            Toast.show({
                type: 'success',
                text1: 'Report Saved',
                text2: 'Excel report for user downloaded successfully!',
            });
        } catch (err) {
            console.error('Error:', err);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to download user report.',
            });
        } finally {
            setLoading(false);
        }
    };

    const shareReport = async () => {
        if (!lastFilePath) {
            Toast.show({
                type: 'error',
                text1: 'No Report',
                text2: 'Please download the report first.',
            });
            return;
        }
        try {
            await Share.open({
                title: 'User Collection Report',
                message: 'Here is the user collection report.',
                url: 'file://' + lastFilePath,
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
        } catch (err) {
            console.error('Share Error:', err);
        }
    };
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>User Report</Text>
            <Text style={styles.label}>Select User</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedUserId}
                    onValueChange={(itemValue) => setSelectedUserId(itemValue)}
                >
                    <Picker.Item label="-- Select --" value="" />
                    {users.map((user) => (
                        <Picker.Item
                            key={user.id}
                            label={`${user.first_name} ${user.last_name}`}
                            value={user.id}
                        />
                    ))}
                </Picker>
            </View>
            <View style={styles.datePickerRow}>
                <DateButton
                    date={startDate}
                    onPress={() => setShowStartPicker(true)}
                    color="green"
                />

                <DateButton
                    date={endDate}
                    onPress={() => setShowEndPicker(true)}
                    color="red"
                />
            </View>

            {showStartPicker && (
                <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, date) => {
                        setShowStartPicker(false);
                        if (date) setStartDate(date);
                    }}
                />
            )}

            {showEndPicker && (
                <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, date) => {
                        setShowEndPicker(false);
                        if (date) setEndDate(date);
                    }}
                />
            )}

            <TouchableOpacity style={styles.downloadButton} onPress={downloadUserReport}>
                <Text style={{ color: '#fff' }}>📥 Download Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={shareReport}>
                <Text style={{ color: '#fff' }}>📤 Share Report</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
        </ScrollView>
    );
};

export default UserReportScreen;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 6,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        marginBottom: 16,
    },
    datePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#e3f2fd',
        padding: 10,
        borderRadius: 6,
    },
    downloadButton: {
        backgroundColor: '#1e88e5',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 20,
    },
    shareButton: {
        backgroundColor: '#43a047',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
    },
});
