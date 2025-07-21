// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   Pressable,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { useContext } from "react";
// import { ThemeContext } from "../contexts/ThemeContext";
// import { Ionicons } from "@expo/vector-icons";
// import { IP } from "../constants/config";
// import * as SecureStore from "expo-secure-store";

// export default function TopNav({ currentRoute, mangaId }) {
//   const navigation = useNavigation();
//   const isDetailScreen = currentRoute === "Detail";
//   const isChapterScreen = currentRoute === "Chapter";
//   const { isDarkMode } = useContext(ThemeContext);

//   // State cho favourite
//   const [isFavourite, setIsFavourite] = React.useState(false);
//   const [userId, setUserId] = React.useState(null);
//   const [token, setToken] = React.useState(null);
//   // State cho follow author
//   const [isFollow, setIsFollow] = React.useState(false);
//   const [authorId, setAuthorId] = React.useState(null);
//   // State cho menu
//   const [menuVisible, setMenuVisible] = React.useState(false);

//   // Luôn kiểm tra favourite khi mangaId thay đổi, không phân biệt màn hình
//   React.useEffect(() => {
//     const fetchUserInfo = async () => {
//       const userInfo = await AsyncStorage.getItem("userInfo");
//       if (userInfo && mangaId) {
//         const user = JSON.parse(userInfo);
//         setUserId(user._id);
//         setToken(user.token);
//         setIsFavourite(user.favourites?.includes(mangaId));
//       }
//     };
//     if (mangaId) fetchUserInfo();
//   }, [mangaId]);

//   // Luôn kiểm tra trạng thái follow khi mangaId thay đổi
//   React.useEffect(() => {
//     const fetchFollowStatus = async () => {
//       const userInfo = await AsyncStorage.getItem("userInfo");
//       if (userInfo && mangaId) {
//         const user = JSON.parse(userInfo);
//         try {
//           const res = await axios.get(`http://${IP}:333/api/manga/${mangaId}`);
//           const manga = Array.isArray(res.data?.data?.manga)
//             ? res.data.data.manga[0]
//             : null;
//           if (manga && manga.author) {
//             setAuthorId(manga.author);
//             setIsFollow(
//               user.followAuthors?.map(id => String(id)).includes(String(manga.author))
//             );
//           }
//         } catch (err) {}
//       }
//     };
//     if (mangaId) fetchFollowStatus();
//   }, [mangaId]);

//   // Hàm toggle favourite
//   const handleToggleFavourite = async () => {
//     try {
//       const userInfo = await AsyncStorage.getItem("userInfo");
//       const user = userInfo ? JSON.parse(userInfo) : null;
//       // console.log("User Info:", userInfo); // Debug

//       if (!user.userId) {
//         alert("Bạn cần đăng nhập để sử dụng tính năng này");
//         return;
//       }

//       // Giả sử loginToken là token JWT, sử dụng trực tiếp nếu có
//       const token = await SecureStore.getItemAsync("userToken");
      
//       const response = await axios.patch(
//         `http://${IP}:333/api/user/${user.userId}/favourites`,
//         { mangaId: mangaId },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.data.success) {
//         setIsFavourite(response.data.favourites.includes(mangaId));
//         user.favourites = response.data.favourites;
//         await AsyncStorage.setItem("userInfo", JSON.stringify(user));
//       } else {
//         alert(response.data.message || "Không thể cập nhật favourite!");
//       }
//     } catch (err) {
//       console.error("Lỗi khi cập nhật favourite:", err.message);
//       alert("Không thể kết nối đến server. Vui lòng thử lại!");
//     }
//   };

//   // Hàm toggle follow author
//   const handleToggleFollow = async () => {
//   try {
//     const userInfo = await AsyncStorage.getItem("userInfo");
//     const user = userInfo ? JSON.parse(userInfo) : null;

//     if (!user.userId) {
//       alert("Bạn cần đăng nhập để sử dụng tính năng này");
//       return;
//     }
//     console.log("userId:", userId);
//     console.log("authorId:", authorId);

