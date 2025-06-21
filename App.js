import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { checkTokenExpiry } from './utils/checkExp';
import HomeScreen from './screens/HomeScreen';
import { enableScreens } from 'react-native-screens';
import { AuthContext } from './contexts/AuthContext';
import LoginRegisterScreen from './screens/LoginRegisterScreen';
import VerificationScreen from './screens/VerificationScreen'
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import UpdateUserProfileScreen from './screens/UpdateUserProfileScreen';
import Toast from 'react-native-toast-message';
import UploadAvatarScreen from './screens/UploadAvatarScreen';
import { IP } from './constants/config';

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

enableScreens();

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);  

  useEffect(() => {
    (async () => {
      //Cái này xoá mấy cái AsyncStorage, SecureStore cho test auth
      // await SecureStore.deleteItemAsync('userToken');
      // await AsyncStorage.clear()

      const expired = await checkTokenExpiry();
      setIsLoggedIn(!expired);
    })();
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
              <Stack.Screen name="UpdateUserProfile" component={UpdateUserProfileScreen} />            
              <Stack.Screen name="UploadAvatar" component={UploadAvatarScreen} />
              {/* `Đừng để Verification ở đây */}
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginRegisterScreen} />
              <Stack.Screen name="Verification" component={VerificationScreen} />
              <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast/>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});
