import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator, Text, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { fetchSchools, School } from "@/lib/school";
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";

const SELECTED_SCHOOL_KEY = "selected_school_id";

export default function SchoolSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const currentSchoolId = params.schoolId as string | undefined;

  // Filter schools based on search query
  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) {
      return schools;
    }
    const query = searchQuery.toLowerCase().trim();
    return schools.filter(
      (school) =>
        school.school_name.toLowerCase().includes(query) ||
        school.address.toLowerCase().includes(query)
    );
  }, [schools, searchQuery]);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const schoolsList = await fetchSchools();
      setSchools(schoolsList);
    } catch (err: any) {
      console.error("Failed to fetch schools:", err);
      setError(err.message || "Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSchool = async (school: School) => {
    // Store the selected school ID in SecureStore
    await SecureStore.setItemAsync(SELECTED_SCHOOL_KEY, school._id);
    // Navigate back to the analytics screen
    router.back();
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading schools...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : schools.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No schools available</Text>
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search schools..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </Pressable>
              )}
            </View>
          </View>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {filteredSchools.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="school-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No schools found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            ) : (
              filteredSchools.map((school) => (
                <Pressable
                  key={school._id}
                  onPress={() => handleSelectSchool(school)}
                  style={({ pressed }) => [
                    styles.schoolItem,
                    pressed && styles.schoolItemPressed,
                    currentSchoolId === school._id && styles.schoolItemSelected,
                  ]}
                >
                  <View style={styles.schoolInfo}>
                    <Text style={styles.schoolName}>{school.school_name}</Text>
                    <Text style={styles.schoolAddress}>{school.address}</Text>
                  </View>
                  {currentSchoolId === school._id && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                </Pressable>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },
  searchContainer: {
    padding: 18,
    paddingBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  schoolItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  schoolItemPressed: {
    backgroundColor: "#F9FAFB",
  },
  schoolItemSelected: {
    borderColor: "#10B981",
    borderWidth: 2,
    backgroundColor: "#F0FDF4",
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 14,
    color: "#6B7280",
  },
});

