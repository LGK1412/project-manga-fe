import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function TopNav({ currentRoute, mangaId }) {
  const navigation = useNavigation();
  const isDetailScreen = currentRoute === "Detail";
  const isChapterScreen = currentRoute === "Chapter";
  const { isDarkMode } = useContext(ThemeContext);

  // State cho favourite
  const [isFavourite, setIsFavourite] = React.useState(false);
  const [userId, setUserId] = React.useState(null);
  const [token, setToken] = React.useState(null);
  // State cho follow author
  const [isFollow, setIsFollow] = React.useState(false);
  const [authorId, setAuthorId] = React.useState(null);
  // State cho menu
  const [menuVisible, setMenuVisible] = React.useState(false);

  // Lấy thông tin user và trạng thái favourite/follow khi vào DetailScreen
  React.useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo && mangaId) {
        const user = JSON.parse(userInfo);
        setUserId(user._id);
        setToken(user.token);
        setIsFavourite(user.favourites?.includes(mangaId));
      }
    };
    if (isDetailScreen && mangaId) fetchUserInfo();
  }, [mangaId, isDetailScreen]);

  // Lấy authorId từ API manga detail
  React.useEffect(() => {
    const fetchAuthorId = async () => {
      if (isDetailScreen && mangaId) {
        try {
          const res = await axios.get(`http://192.168.1.169:333/api/manga/${mangaId}`);
          const manga = Array.isArray(res.data?.data?.manga) ? res.data.data.manga[0] : null;
          if (manga && manga.author) {
            setAuthorId(manga.author);
            // Kiểm tra trạng thái follow
            const userInfo = await AsyncStorage.getItem('userInfo');
            if (userInfo) {
              const user = JSON.parse(userInfo);
              setIsFollow(user.folowAuthors?.includes(manga.author));
            }
          }
        } catch (err) {}
      }
    };
    fetchAuthorId();
  }, [mangaId, isDetailScreen]);

  // Hàm toggle favourite
  const handleToggleFavourite = async () => {
    if (!userId || !token || !mangaId) return;
    try {
      const res = await axios.patch(
        `http://192.168.1.169:333/api/user/${userId}/favourites`,
        { mangaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setIsFavourite((prev) => !prev);
        // Cập nhật lại userInfo trong AsyncStorage
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          user.favourites = res.data.favourites;
          await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        }
      }
    } catch (err) {}
  };

  // Hàm toggle follow author
  const handleToggleFollow = async () => {
    if (!userId || !token || !authorId) return;
    try {
      const res = await axios.patch(
        `http://192.168.1.169:333/api/user/${userId}/follow-author`,
        { authorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setIsFollow((prev) => !prev);
        // Cập nhật lại userInfo trong AsyncStorage
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          user.folowAuthors = res.data.folowAuthors;
          await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        }
      }
    } catch (err) {}
    setMenuVisible(false);
  };

  const handleReportStory = async () => {
    setMenuVisible(false);
    const userInfo = await AsyncStorage.getItem('userInfo');
    const user = userInfo ? JSON.parse(userInfo) : null;
    if (!user || !user._id) {
      Alert.alert('Bạn cần đăng nhập để báo cáo!');
      return;
    }
    Alert.alert(
      'Report Stories',
      'Bạn có chắc chắn muốn báo cáo truyện này không?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: async () => {
          try {
            await axios.post(`http://192.168.1.169:333/api/manga/report/${mangaId}`, {
              userId: user._id,
              reason: 'Inappropriate content', // Có thể cho nhập lý do sau
            });
            Alert.alert('Đã gửi báo cáo!');
          } catch (err) {
            Alert.alert('Lỗi gửi báo cáo!');
          }
        } }
      ]
    );
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Back Arrow - absolute left */}
      {(isDetailScreen || isChapterScreen) && (
        <TouchableOpacity
          onPress={() => {
            if (isChapterScreen) {
              navigation.navigate("Detail", { id: mangaId });
            } else if (isDetailScreen) {
              navigation.navigate("Home");
            }
          }}
          style={{
            position: "absolute",
            left: 8,
            zIndex: 2,
            height: 40,
            width: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
      )}

      {/* Title - always centered */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>MangaRead</Text>
      </View>

      {/* Right icons - absolute right */}
      {(isDetailScreen || isChapterScreen) && (
        <View style={{
          position: "absolute",
          right: 8,
          flexDirection: "row",
          alignItems: "center",
          height: 40,
          zIndex: 2,
        }}>
          <TouchableOpacity style={styles.rightButton} onPress={handleToggleFavourite}>
            <Text style={[styles.icon, { color: isFavourite ? '#E53935' : (isDarkMode ? '#fff' : '#8E8E93') }]}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rightButton} onPress={() => setMenuVisible(true)}>
            <Text style={[styles.icon, isDarkMode && styles.darkText]}>⋮</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Modal menu giữ nguyên logic cũ */}
      {isDetailScreen && (
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={() => setMenuVisible(false)}>
            <View style={{ position: 'absolute', top: 50, right: 16, backgroundColor: isDarkMode ? '#333' : '#fff', borderRadius: 8, padding: 12, elevation: 8 }}>
              <TouchableOpacity onPress={handleToggleFollow} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ fontSize: 20, color: isFollow ? '#1976D2' : (isDarkMode ? '#fff' : '#8E8E93'), marginRight: 8 }}>👤</Text>
                <Text style={{ color: isFollow ? '#1976D2' : (isDarkMode ? '#fff' : '#222'), fontWeight: '600' }}>{isFollow ? 'Unfollow Author' : 'Follow Author'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReportStory} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ fontSize: 20, color: '#E53935', marginRight: 8 }}>🚩</Text>
                <Text style={{ color: '#E53935', fontWeight: '600' }}>Report Stories</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    height: 60,
  },
  darkContainer: {
    backgroundColor: "#222",
    borderBottomColor: "#444",
  },
  leftContainer: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  rightContainer: {
    minWidth: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  rightButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  icon: {
    fontSize: 24,
    color: "#1C1C1E",
  },
  darkText: {
    color: '#fff',
  },
});
