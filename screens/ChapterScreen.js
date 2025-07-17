import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Alert } from 'react-native';
import TopNav from "./TopNav";

const screenWidth = Dimensions.get("window").width;

// Base URL for images (adjust for your environment)
const BASE_IMAGE_URL = "http://10.66.183.116:333/chapter/"; // Change to 10.0.2.2 for Android emulator, localhost for iOS simulator

export default function ChapterScreen({ route, navigation }) {
  const { mangaId, chapterNumber } = route.params;
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sizes, setSizes] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Reset state for new chapter
    setLoading(true);
    setError(null);
    setManga(null);
    setSizes({});

    axios
      .get(
        `http://10.66.183.116:333/api/chapter/manga/${mangaId}/chapter/${chapterNumber}`
      )
      .then(({ data }) => {
        if (!data.success || !data.data || !data.data.chapter) {
          throw new Error("Invalid API response");
        }

        const { chapter, hasPrev, hasNext } = data.data;

        if (!Array.isArray(chapter.image)) {
          throw new Error(
            "Invalid manga data: image is missing or not an array"
          );
        }

        console.log("API Response - manga.image:", chapter.image); // Debug log

        setManga({
          ...chapter,
          hasPrev,
          hasNext,
        });
      })
      .catch((err) => {
        console.error("API Error:", err.message);
        setError("Failed to load manga data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [mangaId, chapterNumber]);

  useEffect(() => {
    const fetchUserId = async () => {
      const userInfo = await AsyncStorage.getItem('userInfo');
      const user = userInfo ? JSON.parse(userInfo) : null;
      setUserId(user?._id || null);
    };
    fetchUserId();
  }, []);

  // Fetch image sizes
  useEffect(() => {
    if (manga) {
      manga.image.forEach((fileName, idx) => {
        const uri = `http://10.66.183.116:333/chapter/${fileName}`;
        Image.getSize(
          uri,
          (width, height) =>
            setSizes((prev) => ({ ...prev, [idx]: { width, height } })),
          (err) => console.warn("Failed to get image size", err)
        );
      });
    }
  }, [manga]);

  useEffect(() => {
    if (manga && manga._id) {
      axios.get(`http://10.66.183.116:333/api/comment/chapter/${manga._id}`)
        .then(res => setComments(res.data.comments || []));
    }
  }, [manga]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      if (!userId) {
        Alert.alert("Bạn cần đăng nhập để bình luận!");
        setSending(false);
        return;
      }
      const res = await axios.post(
        `http://10.66.183.116:333/api/comment/chapter/${manga._id}`,
        { userId, content: newComment }
      );
      if (res.data.success) {
        setComments([res.data.comment, ...comments]);
        setNewComment("");
      } else {
        Alert.alert("Gửi bình luận thất bại!");
      }
    } catch (err) {
      Alert.alert("Lỗi gửi bình luận!");
    }
    setSending(false);
  };

  const handleLikeComment = async (commentId) => {
    const userInfo = await AsyncStorage.getItem('userInfo');
    const user = userInfo ? JSON.parse(userInfo) : null;
    if (!user || !user._id) {
      Alert.alert("Bạn cần đăng nhập để like!");
      return;
    }
    try {
      const res = await axios.patch(
        `http://10.66.183.116:333/api/comment/like/${commentId}`,
        { userId: user._id }
      );
      if (res.data.success) {
        setComments(comments =>
          comments.map(c =>
            c._id === commentId
              ? { ...c, likes: res.data.liked
                  ? [...(c.likes || []), user._id]
                  : (c.likes || []).filter(id => id !== user._id)
                }
              : c
          )
        );
      }
    } catch (err) {
      Alert.alert("Lỗi like comment!");
    }
  };

  const handleReportComment = async (commentId) => {
    const userInfo = await AsyncStorage.getItem('userInfo');
    const user = userInfo ? JSON.parse(userInfo) : null;
    if (!user || !user._id) {
      Alert.alert("Bạn cần đăng nhập để báo cáo!");
      return;
    }
    Alert.alert(
      "Report Comment",
      "Bạn có chắc chắn muốn báo cáo bình luận này không?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Report", style: "destructive", onPress: async () => {
          try {
            await axios.post(`http://10.66.183.116:333/api/comment/report/${commentId}`, {
              userId: user._id,
              reason: "Inappropriate comment",
            });
            Alert.alert("Đã gửi báo cáo!");
          } catch (err) {
            Alert.alert("Lỗi gửi báo cáo!");
          }
        }}
      ]
    );
  };

  if (loading) return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <TopNav currentRoute="Chapter" mangaId={mangaId} />
      <ActivityIndicator style={styles.loader} size="large" color="#1976D2" />
    </View>
  );
  if (error || !manga?.image || !Array.isArray(manga.image))
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
        <TopNav currentRoute="Chapter" mangaId={mangaId} />
        <Text style={styles.error}>{error || "Manga chapter data is unavailable"}</Text>
      </View>
    );
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <TopNav currentRoute="Chapter" mangaId={mangaId} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Chapter {chapterNumber}</Text>
        {manga.image.map((fileName, idx) => {
          const dims = sizes[idx] || { width: 1, height: 1.5 };
          const imgHeight = (screenWidth * dims.height) / dims.width;
          const imageUri = fileName.startsWith("http") ? fileName : `${BASE_IMAGE_URL}${fileName}`;
          return (
            <Image
              key={idx}
              source={{ uri: imageUri }}
              style={[
                styles.chapterImage,
                { width: screenWidth, height: imgHeight },
              ]}
              resizeMode="contain"
              onError={(error) =>
                console.warn(
                  `Failed to load image ${idx}: ${imageUri}`,
                  error.nativeEvent
                )
              }
            />
          );
        })}

        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            disabled={!manga.hasPrev}
            onPress={() =>
              navigation.replace("Chapter", {
                mangaId,
                chapterNumber: chapterNumber - 1,
              })
            }
            accessibilityLabel="Go to next chapter"
          >
            <View
              style={[styles.button, !manga.hasPrev && styles.buttonDisabled]}
            >
              <Ionicons
                name="arrow-back-circle-outline"
                size={20}
                style={styles.buttonIcon}
                color={manga.hasPrev ? "#FFF" : "#444"}
              />
              <Text
                style={[
                  styles.buttonText,
                  { color: manga.hasPrev ? "FFF" : "#444" },
                ]}
              >
                Previous
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonWrapper}
            disabled={!manga.hasNext}
            onPress={() =>
              navigation.replace("Chapter", {
                mangaId,
                chapterNumber: chapterNumber + 1,
              })
            }
            accessibilityLabel="Go to next chapter"
          >
            <View
              style={[styles.button, !manga.hasNext && styles.buttonDisabled]}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: manga.hasNext ? "#FFF" : "#444" },
                ]}
              >
                Next
              </Text>
              <Ionicons
                name="arrow-forward-circle-outline"
                size={20}
                style={styles.buttonIcon}
                color={manga.hasNext ? "#FFF" : "#444"}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 12, backgroundColor: "#FFF", borderRadius: 12, paddingVertical: 32 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>Comments</Text>
          {comments.length > 0 ? (
            comments.map(item => (
              <View key={item._id} style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: "bold" }}>{item.user?.name || "User"}</Text>
                <Text>{item.content}</Text>
                <Text style={{ fontSize: 12, color: "#888" }}>{new Date(item.createdAt).toLocaleString()}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity onPress={() => handleLikeComment(item._id)}>
                    <Text style={{ fontSize: 18, color: item.likes?.includes(userId) ? "#1976D2" : "#888" }}>👍</Text>
                  </TouchableOpacity>
                  <Text style={{ marginLeft: 4 }}>{item.likes?.length || 0}</Text>
                  <TouchableOpacity onPress={() => handleReportComment(item._id)} style={{ marginLeft: 12 }}>
                    <Text style={{ color: "#E53935", fontWeight: "bold" }}>🚩</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ fontStyle: "italic", color: "#888" }}>No comments yet.</Text>
          )}
          <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                marginRight: 8,
              }}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              editable={!sending}
            />
            <TouchableOpacity
              onPress={handleSendComment}
              disabled={sending || !newComment.trim()}
              style={{
                backgroundColor: sending || !newComment.trim() ? "#ccc" : "#1976D2",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  scrollContent: {
    paddingVertical: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginVertical: 20,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#FFF", // luôn nền trắng
    color: "#FFF",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Android elevation
    elevation: 5,
  },
  buttonDisabled: {
    // Xóa backgroundColor: "#888"
    opacity: 0.5, // làm mờ nút khi disabled
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "MPLUSRounded1c_Regular",
    marginHorizontal: 8,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonIcon: {
    marginHorizontal: 4,
  },
  chapterImage: {
    width: screenWidth,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#000",
    resizeMode: "contain",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  footer: {
    height: 50,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  error: {
    color: "#FF4C4C",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