//     const token = await SecureStore.getItemAsync("userToken");
//     if (!token) {
//       alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");
//       return;
//     }

//     const res = await axios.patch(
//       `http://${IP}:333/api/user/${user.userId}/follow-author`,
//       { authorId: authorId },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (res.data.success) {
//       setIsFollow(res.data.followAuthors.includes(authorId));
//       user.followAuthors = res.data.followAuthors;
//       await AsyncStorage.setItem("userInfo", JSON.stringify(user));
//     } else {
//       alert(res.data.message || "Không thể cập nhật follow!");
//     }
//   } catch (err) {
//     console.error("Lỗi khi follow author:", err.message);
//     alert("Không thể kết nối đến server. Vui lòng thử lại!");
//   } finally {
//     setMenuVisible(false);
//   }
// };


//   const handleReportStory = async () => {
//     const userInfo = await AsyncStorage.getItem("userInfo");
//     const user = userInfo ? JSON.parse(userInfo) : null;
//     if (!user || !user.userId) {
//       alert("Bạn cần đăng nhập để báo cáo!");
//       return;
//     }
//     const token = await SecureStore.getItemAsync("userToken");
//     if (!token) {
//       alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");
//       return;
//     }
//     try {
//       const res = await axios.post(
//         `http://${IP}:333/api/manga/report/${mangaId}`,
//         {
//           userId: user.userId,
//           reason: "Inappropriate content", // Có thể cho nhập lý do sau
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       if (res.data.success) {
//         alert("Đã gửi báo cáo!");
//       } else {
//         alert(res.data.message || "Lỗi gửi báo cáo!");
//       }
//     } catch (err) {
//       alert("Lỗi gửi báo cáo!");
//     }
//   };

//   return (
//     <View style={[styles.container, isDarkMode && styles.darkContainer]}>
//       {/* Back Arrow - absolute left */}
//       {(isDetailScreen || isChapterScreen) && (
//         <TouchableOpacity
//           onPress={() => {
//             if (isChapterScreen) {
//               navigation.navigate("Detail", { id: mangaId });
//             } else if (isDetailScreen) {
//               navigation.navigate("Home");
//             }
//           }}
//           style={{
//             position: "absolute",
//             left: 8,
//             zIndex: 2,
//             height: 40,
//             width: 40,
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <Ionicons
//             name="arrow-back"
//             size={28}
//             color={isDarkMode ? "#fff" : "#222"}
//           />
//         </TouchableOpacity>
//       )}

//       {/* Title - always centered */}
//       <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//         <Text style={[styles.title, isDarkMode && styles.darkText]}>
//           MangaRead
//         </Text>
//       </View>

//       {/* Right icons - absolute right */}
//       {(isDetailScreen || isChapterScreen) && (
//         <View
//           style={{
//             position: "absolute",
//             right: 8,
//             flexDirection: "row",
//             alignItems: "center",
//             height: 40,
//             zIndex: 2,
//           }}
//         >
//           <TouchableOpacity
//   style={styles.rightButton}
//   onPress={handleToggleFavourite}
// >
//   <Text
//     style={[
//       styles.icon,
//       {
//         color: isFavourite
//           ? "#E53935"
//           : isDarkMode
//           ? "#fff"
//           : "#8E8E93",
//       },
//     ]}
//   >
//     {isFavourite ? "❤️" : "♡"}
//   </Text>
// </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.rightButton}
//             onPress={() => setMenuVisible(true)}
//           >
//             <Text style={[styles.icon, isDarkMode && styles.darkText]}>⋮</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       {/* Modal menu giữ nguyên logic cũ */}
//       {(isDetailScreen || isChapterScreen) && (
//         <Modal
//           visible={menuVisible}
//           transparent
//           animationType="fade"
//           onRequestClose={() => setMenuVisible(false)}
//         >
//           <Pressable
//             style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
//             onPress={() => setMenuVisible(false)}
//           >
//             <View
//               style={{
//                 position: "absolute",
//                 top: 50,
//                 right: 16,
//                 backgroundColor: isDarkMode ? "#333" : "#fff",
//                 borderRadius: 8,
//                 padding: 12,
//                 elevation: 8,
//               }}
//             >
//               <TouchableOpacity
//                 onPress={handleToggleFollow}
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   paddingVertical: 8,
//                 }}
//               >
//                 <Text
//                   style={{
//                     fontSize: 20,
//                     color: isFollow
//                       ? "#1976D2"
//                       : isDarkMode
//                       ? "#fff"
//                       : "#8E8E93",
//                     marginRight: 8,
//                   }}
//                 >
//                   {isFollow ? "👤" : "👥"}
//                 </Text>
//                 <Text
//                   style={{
//                     color: isFollow ? "#1976D2" : isDarkMode ? "#fff" : "#222",
//                     fontWeight: "600",
//                   }}
//                 >
//                   {isFollow ? "Unfollow Author" : "Follow Author"}
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handleReportStory}
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   paddingVertical: 8,
//                 }}
//               >
//                 <Text
//                   style={{ fontSize: 20, color: "#E53935", marginRight: 8 }}
//                 >
//                   🚩
//                 </Text>
//                 <Text style={{ color: "#E53935", fontWeight: "600" }}>
//                   Report Stories
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </Pressable>
//         </Modal>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#FFFFFF",
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E5EA",
//     height: 60,
//   },
//   darkContainer: {
//     backgroundColor: "#222",
//     borderBottomColor: "#444",
//   },
//   leftContainer: {
//     width: 40,
//     alignItems: "flex-start",
//     justifyContent: "center",
//   },
//   centerContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   title: {
//     textAlign: "center",
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#1C1C1E",
//   },
//   rightContainer: {
//     minWidth: 60,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-end",
//   },
//   rightButton: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 8,
//   },
//   icon: {
//     fontSize: 24,
//     color: "#1C1C1E",
//   },
//   darkText: {
//     color: "#fff",
//   },
// });

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { IP } from "../constants/config";
import * as SecureStore from "expo-secure-store";

