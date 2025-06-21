import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import SendVerifyCodeButton from '../components/SendVerifyCodeButton';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { IP } from '../constants/config';

const VerificationScreen = () => {
    const [code, setCode] = useState('');

    const route = useRoute();
    const { email } = route.params;
    console.log(email)
    const navigation = useNavigation();

    const handleSubmit = async () => {        
        if (code.trim().length === 0) {
            Alert.alert('Lỗi', 'Nhập mã xác minh');
            return;
        }
        
        try {
            const res = await fetch(`http://${IP}:333/api/auth/verify-verification-code`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    providedCode: code,
                }),
            });

            const data = await res.json();

            if (data?.success) {
                Alert.alert('Thành công', 'Xác minh thành công, vui lòng đăng nhập lại!');
                navigation.navigate('Login')
            } else {
                Alert.alert('Lỗi', data?.message || 'Xác minh thất bại');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Lỗi', 'Không thể kết nối tới server');
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Xác minh tài khoản</Text>

            <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Nhập mã xác minh"
                placeholderTextColor="#999"
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <SendVerifyCodeButton emailTemp={email} />
                </View>

                <TouchableOpacity style={[styles.button, { flex: 1 }]} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Xác minh</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};

export default VerificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#4ade80',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 18,
        fontSize: 18,
        marginBottom: 20,
        color: '#111827',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 1,
    },
    button: {
        backgroundColor: '#4ade80',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
