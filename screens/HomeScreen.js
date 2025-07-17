import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { ThemeContext } from '../contexts/ThemeContext';
import { IP } from '../contexts/AuthContext'

export default function HomeScreen({ navigation }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to safely format ratings
  const formatRating = (ratings) => {
    if (!Array.isArray(ratings) || ratings.length === 0) {
      return "No ratings";
    }
    const total = ratings.reduce(
      (sum, r) => sum + (typeof r === "number" ? r : 0),
      0
    );
    const avg = total / ratings.length;
    return `${avg.toFixed(1)}`;
  };

  // Helper to safely format genres
  const formatGenres = (genres) => {
    if (!Array.isArray(genres) || genres.length === 0) {
      return "Unknown Genre";
    }

    return genres
      .map((g) => {
        // if it’s already a string, use it; otherwise grab .name
        return typeof g === "string" ? g : g?.name;
      })
      .filter((name) => typeof name === "string" && name.trim().length > 0)
      .join(" • ");
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://${IP}:333/api/manga`)
      .then(({ data }) => {
        if (!data.success) {
          throw new Error(data.message || "Unknown error from API");
        }

        setTrending(data.trending);
        setCategories(data.categories);
        setMangaList(data.mangas);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load manga data. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} showsVerticalScrollIndicator={false}>
      {/* Trending Titles — horizontal scroll */}
      <Text style={[styles.header, isDarkMode && styles.darkText]}>Trending Manga</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {trending.map((item) => (
          <TouchableOpacity
            key={item._id}
            onPress={() => navigation.navigate("Detail", { id: item._id })}
            style={styles.trendingItem}
          >
            <Image
              source={{
                uri: item.coverImage || "https://via.placeholder.com/150x200",
              }}
              style={styles.mangaCover}
            />
            <View style={styles.mangaOverlay}>
              <View style={styles.mangaRating}>
                <Text style={styles.mangaRatingText}>
                  ⭐ {formatRating(item.rating)}
                </Text>
              </View>
              <View style={styles.mangaBookmark}>
                <Text style={styles.mangaBookmarkText}>🔖</Text>
              </View>
            </View>
            <View style={styles.mangaInfo}>
              <Text
                style={styles.mangaTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
              <Text style={styles.mangaGenres}>
                {formatGenres(item.categories)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Categories — wrapped row layout */}
      <Text style={styles.header}>Categories</Text>
      <View style={styles.categoryContainer}>
        {Array.isArray(categories) ? (
          categories.map((genre) => (
            <TouchableOpacity
              key={genre._id}
              onPress={() =>
                navigation.navigate("Category", { Categories: genre._id })
              }
              style={styles.categoryButton}
            >
              <Text style={styles.categoryText}>
                {genre.name || "Unknown Category"}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No categories available</Text>
        )}
      </View>

      {/* All Manga — standard vertical list */}
      <Text style={styles.header}>All Manga</Text>
      <View>
        {mangaList.map((item) => (
          <TouchableOpacity
            key={item._id}
            onPress={() => navigation.navigate("Detail", { id: item._id })}
            style={styles.listItemContainer}
          >
            <Image
              source={{
                uri: item.coverImage || "https://via.placeholder.com/150x200",
              }}
              style={styles.mangaCover}
            />
            <View style={styles.mangaOverlay}>
              <View style={styles.mangaRating}>
                <Text style={styles.mangaRatingText}>
                  ⭐ {formatRating(item.rating)}
                </Text>
              </View>
              <View style={styles.mangaBookmark}>
                <Text style={styles.mangaBookmarkText}>🔖</Text>
              </View>
            </View>
            <View style={styles.mangaInfo}>
              <Text
                style={styles.mangaTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
              <Text style={styles.mangaGenres}>
                {formatGenres(item.categories)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  darkContainer: {
    backgroundColor: "#222",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#212121",
    marginVertical: 16,
    marginLeft: 8,
  },
  darkText: {
    color: '#fff',
  },
  trendingItem: {
    backgroundColor: "#6200EA",
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 120,
    alignItems: "center",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  categoryButton: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    margin: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 16,
    color: "#424242",
    fontWeight: "500",
  },
  mangaCover: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: "cover",
  },
  mangaOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mangaRating: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mangaRatingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  mangaBookmark: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 4,
    borderRadius: 8,
  },
  mangaBookmarkText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  mangaInfo: {
    padding: 12,
  },
  mangaTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  mangaGenres: {
    fontSize: 14,
    color: "#757575",
    flexWrap: "wrap",
  },
  footer: {
    height: 100,
  },
});
