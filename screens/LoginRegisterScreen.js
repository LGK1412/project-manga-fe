import { useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { decodeToken } from '../utils/decodeToken';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ForgetPasswordButton from '../components/ForgetPasswordButton';
import { IP } from '../constants/config';

const LoginRegisterScreen = () => {

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const toggleAnim = useRef(new Animated.Value(0)).current;

    const navigation = useNavigation();

    const { setIsLoggedIn } = useContext(AuthContext);

    const setIsLoginAnimated = (newState) => {
        setIsLogin(newState);
        Animated.timing(toggleAnim, {
            toValue: newState ? 0 : 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const animatedTranslate = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });


    const validationSchema = Yup.object({
        email: Yup.string()
            .required('Vui lòng nhập email')
            .email('Email không hợp lệ')
            .min(6, 'Email phải từ 6 ký tự')
            .max(60, 'Email không vượt quá 60 ký tự')
            .matches(/@(?:[a-zA-Z0-9-]+\.)?(com|net|vn)$/, 'Email phải có đuôi .com, .net, hoặc .vn'),

        password: Yup.string()
            .required('Vui lòng nhập mật khẩu')
            .matches(
                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{6,30}$/,
                'Mật khẩu từ 6-30 ký tự gồm chữ, số và ký tự đặc biệt'
            )
    });

    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) return '';
        if (password !== confirmPassword) return 'Mật khẩu không khớp';
        return '';
    };

    async function saveUserInfo(result) {
        if (result?.success && result?.token) {

            try {
                await SecureStore.deleteItemAsync('userToken');
                await AsyncStorage.removeItem('userInfo');

                const decoded = decodeToken(result.token);
                // console.log('Decoded JWT:', decoded);

                if (!decoded.verified) {
                    alert('Tài khoản của bạn chưa được xác minh.');
                    const email = decoded.email
                    navigation.navigate('Verification', { email });
                    return;
                }

                await AsyncStorage.setItem('userInfo', JSON.stringify(decoded));

                await SecureStore.setItemAsync('userToken', result.token);
                // console.log('Token saved securely');

                setIsLoggedIn(true);
            } catch (error) {
                console.error('JWT decode or save error:', error);
            }
        } else {
            console.warn('Login failed or no token');
        }
    }


    const handleSubmit = async (values) => {
        if (isLogin) {
            try {
                const res = await fetch(`http://192.168.1.169:333/api/auth/signin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: values.email,
                        password: values.password
                    }),
                });

                const result = await res.json();

                if (result.success) {
                    saveUserInfo(result)
                } else {
                    alert(result.message || 'Đăng nhập thất bại');
                }
            } catch (error) {
                alert('Lỗi kết nối server');
                console.error(error);
            }
        } else {
            try {

                const res = await fetch(`http://192.168.1.169:333/api/auth/signup`, {

                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: values.email,
                        password: values.password
                    }),
                });

                const result = await res.json();

                if (result.success) {
                    navigation.navigate('Verification', { email: values.email });
                } else {
                    alert(result.message || 'Đăng ký thất bại');
                }
            } catch (error) {
                alert('Lỗi kết nối server');
                console.error(error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Formik
                    initialValues={{
                        email: '',
                        password: '',
                        confirmPassword: '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    context={{ isLogin }}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <>
                            <View style={styles.toggleContainer}>
                                <Animated.View
                                    style={[
                                        styles.activeBackground,
                                        {
                                            transform: [{ translateX: animatedTranslate }],
                                        },
                                    ]}
                                />
                                <TouchableOpacity
                                    style={styles.toggleButtonWrapper}
                                    onPress={() => setIsLoginAnimated(true)}
                                >
                                    <Text style={[styles.toggleText, isLogin && styles.activeText]}>Đăng Nhập</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.toggleButtonWrapper}
                                    onPress={() => setIsLoginAnimated(false)}
                                >
                                    <Text style={[styles.toggleText, !isLogin && styles.activeText]}>Đăng Ký</Text>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#999"
                                value={values.email}
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                autoCapitalize="none"
                            />
                            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.inputPass}
                                    placeholder="Mật khẩu"
                                    placeholderTextColor="#999"
                                    value={values.password}
                                    onChangeText={(text) => {
                                        handleChange('password')(text)
                                        setPassword(text)
                                        setConfirmError(validateConfirmPassword(text, confirmPassword))
                                    }}
                                    onBlur={handleBlur('password')}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="gray" />
                                </TouchableOpacity>
                            </View>
                            {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                            {!isLogin && (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Xác nhận mật khẩu"
                                        placeholderTextColor="#999"
                                        value={values.confirmPassword}
                                        onChangeText={(text) => {
                                            handleChange('confirmPassword')(text)
                                            setConfirmPassword(text);
                                            setConfirmError(validateConfirmPassword(password, text));
                                        }}
                                        onBlur={handleBlur('confirmPassword')}
                                        secureTextEntry
                                    />
                                    {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}
                                </>
                            )}

                            <TouchableOpacity
                                style={[styles.button, (!isLogin && confirmError) && { backgroundColor: '#ccc' }]}
                                onPress={() => {
                                    if (!isLogin && confirmError) return;
                                    handleSubmit();
                                }}
                                disabled={!isLogin && !!confirmError}
                            >
                                <Text style={styles.buttonText}>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</Text>
                            </TouchableOpacity>


                            {isLogin && <ForgetPasswordButton />}
                            <Text style={styles.orText}>HOẶC</Text>

                            <GoogleSignInButton />
                        </>
                    )}
                </Formik>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000080',
    },
    card: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
    },
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#ddd',
        borderRadius: 50,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: '#ddd',
    },
    activeToggle: {
        backgroundColor: '#800080',
    },
    toggleText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        height: 40,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    button: {
        width: '100%',
        height: 45,
        backgroundColor: '#800080',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    forgotPassword: {
        color: '#800080',
        marginTop: 10,
        textAlign: 'right',
        width: '100%',
    },
    orText: {
        marginVertical: 10,
        color: '#666',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 5,
        alignSelf: 'flex-start',
    },
    activeBackground: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        backgroundColor: '#800080',
        borderRadius: 50,
        zIndex: 0,
    },
    activeText: {
        color: '#fff',
    },
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        width: '100%',
        height: 45,
        backgroundColor: '#ddd',
        borderRadius: 50,
        overflow: 'hidden',
        position: 'relative',
    },
    toggleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    toggleButtonWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },

    toggleText: {
        color: '#800080',
        fontWeight: 'bold',
        zIndex: 1,
    },
    activeText: {
        color: '#fff',
    },
    activeBackground: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        backgroundColor: '#800080',
        borderRadius: 50,
        top: 0,
        left: 0,
        zIndex: 0,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 2,
    },
    inputPass: {
        flex: 1,
        width: '100%',
        height: 40,
        color: 'black',
    },
});

export default LoginRegisterScreen;
