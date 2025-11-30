import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Text,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { fetchAllSPPG, SPPG } from "@/lib/sppg";
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";

const SELECTED_SPPG_KEY = "selected_sppg_id";

export default function SppgSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [sppgs, setSppgs] = useState<SPPG[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const currentSppgId = params.sppgId as string | undefined;

  const filteredSppgs = useMemo(() => {
    if (!searchQuery.trim()) return sppgs;
    const query = searchQuery.toLowerCase().trim();
    return sppgs.filter(
      (sppg) =>
        sppg.name.toLowerCase().includes(query) ||
        sppg.address.toLowerCase().includes(query)
    );
  }, [sppgs, searchQuery]);

  useEffect(() => {
    loadSppgs();
  }, []);

  const loadSppgs = async () => {
    try {
      setLoading(true);
      setError(null);
      const sppgsList = await fetchAllSPPG();
      setSppgs(sppgsList);
    } catch (err: any) {
      console.error("Failed to fetch sppgs:", err);
      setError(err.message || "Failed to load sppgs");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSppg = async (sppg: SPPG) => {
    // Save to secure store so RegisterForm can pick it up on focus
    await SecureStore.setItemAsync(SELECTED_SPPG_KEY, sppg._id);
    router.back();
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading SPPGs...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search"
                size={20}
                color="#6B7280"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search SPPG..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </Pressable>
              )}
            </View>
          </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredSppgs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No SPPG found</Text>
              </View>
            ) : (
              filteredSppgs.map((sppg) => (
                <Pressable
                  key={sppg._id}
                  onPress={() => handleSelectSppg(sppg)}
                  style={({ pressed }) => [
                    styles.sppgItem,
                    pressed && styles.sppgItemPressed,
                    currentSppgId === sppg._id && styles.sppgItemSelected,
                  ]}
                >
                  <View style={styles.sppgInfo}>
                    <Text style={styles.sppgName}>{sppg.name}</Text>
                    <Text style={styles.sppgAddress}>{sppg.address}</Text>
                  </View>
                  {currentSppgId === sppg._id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10B981"
                    />
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
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#6B7280" },
  errorText: { fontSize: 14, color: "#EF4444", textAlign: "center" },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#111827", padding: 0 },
  clearButton: { marginLeft: 8, padding: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 18, paddingTop: 0 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  sppgItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sppgItemPressed: { backgroundColor: "#F9FAFB" },
  sppgItemSelected: {
    borderColor: "#10B981",
    borderWidth: 2,
    backgroundColor: "#F0FDF4",
  },
  sppgInfo: { flex: 1 },
  sppgName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  sppgAddress: { fontSize: 14, color: "#6B7280" },
});
