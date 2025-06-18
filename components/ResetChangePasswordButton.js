import { useState, useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <== MISSING

const IP = '192.168.1.8';

export default function ResetChangePasswordButton({ email, code, newPassword }) {
    const [loading, setLoading] = useState(false);
    const { setIsLoggedIn } = useContext(AuthContext);

    const navigation = useNavigation();

    const changePassword = async () => {
        if (!email || !code || !newPassword) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ email, mã xác nhận và mật khẩu');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                Alert.alert('Lỗi', 'Không tìm thấy token đăng nhập');
                return;
            }

            const res = await fetch(`http://${IP}:333/api/auth/verify-change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    providedCode: Number(code),
                    newPassword,
                }),
            });

            const result = await res.json();

            if (result?.success) {
                Alert.alert('Thành công', result.message || 'Đã đổi mật khẩu');

                // Logout
                await SecureStore.deleteItemAsync('userToken');
                await AsyncStorage.removeItem('userInfo');
                setIsLoggedIn(false);
            } else {
                Alert.alert('Lỗi', result.message || 'Không thể đổi mật khẩu');
            }
        } catch (err) {
            Alert.alert('Lỗi kết nối', err.message || 'Máy chủ không phản hồi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={changePassword}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.text}>Đổi mật khẩu</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#2196F3',
        padding: 12,
        marginTop: 20,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#999',
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
