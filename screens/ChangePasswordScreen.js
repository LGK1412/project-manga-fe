import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import SendChangePasswordCodeButton from '../components/SendChangePasswordCodeButton';
import ResetChangePasswordButton from '../components/ResetChangePasswordButton';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangePasswordScreen() {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                setToken(token);

                const userInfoStr = await AsyncStorage.getItem('userInfo');

                if (userInfoStr) {
                    const userInfo = JSON.parse(userInfoStr);
                    setEmail(userInfo.email || '');
                }

            } catch (err) {
                console.log('Lỗi khi lấy thông tin người dùng:', err);
            }
        };

        fetchData();
    }, []);

    const validationSchema = Yup.object({
        code: Yup.string()
            .required('Vui lòng nhập mã')
            .matches(/^\d{6}$/, 'Mã xác nhận phải gồm đúng 6 chữ số'),

        newPassword: Yup.string()
            .required('Vui lòng nhập mật khẩu')
            .matches(
                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{6,30}$/,
                'Mật khẩu từ 6-30 ký tự gồm chữ, số và ký tự đặc biệt'
            )
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đổi mật khẩu</Text>
            <SendChangePasswordCodeButton email={email} token={token} />
            <Formik
                initialValues={{ code: '', newPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={() => { }}
            >
                {({ handleChange, values, errors, touched, handleBlur }) => (
                    <>
                        <TextInput
                            placeholder="Mã xác nhận"
                            style={styles.input}
                            value={values.code}
                            onChangeText={handleChange('code')}
                            onBlur={handleBlur('code')}
                            keyboardType="numeric"
                        />
                        {touched.code && errors.code && <Text style={styles.error}>{errors.code}</Text>}

                        <TextInput
                            placeholder="Mật khẩu mới"
                            secureTextEntry
                            style={styles.input}
                            value={values.newPassword}
                            onChangeText={handleChange('newPassword')}
                            onBlur={handleBlur('newPassword')}
                        />
                        {touched.newPassword && errors.newPassword && (
                            <Text style={styles.error}>{errors.newPassword}</Text>
                        )}

                        <ResetChangePasswordButton
                            email={email}
                            code={values.code}
                            newPassword={values.newPassword}
                        />
                    </>
                )}
            </Formik>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginVertical: 8,
        borderRadius: 5,
    },
    title: {
        fontSize: 22,
        marginBottom: 20,
        textAlign: 'center',
    },
    error: {
        color: 'red',
        fontSize: 12,
        marginTop: -5,
        marginBottom: 8,
    },
});
