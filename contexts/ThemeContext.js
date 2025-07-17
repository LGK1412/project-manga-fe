import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      const value = await AsyncStorage.getItem('darkMode');
      setIsDarkMode(value === 'true');
    };
    fetchTheme();
  }, []);

  const toggleTheme = async () => {
    setIsDarkMode((prev) => {
      AsyncStorage.setItem('darkMode', (!prev).toString());
      return !prev;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 