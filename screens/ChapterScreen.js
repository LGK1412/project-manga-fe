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
  TextInput,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopNav from "./TopNav";
import { IP } from "../constants/config";
import * as SecureStore from "expo-secure-store";

const screenWidth = Dimensions.get("window").width;
const BASE_IMAGE_URL = `http://${IP}:333/chapter/`;

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
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [translating, setTranslating] = useState(false);
  const [forceReload, setForceReload] = useState("");
  useEffect(() => {
    setForceReload(Date.now());
  }, [manga]);

  // Load chapter data
  useEffect(() => {
    setLoading(true);
    setError(null);
    setManga(null);
    setSizes({});

    axios
      .get(
        `http://${IP}:333/api/chapter/manga/${mangaId}/chapter/${chapterNumber}`
      )
      .then(({ data }) => {
        if (!data.success || !data.data?.chapter) {
          throw new Error("Invalid API response");
        }
        const { chapter, hasPrev, hasNext } = data.data;
        const images = Array.isArray(chapter.image) ? chapter.image : [];
        setManga({ ...chapter, image: images, hasPrev, hasNext });
      })
      .catch((err) => {
        console.error("API Error:", err.message);
        setError("Failed to load manga data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [mangaId, chapterNumber]);

  // Get current user ID
  useEffect(() => {
    (async () => {
      const userInfo = await AsyncStorage.getItem("userInfo");
      const user = userInfo ? JSON.parse(userInfo) : null;
      setUserId(user?.userId || user?._id || null);
    })();
  }, []);

  // Preload image dimensions
  useEffect(() => {
    if (manga?.image?.length) {
      manga.image.forEach((fileName, idx) => {
        const uri = fileName.startsWith("http")
          ? fileName
          : `${BASE_IMAGE_URL}${fileName}?t=${Date.now()}`;
        Image.getSize(
          uri,
          (width, height) =>
            setSizes((prev) => ({ ...prev, [idx]: { width, height } })),
          (err) => console.warn("Failed to get image size", err)
        );
      });
    }
  }, [manga]);

  // Load comments
  useEffect(() => {
    if (manga?._id) {
      axios
        .get(`http://${IP}:333/api/comment/chapter/${manga._id}`)
        .then((res) => setComments(res.data.comments || []))
        .catch((err) => console.warn("Failed to load comments", err));
    }
  }, [manga]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    if (!userId) {
      Alert.alert("Bạn cần đăng nhập để bình luận!");
      setSending(false);
      return;
    }
    try {
      const res = await axios.post(
        `http://${IP}:333/api/comment/chapter/${manga._id}`,
        { userId, content: newComment }
      );
      if (res.data.success) {
        setComments([res.data.comment, ...comments]);
        setNewComment("");
      } else {
        Alert.alert("Gửi bình luận thất bại!");
      }
    } catch {
      Alert.alert("Lỗi gửi bình luận!");
    }
    setSending(false);
  };

  const handleLikeComment = async (commentId) => {
    const stored = await AsyncStorage.getItem("userInfo");
    const user = stored ? JSON.parse(stored) : null;
    if (!user?.userId) {
      Alert.alert("Bạn cần đăng nhập để like!");
      return;
    }
    const token = await SecureStore.getItemAsync("userToken");
    if (!token) {
      Alert.alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      const res = await axios.patch(
        `http://${IP}:333/api/comment/like/${commentId}`,
        { userId: user.userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? {
                  ...c,
                  reactions: res.data.liked
                    ? [
                        ...(c.reactions || []),
                        { userId: user.userId, type: "like" },
                      ]
                    : (c.reactions || []).filter(
                        (r) => !(r.userId === user.userId && r.type === "like")
                      ),
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error("LIKE COMMENT ERROR:", err?.response?.data || err.message);
      Alert.alert("Lỗi like comment!");
    }
  };

  const handleReportComment = async (commentId) => {
    const stored = await AsyncStorage.getItem("userInfo");
    const user = stored ? JSON.parse(stored) : null;
    if (!user?.userId) {
      Alert.alert("Bạn cần đăng nhập để báo cáo!");
      return;
    }
    const token = await SecureStore.getItemAsync("userToken");
    if (!token) {
      Alert.alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      const res = await axios.post(
        `http://${IP}:333/api/comment/report/${commentId}`,
        { userId: user.userId, reason: "Inappropriate comment" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert(
        res.data.success
          ? "Đã gửi báo cáo bình luận!"
          : res.data.message || "Lỗi gửi báo cáo!"
      );
    } catch {
      Alert.alert("Lỗi gửi báo cáo!");
    }
  };

  const handleTranslateContent = async () => {
    if (!selectedLanguage || !manga?.content) {
      Alert.alert("Please select a language and ensure content is available!");
      return;
    }
    setTranslating(true);
    try {
      const res = await axios.post(`http://${IP}:333/api/ai/translate`, {
        language: selectedLanguage,
        codeContext: manga.content,
      });
      if (res.data.translatedCode) {
        setManga((prev) => ({ ...prev, content: res.data.translatedCode }));
        Alert.alert("Translation successful!");
      } else {
        Alert.alert("Translation failed!");
      }
    } catch (err) {
      console.error("Translation Error:", err);
      Alert.alert("Error during translation!");
    }
    setTranslating(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopNav currentRoute="Chapter" mangaId={mangaId} />
        <ActivityIndicator style={styles.loader} size="large" color="#1976D2" />
      </View>
    );
  }

  if (error || !manga) {
    return (
      <View style={styles.container}>
        <TopNav currentRoute="Chapter" mangaId={mangaId} />
        <Text style={styles.error}>
          {error || "Manga chapter data is unavailable"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNav currentRoute="Chapter" mangaId={mangaId} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Chapter {chapterNumber}</Text>

        {manga.content && (
          <View style={styles.translationContainer}>
            <Picker
              selectedValue={selectedLanguage}
              onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
              style={styles.languagePicker}
            >
              <Picker.Item label="Select Language" value="" />
              <Picker.Item label="English" value="English" />
              <Picker.Item label="Spanish" value="Spanish" />
              <Picker.Item label="French" value="French" />
              <Picker.Item label="Japanese" value="Japanese" />
              <Picker.Item label="Vietnamese" value="Vietnamese" />
            </Picker>
            <TouchableOpacity
              onPress={handleTranslateContent}
              disabled={translating || !selectedLanguage}
              style={[
                styles.translateButton,
                (translating || !selectedLanguage) &&
                  styles.translateButtonDisabled,
              ]}
            >
              <Text style={styles.translateButtonText}>
                {translating ? "Translating..." : "Translate"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {manga.image.length > 0 ? (
          manga.image.map((fileName, idx) => {
            const dims = sizes[idx] || { width: 1, height: 1.5 };
            const imgHeight = (screenWidth * dims.height) / dims.width;
            const uri = fileName.startsWith("http")
              ? fileName
              : `${BASE_IMAGE_URL}${fileName}?t=${forceReload}`;
            return (
              <Image
                key={idx}
                source={{ uri }}
                style={[
                  styles.chapterImage,
                  { width: screenWidth, height: imgHeight },
                ]}
                resizeMode="contain"
                onError={(e) =>
                  console.warn(
                    `Failed to load image ${idx}: ${uri}`,
                    e.nativeEvent
                  )
                }
              />
            );
          })
        ) : (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>{manga.content}</Text>
          </View>
        )}

        <View style={styles.navContainer}>
          <TouchableOpacity
            style={[
              styles.buttonWrapper,
              !manga.hasPrev && styles.buttonDisabled,
            ]}
            disabled={!manga.hasPrev}
            onPress={() =>
              navigation.replace("Chapter", {
                mangaId,
                chapterNumber: chapterNumber - 1,
              })
            }
          >
            <View style={styles.button}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={20}
                color={manga.hasPrev ? "#FFF" : "#444"}
              />
              <Text style={styles.buttonText}>Previous</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.buttonWrapper,
              !manga.hasNext && styles.buttonDisabled,
            ]}
            disabled={!manga.hasNext}
            onPress={() =>
              navigation.replace("Chapter", {
                mangaId,
                chapterNumber: chapterNumber + 1,
              })
            }
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>Next</Text>
              <Ionicons
                name="arrow-forward-circle-outline"
                size={20}
                color={manga.hasNext ? "#FFF" : "#444"}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>Comments</Text>
          {comments.length > 0 ? (
            comments.map((item) => (
              <View key={item._id} style={styles.commentItem}>
                <Text style={styles.commentText}>{item.content}</Text>
                <Text style={styles.commentDate}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity onPress={() => handleLikeComment(item._id)}>
                    <Text
                      style={[
                        styles.likeIcon,
                        item.reactions?.some(
                          (r) => r.userId === userId && r.type === "like"
                        ) && styles.liked,
                      ]}
                    >
                      👍
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.likeCount}>
                    {item.reactions?.filter((r) => r.type === "like").length ||
                      0}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleReportComment(item._id)}
                    style={styles.reportButton}
                  >
                    <Text style={styles.reportText}>🚩</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>No comments yet.</Text>
          )}

          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              editable={!sending}
            />
            <TouchableOpacity
              onPress={handleSendComment}
              disabled={sending || !newComment.trim()}
              style={[
                styles.sendButton,
                (sending || !newComment.trim()) && styles.sendButtonDisabled,
              ]}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  scrollContent: { paddingVertical: 20 },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  chapterImage: {
    backgroundColor: "#000",
  },
  contentContainer: {
    padding: 16,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    marginVertical: 8,
  },
  contentText: { fontSize: 16, lineHeight: 24, color: "#333" },
  loader: { flex: 1, justifyContent: "center" },
  error: { color: "#FF4C4C", textAlign: "center", marginTop: 20, fontSize: 16 },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  buttonWrapper: { flex: 1, marginHorizontal: 6 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#1976D2",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, marginHorizontal: 8 },
  commentsSection: {
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 32,
  },
  commentsHeader: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  commentItem: { padding: 8, borderBottomWidth: 1, borderColor: "#eee" },
  commentText: { fontSize: 14 },
  commentDate: { fontSize: 12, color: "#888", marginTop: 4 },
  commentActions: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  likeIcon: { fontSize: 18, color: "#888" },
  liked: { color: "#1976D2" },
  likeCount: { marginLeft: 4 },
  reportButton: { marginLeft: 12 },
  reportText: { color: "#E53935", fontWeight: "bold" },
  noComments: { fontStyle: "italic", color: "#888" },
  commentInputRow: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendButtonDisabled: { backgroundColor: "#ccc" },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
  translationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  languagePicker: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginRight: 8,
  },
  translateButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  translateButtonDisabled: { backgroundColor: "#ccc" },
  translateButtonText: { color: "#fff", fontWeight: "bold" },
});
