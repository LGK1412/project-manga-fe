import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import axios from "axios";
import { IP } from "../constants/config"

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2; // two columns with 16px padding and 16px between

export default function CategoryScreen({ route, navigation }) {
  const { Categories } = route.params; // Category ID
  const [manga, setManga] = useState([]);
  const [categoryName, setCategoryName] = useState(Categories); // Default to ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://${IP}:333/api/category/${Categories}`)
      .then(({ data }) => {
        if (data.success && Array.isArray(data.mangas)) {
          setManga(data.mangas);
          // Extract category name from first manga's categories
          if (
            data.mangas.length > 0 &&
            Array.isArray(data.mangas[0].categories)
          ) {
            const matchingCategory = data.mangas[0].categories.find(
              (cat) => cat._id === Categories
            );
            if (matchingCategory) {
              setCategoryName(matchingCategory.name);
            }
          }
        } else {
          setError("No manga found for this category.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load manga data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [Categories]);

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
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Detail", { id: item._id })}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: item.coverImage || "https://via.placeholder.com/150x200",
        }}
        style={styles.cover}
      />
      <View style={styles.overlay} />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text style={styles.categories} numberOfLines={1} ellipsizeMode="tail">
          {formatGenres(item.categories)}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.rating}>⭐ {formatRating(item.rating)}</Text>
          <Text style={styles.bookmark}>🔖</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!manga.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>No manga found for "{Categories}".</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{categoryName}</Text>
      <FlatList
        data={manga}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1C1C1E",
  },
  listContent: {
    paddingBottom: 16,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: ITEM_WIDTH,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  cover: {
    width: "100%",
    height: ITEM_WIDTH * 1.3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  infoContainer: {
    padding: 8,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFB300",
  },
  bookmark: {
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 16,
  },
});
