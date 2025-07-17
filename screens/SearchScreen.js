import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { IP } from "../constants/config"

export default function SearchScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [mangaList, setMangaList] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("name_asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    axios
      .get(`http://${IP}:333/api/manga`)
      .then(({ data }) => {
        setCategories(data.categories || []);
        setMangaList(data.mangas || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load manga data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Re-apply filter+sort whenever dependencies change
  const applyFilters = useCallback(() => {
    let filtered = mangaList;

    // — Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(q));
    }

    // — Category filters
    if (selectedCategories.length) {
      filtered = filtered.filter((item) =>
        selectedCategories.every((cat) =>
          item.categories.some((c) => c.name === cat)
        )
      );
    }

    // — Sorting
    filtered = [...filtered];
    switch (sortOption) {
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating_high":
        filtered.sort((a, b) => getAvg(b.rating) - getAvg(a.rating));
        break;
      case "rating_low":
        filtered.sort((a, b) => getAvg(a.rating) - getAvg(b.rating));
        break;
    }

    setDisplayList(filtered);
  }, [mangaList, searchQuery, selectedCategories, sortOption]);

  // Whenever the list, filters, or sort changes, re-run
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Helpers
  const getAvg = (ratings) => {
    if (!Array.isArray(ratings) || ratings.length === 0) return 0;
    const sum = ratings.reduce(
      (s, r) => s + (typeof r === "number" ? r : 0),
      0
    );
    return sum / ratings.length;
  };
  const formatRating = (ratings) => {
    const avg = getAvg(ratings);
    return ratings.length ? avg.toFixed(1) : "N/A";
  };
  const formatGenres = (genres) => {
    if (!Array.isArray(genres) || !genres.length) return "Unknown";
    return genres
      .map((g) => (typeof g === "string" ? g : g?.name))
      .filter((n) => n)
      .join(" • ");
  };

  // UI handlers
  const onCategoryPress = (name) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };
  const clearCategories = () => setSelectedCategories([]);

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  if (error)
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={displayList}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        // 1) Everything above the list goes here:
        ListHeaderComponent={
          <>
            {/* Search */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search manga by title..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />

            {/* Categories */}
            <View style={styles.categoryHeader}>
              <Text style={styles.header}>Categories</Text>
              {selectedCategories.length > 0 && (
                <TouchableOpacity onPress={clearCategories}>
                  <Text style={styles.clearButton}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={[
                    styles.categoryButton,
                    selectedCategories.includes(cat.name) &&
                      styles.categoryButtonSelected,
                  ]}
                  onPress={() => onCategoryPress(cat.name)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategories.includes(cat.name) &&
                        styles.categoryTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort */}
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={sortOption}
                  style={styles.picker}
                  onValueChange={setSortOption}
                  dropdownIconColor="#333" // Android arrow color
                >
                  <Picker.Item label="Name A → Z" value="name_asc" />
                  <Picker.Item label="Name Z → A" value="name_desc" />
                  <Picker.Item label="Rating High → Low" value="rating_high" />
                  <Picker.Item label="Rating Low → High" value="rating_low" />
                </Picker>
              </View>
            </View>

            {/* Section Title */}
            <Text style={[styles.header, { marginTop: 16 }]}>All Manga</Text>
          </>
        }
        // 2) How each manga card renders:
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Detail", { id: item._id })}
          >
            <Image source={{ uri: item.coverImage }} style={styles.cover} />
            <View style={styles.overlay}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  ⭐ {formatRating(item.rating)}
                </Text>
              </View>
              <View style={styles.bookmark}>
                <Text style={styles.bookmarkText}>🔖</Text>
              </View>
            </View>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.genres}>{formatGenres(item.categories)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  loader: { flex: 1, justifyContent: "center" },
  error: { color: "red", textAlign: "center", marginTop: 20 },

  // Headers
  header: { fontSize: 22, fontWeight: "bold" },
  clearButton: { fontSize: 16, color: "#007AFF" },

  // Search
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  // Categories
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 8,
  },
  categoryButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },

  // Sort dropdown
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  sortLabel: { fontSize: 16, marginRight: 8 },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: 40,
    width: "100%",
  },

  // Manga card
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 8,
    overflow: "hidden",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android elevation
    elevation: 3,
  },
  cover: {
    width: 100,
    height: 150,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 6,
  },
  ratingBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
  },
  bookmark: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  bookmarkText: {
    color: "#fff",
    fontSize: 14,
  },
  info: {
    flex: 1,
    padding: 8,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  genres: {
    fontSize: 14,
    color: "#666",
  },

  // Fallback / empty
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  noResults: { fontSize: 16, color: "#777" },
});