export default function TopNav({ currentRoute, mangaId }) {
  const navigation = useNavigation();
  const isDetailScreen = currentRoute === "Detail";
  const isChapterScreen = currentRoute === "Chapter";
  const { isDarkMode } = useContext(ThemeContext);

  const [isFavourite, setIsFavourite] = React.useState(false);
  const [userId, setUserId] = React.useState(null);
  const [token, setToken] = React.useState(null);
  const [isFollow, setIsFollow] = React.useState(false);
  const [authorId, setAuthorId] = React.useState(null);
  const [menuVisible, setMenuVisible] = React.useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await AsyncStorage.getItem("userInfo");
      if (userInfo && mangaId) {
        const user = JSON.parse(userInfo);
        setUserId(user._id);
        setToken(user.token);
        setIsFavourite(user.favourites?.includes(mangaId));
      }
    };
    if (mangaId) fetchUserInfo();
  }, [mangaId]);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      const userInfo = await AsyncStorage.getItem("userInfo");
      if (userInfo && mangaId) {
        const user = JSON.parse(userInfo);
        try {
          const res = await axios.get(`http://${IP}:333/api/manga/${mangaId}`);
          const manga = Array.isArray(res.data?.data?.manga)
            ? res.data.data.manga[0]
            : null;
          if (manga && manga.author) {
            setAuthorId(manga.author);
            setIsFollow(
              user.followAuthors
                ?.map((id) => String(id))
                .includes(String(manga.author))
            );
          }
        } catch (err) {}
      }
    };
    if (mangaId) fetchFollowStatus();
  }, [mangaId]);

  const handleToggleFavourite = async () => {
    try {
      const userInfo = await AsyncStorage.getItem("userInfo");
      const user = userInfo ? JSON.parse(userInfo) : null;

      if (!user.userId) {
        alert("Bạn cần đăng nhập để sử dụng tính năng này");
        return;
      }

      const token = await SecureStore.getItemAsync("userToken");

      const response = await axios.patch(
        `http://${IP}:333/api/user/${user.userId}/favourites`,
        { mangaId: mangaId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsFavourite(response.data.favourites.includes(mangaId));
        user.favourites = response.data.favourites;
        await AsyncStorage.setItem("userInfo", JSON.stringify(user));
      } else {
        alert(response.data.message || "Không thể cập nhật favourite!");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật favourite:", err.message);
      alert("Không thể kết nối đến server. Vui lòng thử lại!");
    }
  };

  const handleToggleFollow = async () => {
    try {
      const userInfo = await AsyncStorage.getItem("userInfo");
      const user = userInfo ? JSON.parse(userInfo) : null;

      if (!user.userId) {
        alert("Bạn cần đăng nhập để sử dụng tính năng này");
        return;
      }

      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");
        return;
      }

      const res = await axios.patch(
        `http://${IP}:333/api/user/${user.userId}/follow-author`,
        { authorId: authorId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setIsFollow(res.data.followAuthors.includes(authorId));
        user.followAuthors = res.data.followAuthors;
        await AsyncStorage.setItem("userInfo", JSON.stringify(user));
      } else {
        alert(res.data.message || "Không thể cập nhật follow!");
      }
    } catch (err) {
      console.error("Lỗi khi follow author:", err.message);
      alert("Không thể kết nối đến server. Vui lòng thử lại!");
    } finally {
      setMenuVisible(false);
    }
  };

  const handleReportStory = async () => {
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
        `http://${IP}:333/api/manga/report/${mangaId}`,
        {
          userId: user.userId,
          reason: "Inappropriate content",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        alert("Đã gửi báo cáo!");
      } else {
        alert(res.data.message || "Lỗi gửi báo cáo!");
      }
    } catch (err) {
      alert("Lỗi gửi báo cáo!");
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
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
          <Ionicons
            name="arrow-back"
            size={28}
            color={isDarkMode ? "#fff" : "#222"}
          />
        </TouchableOpacity>
      )}

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          MangaRead
        </Text>
      </View>

      {(isDetailScreen || isChapterScreen) && (
        <View
          style={{
            position: "absolute",
            right: 8,
            flexDirection: "row",
            alignItems: "center",
            height: 40,
            zIndex: 2,
          }}
        >
          <TouchableOpacity
            style={styles.rightButton}
            onPress={handleToggleFavourite}
          >
            <Text
              style={[
                styles.icon,
                {
                  color: isFavourite
                    ? "#E53935"
                    : isDarkMode
                    ? "#fff"
                    : "#8E8E93",
                },
              ]}
            >
              {isFavourite ? "❤️" : "♡"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rightButton}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={[styles.icon, isDarkMode && styles.darkText]}>⋮</Text>
          </TouchableOpacity>
        </View>
      )}

      {(isDetailScreen || isChapterScreen) && (
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
            onPress={() => setMenuVisible(false)}
          >
            <View
              style={{
                position: "absolute",
                top: 50,
                right: 16,
                backgroundColor: isDarkMode ? "#333" : "#fff",
                borderRadius: 8,
                padding: 12,
                elevation: 8,
              }}
            >
              <TouchableOpacity
                onPress={handleToggleFollow}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: isFollow
                      ? "#1976D2"
                      : isDarkMode
                      ? "#fff"
                      : "#8E8E93",
                    marginRight: 8,
                  }}
                >
                  {isFollow ? "👤" : "👥"}
                </Text>
                <Text
                  style={{
                    color: isFollow ? "#1976D2" : isDarkMode ? "#fff" : "#222",
                    fontWeight: "600",
                  }}
                >
                  {isFollow ? "Unfollow Author" : "Follow Author"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReportStory}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{ fontSize: 20, color: "#E53935", marginRight: 8 }}
                >
                  🚩
                </Text>
                <Text style={{ color: "#E53935", fontWeight: "600" }}>
                  Report Stories
                </Text>
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
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
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
    color: "#fff",
  },
});

