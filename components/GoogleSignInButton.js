import { useEffect } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';
import Constants from 'expo-constants';
import { IP } from '../constants/config';

export default function GoogleSignInButton() {
  const { setIsLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    GoogleSignin.configure({

      webClientId:'682663221551-gja7tocds42r31hdqhu99k97faq1nfu5.apps.googleusercontent.com', // Your web client ID
    });
  }, []);

  function decodeToken(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  }

  async function saveUserInfo(result) {
    if (result?.success && result?.token) {
      try {
        await SecureStore.deleteItemAsync('userToken');
        await AsyncStorage.removeItem('userInfo');

        const decoded = decodeToken(result.token);
        // console.log('Decoded JWT:', decoded);
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

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      await GoogleSignin.signOut();


      const userInfos = await GoogleSignin.signIn();

      const idToken = userInfos.data.idToken;

      const userInfo = userInfos.data.user
      // console.log(userInfo)
      const res = await fetch(`http://${IP}:333/api/auth/google`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,  // idToken phải có giá trị
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo
        }),
      });

      const result = await res.json();

      await saveUserInfo(result)
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <View>
      <TouchableOpacity onPress={signIn}>
        <Image
          source={require('../assets/google_icon.png')}
          style={{ width: 40, height: 40, borderRadius: 100, borderColor: 'black', borderWidth: 1}}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );

}
