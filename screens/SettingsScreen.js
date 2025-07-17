import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    // Lấy trạng thái theme từ AsyncStorage khi mở màn hình
    const fetchTheme = async () => {
      const value = await AsyncStorage.getItem('darkMode');
      // setIsDarkMode(value === 'true'); // This line is removed as per the edit hint
    };
    fetchTheme();
  }, []);

  // const toggleSwitch = async () => { // This function is removed as per the edit hint
  //   setIsDarkMode((prev) => {
  //     AsyncStorage.setItem('darkMode', (!prev).toString());
  //     return !prev;
  //   });
  // };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>Settings</Text>
      <View style={styles.row}>
        <Text style={[styles.label, isDarkMode && styles.darkText]}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkContainer: {
    backgroundColor: '#222',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#222',
  },
  darkText: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70%',
    paddingVertical: 16,
  },
  label: {
    fontSize: 18,
    color: '#222',
  },
}); 