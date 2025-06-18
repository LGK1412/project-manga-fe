// components/SendVerifyCodeButton.js
import { useState, useEffect } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SendVerifyCodeButton = ({ cooldown = 60, emailTemp }) => {
    const IP = '192.168.1.8'
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false); // 👈 thêm

    useEffect(() => {
        if (timer === 0) return;
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handlePress = async () => {
        if (loading) return; // 👈 chặn nếu đang chạy

        setLoading(true); // 👈 bắt đầu loading

        let email = '';
        const data = await AsyncStorage.getItem('userInfo');

        if (!data) {
            email = emailTemp;
        } else {
            const userInfo = JSON.parse(data);
            email = userInfo.email;
        }

        if (!email) {
            Alert.alert('Lỗi', 'Email không được để trống');
            setLoading(false); // 👈 reset nếu lỗi
            return;
        }

        try {
            const res = await fetch(`http://${IP}:333/api/auth/send-verification-code`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email }),
            });

            const result = await res.json();

            if (result?.success) {
                Alert.alert('Thành công', result.message);
                setTimer(cooldown);
            } else {
                Alert.alert('Lỗi', result.message || 'Gửi mã thất bại');
            }
        } catch (err) {
            Alert.alert('Thất bại', err.message || 'Lỗi kết nối');
        } finally {
            setLoading(false); // 👈 reset loading dù thành công hay thất bại
        }
    };


    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={timer > 0 || loading} // 👈 khóa khi loading
            style={{
                backgroundColor: (timer > 0 || loading) ? '#ccc' : '#007bff',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
            }}
        >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                {timer > 0 ? `Gửi lại ${timer}s` : 'Gửi mã'}
            </Text>
        </TouchableOpacity>
    );
};

export default SendVerifyCodeButton;
