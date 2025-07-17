<<<<<<< HEAD
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
=======
import { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { checkTokenExpiry } from "./utils/checkExp";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import DetailScreen from "./screens/DetailScreen";
import SearchScreen from "./screens/SearchScreen";
import ChapterScreen from "./screens/ChapterScreen";
import CategoryScreen from "./screens/CategoryScreen";
import TopNav from "./screens/TopNav";
import BottomNav from "./screens/BottomNav";
import { enableScreens } from "react-native-screens";
import { AuthContext } from "./contexts/AuthContext";
import LoginRegisterScreen from "./screens/LoginRegisterScreen";
import VerificationScreen from "./screens/VerificationScreen";
import ForgetPasswordScreen from "./screens/ForgetPasswordScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import UpdateUserProfileScreen from "./screens/UpdateUserProfileScreen";
import UploadAvatarScreen from "./screens/UploadAvatarScreen";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SettingsScreen from "./screens/SettingsScreen";
import { ThemeProvider } from './contexts/ThemeContext';
>>>>>>> e483284 (push front-end FE lên branch leloi)

enableScreens();

const Stack = createNativeStackNavigator();

export default function App() {
<<<<<<< HEAD
  const [isLoggedIn, setIsLoggedIn] = useState(null);  

  useEffect(() => {
    (async () => {
      //Cái này xoá mấy cái AsyncStorage, SecureStore cho test auth
      // await SecureStore.deleteItemAsync('userToken');
      // await AsyncStorage.clear()
=======
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const navigationRef = useRef();
  const [currentRoute, setCurrentRoute] = useState("Home");
  const [currentMangaId, setCurrentMangaId] = useState(null);

  useEffect(() => {
    (async () => {
      // For testing auth, uncomment to clear storage
      // await SecureStore.deleteItemAsync('userToken');
      // await AsyncStorage.clear();
>>>>>>> e483284 (push front-end FE lên branch leloi)

      const expired = await checkTokenExpiry();
      setIsLoggedIn(!expired);
    })();
  }, []);

<<<<<<< HEAD
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
=======
  if (isLoggedIn === null) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <ThemeProvider>
      <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
            <NavigationContainer
              ref={navigationRef}
              onStateChange={() => {
                const route = navigationRef.current.getCurrentRoute();
                setCurrentRoute(route?.name);
              }}
            >
              {!["Detail", "Chapter"].includes(currentRoute) && (
                <TopNav currentRoute={currentRoute} mangaId={currentMangaId} />
              )}
              <View style={styles.navigatorContainer}>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  {isLoggedIn ? (
                    <>
                      <Stack.Screen name="Home" component={HomeScreen} />
                      <Stack.Screen name="Profile" component={ProfileScreen} />
                      <Stack.Screen name="Search" component={SearchScreen} />
                      <Stack.Screen name="Settings" component={SettingsScreen} />
                      <Stack.Screen name="Detail">
                        {props => <DetailScreen {...props} setCurrentMangaId={setCurrentMangaId} />}
                      </Stack.Screen>
                      <Stack.Screen name="Chapter" component={ChapterScreen} />
                      <Stack.Screen
                        name="ChangePassword"
                        component={ChangePasswordScreen}
                      />
                      <Stack.Screen
                        name="UpdateUserProfile"
                        component={UpdateUserProfileScreen}
                      />
                      <Stack.Screen
                        name="UploadAvatar"
                        component={UploadAvatarScreen}
                      />
                    </>
                  ) : (
                    <>
                      <Stack.Screen name="Home" component={HomeScreen} />
                      <Stack.Screen name="Profile" component={ProfileScreen} />
                      <Stack.Screen name="Search" component={SearchScreen} />
                      <Stack.Screen name="Settings" component={SettingsScreen} />
                      <Stack.Screen name="Detail">
                        {props => <DetailScreen {...props} setCurrentMangaId={setCurrentMangaId} />}
                      </Stack.Screen>
                      <Stack.Screen name="Chapter" component={ChapterScreen} />
                      <Stack.Screen name="Category" component={CategoryScreen} />
                      <Stack.Screen
                        name="Login"
                        component={LoginRegisterScreen}
                      />
                      <Stack.Screen
                        name="Verification"
                        component={VerificationScreen}
                      />
                      <Stack.Screen
                        name="ForgetPassword"
                        component={ForgetPasswordScreen}
                      />
                    </>
                  )}
                </Stack.Navigator>
              </View>
              <BottomNav
                tabBarStyle={styles.tabBar}
                tabBarActiveTintColor="#007AFF"
                tabBarInactiveTintColor="#8E8E93"
                tabBarLabelStyle={styles.tabBarLabel}
                tabBarIconStyle={styles.tabBarIcon}
              />
            </NavigationContainer>
            <Toast />
          </SafeAreaView>
        </SafeAreaProvider>
      </AuthContext.Provider>
    </ThemeProvider>
>>>>>>> e483284 (push front-end FE lên branch leloi)
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
=======
    backgroundColor: "#FFFFFF",
  },
  navigatorContainer: {
    flex: 1, // Ensures the navigator takes up the remaining space between TopNav and BottomNav
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  tabBarIcon: {
    marginBottom: 2,
  },
>>>>>>> e483284 (push front-end FE lên branch leloi)
});
