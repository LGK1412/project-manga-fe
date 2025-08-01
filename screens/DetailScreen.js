import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopNav from "./TopNav";
import { IP } from "../constants/config";
import * as SecureStore from "expo-secure-store";

export default function DetailScreen({ route, navigation, setCurrentMangaId }) {
  const BASE_IMAGE_URL = `http://${IP}:333/thumbnails/`;
  const { id } = route.params;

  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState(null);

  // Helpers unchanged…
  const formatRating = (ratings) => {
    if (!Array.isArray(ratings) || ratings.length === 0) return "No ratings";
    const total = ratings.reduce(
      (sum, r) => sum + (typeof r === "number" ? r : 0),
      0
    );
    const count = ratings.length;
    return `${(total / count).toFixed(1)} (${count} vote${
      count > 1 ? "s" : ""
    })`;
  };
  const formatGenres = (genres) => {
    if (!Array.isArray(genres) || genres.length === 0) return "Unknown Genre";
    return genres
      .map((g) => (typeof g === "string" ? g : g?.name))
      .filter((n) => n && n.trim())
      .join(" • ");
  };

  // Thêm 2 hàm helper để lấy số trung bình và số vote
  const getAverage = (ratings) => {
    if (!Array.isArray(ratings) || ratings.length === 0) return "0.0";
    // Hỗ trợ cả mảng số và mảng object
    const total = ratings.reduce(
      (sum, r) => sum + (typeof r === "number" ? r : r.value || 0),
      0
    );
    return (total / ratings.length).toFixed(1);
  };
  const getVoteCount = (ratings) =>
    Array.isArray(ratings) ? ratings.length : 0;

  const handleOpenRatingModal = () => setShowRatingModal(true);
  const handleCloseRatingModal = () => setShowRatingModal(false);
  const handleRate = async (value) => {
    setSelectedRating(value);
    setShowRatingModal(false);
    try {
      const userInfo = await AsyncStorage.getItem("userInfo");
      const user = userInfo ? JSON.parse(userInfo) : null;
      if (!user?.userId) {
        alert("Bạn cần đăng nhập để đánh giá!");
        return;
      }
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");
        return;
      }
      // Gửi rate lên backend
      const res = await axios.post(
        `http://${IP}:333/api/manga/${id}/rate`,
        { userId: user.userId, value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        // Cập nhật lại manga với rating mới
        setManga((prev) => ({
          ...prev,
          rating: [
            // Loại bỏ rating cũ của user này (nếu có), thêm rating mới
            ...(prev.rating?.filter(
              (r) => r.userId && r.userId !== user.userId
            ) || []),
            { userId: user.userId, value },
          ],
        }));
        // Hoặc fetch lại manga từ backend nếu muốn chắc chắn
      } else {
        alert(res.data.message || "Không thể đánh giá!");
      }
    } catch (err) {
      alert("Lỗi khi gửi đánh giá!");
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);

    try {
      const userInfo = await AsyncStorage.getItem("userInfo");
      const user = userInfo ? JSON.parse(userInfo) : null;

      // DEBUG: Log giá trị trước khi gửi
      console.log("DEBUG COMMENT:", {
        mangaId: manga._id,
        serId: user?.userId,
        userIdAlt: user?._id,
        content: newComment,
      });

      if (!user?.userId && !user?._id) {
        alert("Bạn cần đăng nhập để bình luận!");
        setSending(false);
        return;
      }

      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");
        setSending(false);
        return;
      }

      const res = await axios.post(
        `http://${IP}:333/api/comment/manga/${manga._id}`,
        {
          mangaId: manga._id, // Đảm bảo dùng _id
          userId: user.userId || user._id, // Thử cả hai trường
          content: newComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success && res.data.comment) {
        setComments([res.data.comment, ...comments]);
        setNewComment("");
      } else {
        alert(res.data.message || "Gửi bình luận thất bại!");
      }
    } catch (err) {
      console.error("Comment error:", err?.response?.data || err.message);
      alert("Lỗi gửi bình luận!");
    }

    setSending(false);
  };

  const handleLikeComment = async (commentId) => {
    const userInfo = await AsyncStorage.getItem("userInfo");
    const user = userInfo ? JSON.parse(userInfo) : null;
    if (!user || !user.userId) {
      alert("Bạn cần đăng nhập để like!");
      return;
    }
    const token = await SecureStore.getItemAsync("userToken");
    if (!token) {
      alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      // DEBUG: Log giá trị userId và commentId
      console.log("LIKE DEBUG:", { userId: user.userId, commentId });
      const res = await axios.patch(
        `http://${IP}:333/api/comment/like/${commentId}`,
        { userId: user.userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setComments((comments) =>
          comments.map((c) =>
            c._id === commentId
              ? {
                  ...c,
                  reactions: c.reactions
                    ? res.data.liked
                      ? [...c.reactions, { userId: user.userId, type: "like" }]
                      : c.reactions.filter(
                          (r) =>
                            !(r.userId === user.userId && r.type === "like")
                        )
                    : res.data.liked
                    ? [{ userId: user.userId, type: "like" }]
                    : [],
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error("LIKE COMMENT ERROR:", err?.response?.data || err.message);
      alert("Lỗi like comment!");
    }
  };

  const handleReportComment = async (commentId) => {
    const userInfo = await AsyncStorage.getItem("userInfo");
    const user = userInfo ? JSON.parse(userInfo) : null;
    if (!user || !user.userId) {
      alert("Bạn cần đăng nhập để báo cáo!");
      return;
    }
    const token = await SecureStore.getItemAsync("userToken");
    if (!token) {
      alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      const res = await axios.post(
        `http://${IP}:333/api/comment/report/${commentId}`,
        {
          userId: user.userId,
          reason: "Inappropriate comment", // Có thể cho nhập lý do sau
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        alert("Đã gửi báo cáo bình luận!");
      } else {
        alert(res.data.message || "Lỗi gửi báo cáo!");
      }
    } catch (err) {
      alert("Lỗi gửi báo cáo!");
    }
  };
  const imageUri = manga?.image
  ? manga.image.startsWith("http")
    ? manga.image
    : `${BASE_IMAGE_URL}${manga.image}?t=${Date.now()}`
  : null;


  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`http://${IP}:333/api/manga/${id}`)
      .then((resp) => {
        const { success, data } = resp.data;

        if (!success) {
          throw new Error(resp.data.message || "Failed to load manga data");
        }

        // data.manga is an array; grab first element or null
        const fetched = Array.isArray(data.manga) ? data.manga[0] : null;
        if (!fetched) {
          throw new Error("Manga not found");
        }
        setManga(fetched);
        if (setCurrentMangaId) setCurrentMangaId(fetched._id);

        // Normalize chapters/comments into arrays (or empty)
        setChapters(Array.isArray(data.chapters) ? data.chapters : []);
        setComments(Array.isArray(data.comments) ? data.comments : []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => {
      if (setCurrentMangaId) setCurrentMangaId(null);
    };
  }, [id]);

  useEffect(() => {
    const fetchUserId = async () => {
      const userInfo = await AsyncStorage.getItem("userInfo");
      const user = userInfo ? JSON.parse(userInfo) : null;
      setUserId(user?._id || null);
    };
    fetchUserId();
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
        <TopNav currentRoute="Detail" mangaId={id} />
        <ActivityIndicator style={styles.loader} size="large" />
      </View>
    );
  if (error)
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
        <TopNav currentRoute="Detail" mangaId={id} />
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  if (!manga)
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
        <TopNav currentRoute="Detail" mangaId={id} />
        <Text style={styles.error}>Manga not found</Text>
      </View>
    );

  console.log(comments.length);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <TopNav currentRoute="Detail" mangaId={id} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Manga Details</Text>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.coverImage} />
        )}

        <Text style={styles.title}>{manga.name}</Text>
        <Text style={styles.description}>
          {manga.description || "No description available"}
        </Text>

        <Text style={styles.info}>Status: {manga.status}</Text>
        <Text style={styles.info}>
          Genres: {formatGenres(manga.categories)}
        </Text>
        <TouchableOpacity
          onPress={handleOpenRatingModal}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 4,
          }}
        >
          <Text style={styles.info}>Rating: {getAverage(manga.rating)} </Text>
          <Text style={{ fontSize: 18, color: "#FFD700" }}>⭐</Text>
          <Text style={styles.info}> ({getVoteCount(manga.rating)} votes)</Text>
        </TouchableOpacity>

        <Text style={[styles.info, styles.section]}>Chapters:</Text>
        {chapters.length > 0 ? (
          chapters.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.chapterItem}
              onPress={() =>
                navigation.navigate("Chapter", {
                  mangaId: manga._id,
                  chapterId: item._id,
                  chapterNumber: item.chapterNumber,
                })
              }
            >
              <Text style={styles.chapterText}>
                Chapter {item.chapterNumber}: {item.name}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No chapters available.</Text>
        )}

        <Text style={[styles.info, styles.section]}>Comments:</Text>
        {comments.length > 0 ? (
          comments.map((item) => (
            <View key={item._id} style={styles.commentItem}>
              <Text style={styles.commentContent}>{item.content}</Text>
              <Text style={styles.commentDate}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={() => handleLikeComment(item._id)}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: item.reactions
                        ?.filter((r) => r.type === "like")
                        .some((r) => r.userId === userId)
                        ? "#1976D2"
                        : "#888",
                    }}
                  >
                    👍
                  </Text>
                </TouchableOpacity>
                <Text style={{ marginLeft: 4 }}>
                  {item.reactions?.filter((r) => r.type === "like").length || 0}
                </Text>
                <TouchableOpacity
                  onPress={() => handleReportComment(item._id)}
                  style={{ marginLeft: 12 }}
                >
                  <Text style={{ color: "#E53935", fontWeight: "bold" }}>
                    🚩
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No comments yet.</Text>
        )}
        {/* Thêm UI nhập comment dưới phần comments */}
        <View
          style={{ flexDirection: "row", marginTop: 12, alignItems: "center" }}
        >
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
              backgroundColor:
                sending || !newComment.trim() ? "#ccc" : "#1976D2",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {showRatingModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Rate this manga
            </Text>
            <View style={{ flexDirection: "row", marginVertical: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRate(star)}>
                  <Text
                    style={{
                      fontSize: 32,
                      color:
                        selectedRating && selectedRating >= star
                          ? "#FFD700"
                          : "#ccc",
                    }}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={handleCloseRatingModal}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: "blue" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center" },
  scrollContent: { paddingBottom: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginVertical: 8 },
  title: { fontSize: 20, fontWeight: "600", marginVertical: 8 },
  description: { fontSize: 16, color: "#555", marginBottom: 12 },
  coverImage: { width: "100%", height: 200, marginBottom: 12 },
  info: { fontSize: 16, marginVertical: 4 },
  section: { marginTop: 16, fontWeight: "600" },
  chapterItem: { padding: 8, borderBottomWidth: 1, borderColor: "#ddd" },
  chapterText: { fontSize: 16 },
  commentItem: { padding: 8, borderBottomWidth: 1, borderColor: "#eee" },
  commentContent: { fontSize: 14 },
  commentDate: { fontSize: 12, color: "#888", marginTop: 4 },

  // new “empty” placeholder text
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
    paddingVertical: 8,
    textAlign: "center",
  },

  error: { color: "red", textAlign: "center", marginTop: 20 },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    elevation: 5,
  },
});
