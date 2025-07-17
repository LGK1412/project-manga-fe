import { TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { IP } from '../constants/config';

const LogoutButton = () => {
    const { setIsLoggedIn } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const userInfo = await AsyncStorage.getItem('userInfo');
            const user = JSON.parse(userInfo);

<<<<<<< HEAD
            const res = await fetch(`http://${IP}:333/api/auth/logout`, {
=======
            const res = await fetch(`http://192.168.1.169:333/api/auth/logout`, {
>>>>>>> e483284 (push front-end FE lên branch leloi)
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    loginToken: token
                }),
            });

            const result = await res.json();

            if (result.success) {
                await SecureStore.deleteItemAsync('userToken');
                await AsyncStorage.removeItem('userInfo');
                setIsLoggedIn(false);
            } else {
                Alert.alert('Logout Failed', result.message || 'Something went wrong');
            }
        } catch (err) {
            console.error('Logout error:', err);
            Alert.alert('Error', 'Logout failed. Please try again.');
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Image
                source={require('../assets/logout-icon.png')}
                style={styles.icon}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ff4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: '#fff',
    },
});

export default LogoutButton;
