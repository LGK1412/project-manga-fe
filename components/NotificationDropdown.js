import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { IP } from "../constants/config";
import * as SecureStore from "expo-secure-store";

export default function NotificationDropdown({
  visible,
  notifications,
  onClose,
  setNotifications,
}) {
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = await SecureStore.getItemAsync("userToken");
     
      try {
        const res = await axios.get(`http://${IP}:333/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.data.success) {
          setNotifications(res.data.notifications); // hoặc res.data.data tùy theo BE trả về
        }
      } catch (error) {
        console.error("Fetch notifications error:", error.message);
      }
    };

    if (visible) {
      fetchNotifications();
    }
  }, [visible]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
     
      const res = await axios.patch(
        `http://${IP}:333/api/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error("Mark as read error:", error.message);
    }
  };

  const handleDeleteNotification = async (id) => {
  try {
    const token = await SecureStore.getItemAsync("userToken");

    const res = await axios.delete(`http://${IP}:333/api/notifications/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data.success) {
      // Xóa thông báo khỏi danh sách hiển thị
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    }
  } catch (error) {
    console.error("Delete notification error:", error.message);
  }
};


  return (
    <Modal visible={visible} transparent animationType="fade">
  <TouchableOpacity
    style={styles.overlay}
    onPress={onClose}
    activeOpacity={1}
  >
    <View style={styles.dropdown}>
      <Text style={styles.header}>Thông báo</Text>
      {notifications.length === 0 ? (
        <Text style={styles.empty}>Không có thông báo</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.notificationItem,
                !item.isRead && styles.unread,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => handleMarkAsRead(item._id)}
              >
                <Text
                  style={{
                    fontWeight: item.isRead ? "normal" : "bold",
                    color: "#333",
                  }}
                >
                  {item.sender?.name + " " + item.content}
                </Text>
                <Text style={styles.timeText}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteNotification(item._id)}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="trash-outline" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  </TouchableOpacity>
</Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  dropdown: {
    width: 300,
    maxHeight: 400,
    marginTop: 60,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  header: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
  },
  notificationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  unread: {
    backgroundColor: "#f0f8ff",
  },
  timeText: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});
