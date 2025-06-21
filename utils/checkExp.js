import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { IP } from '../constants/config';

export async function checkTokenExpiry() {
    const stored = await AsyncStorage.getItem('userInfo');
    const user = stored ? JSON.parse(stored) : null;

    if (!user || !user.exp) return true; // Không có exp => hết hạn

    const now = Math.floor(Date.now() / 1000);
    const token = await SecureStore.getItemAsync('userToken');

    if (user.exp < now) {
        try {
            const result = await fetch(`http://${IP}:333/api/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    loginToken: token
                }),
            });

            if (result.success) {
                await SecureStore.deleteItemAsync('userToken');
                await AsyncStorage.removeItem('userInfo');
                return true; // Token hết hạn
            } else {
                return false
            }
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }
    return false; // Token còn hạn 
}
