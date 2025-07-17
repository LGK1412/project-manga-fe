import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const BottomNav = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, styles.tabActive]}
          onPress={() => navigation.navigate("Home")}
        >
          <View style={[styles.iconContainer, styles.activeIconContainer]}>
            <Text style={[styles.icon, styles.activeIcon, isDarkMode && styles.darkText]}>🏠</Text>
          </View>
          <Text style={[styles.tabLabel, styles.activeTabLabel, isDarkMode && styles.darkText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("Search")}
        >
          <View style={styles.iconContainer}>
            <Text style={[styles.icon, isDarkMode && styles.darkText]}>🔍</Text>
          </View>
          <Text style={[styles.tabLabel, isDarkMode && styles.darkText]}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={styles.iconContainer}>
            <Text style={[styles.icon, isDarkMode && styles.darkText]}>👤</Text>
          </View>
          <Text style={[styles.tabLabel, isDarkMode && styles.darkText]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("Settings")}
        >
          <View style={styles.iconContainer}>
            <Text style={[styles.icon, isDarkMode && styles.darkText]}>⚙️</Text>
          </View>
          <Text style={[styles.tabLabel, isDarkMode && styles.darkText]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    paddingBottom: 5, // Account for safe area
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  darkContainer: {
    backgroundColor: "#222",
    borderTopColor: "#444",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabActive: {
    // Optional: Add specific styles for active tab if needed
  },
  iconContainer: {
    marginBottom: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIconContainer: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  icon: {
    fontSize: 24,
    color: "#8E8E93",
  },
  activeIcon: {
    color: "#007AFF",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8E8E93",
  },
  activeTabLabel: {
    color: "#007AFF",
    fontWeight: "600",
  },
  darkText: {
    color: '#fff',
  },
});

export default BottomNav;
