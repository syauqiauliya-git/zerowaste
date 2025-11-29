import { useState } from "react";
import { useRouter } from "expo-router";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SPPG } from "@/lib/sppg";

type SPPGSettingsProps = Readonly<{
  sppgList: SPPG[];
  loading: boolean;
  onRefresh: () => void;
}>;

export default function SPPGSettings({
  sppgList,
  loading,
  onRefresh,
}: SPPGSettingsProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSPPGPress = (sppgId: string) => {
    console.log("Navigating to SPPG detail with ID:", sppgId);
    router.push({
      pathname: "/sppg-detail",
      params: {
        sppgId: sppgId,
      },
    });
  };

  const filteredSPPG = (sppgList || []).filter((sppg) => {
    const query = searchQuery.toLowerCase();
    return (
      sppg.name.toLowerCase().includes(query) ||
      sppg.address?.toLowerCase().includes(query)
    );
  });

  const renderSPPGItem = ({ item }: { item: SPPG }) => {
    return (
      <Pressable
        style={styles.sppgItem}
        onPress={() => handleSPPGPress(item._id)}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>
          {item.name}
        </Text>
        <View style={styles.sppgItemContent}>
          <View style={styles.sppgItemContentItem}>
            <Text style={{ fontWeight: "bold", fontSize: 12 }}>Address</Text>
            <Text style={{ fontWeight: "thin", fontSize: 12 }}>
              {item.address || "N/A"}
            </Text>
          </View>
          <View style={styles.sppgItemContentItem}>
            <Text style={{ fontWeight: "bold", fontSize: 12 }}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                item.is_active ? styles.activeStatus : styles.inactiveStatus,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.is_active ? styles.activeText : styles.inactiveText,
                ]}
              >
                {item.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.content}>
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search SPPG..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={20} color="#6b7280" />
            </Pressable>
          )}
        </View>
        <Pressable
          style={styles.addSPPGButton}
          onPress={() => router.push("/sppg-create")}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scrollViewContent}
        contentContainerStyle={styles.scrollViewContentContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        <View style={styles.sppgContainer}>
          {filteredSPPG.length === 0 ? (
            <View key="no-sppg" style={styles.sppgItem}>
              <Text>No SPPG found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSPPG}
              renderItem={renderSPPGItem}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 0,
    paddingTop: 16,
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    padding: 0,
  },
  addSPPGButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 10,
    width: 40,
    height: 40,
  },
  scrollViewContent: {
    flex: 1,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
  },
  sppgContainer: {
    overflow: "hidden",
  },
  sppgItem: {
    borderBottomWidth: 1,
    borderRadius: 10,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 10,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  sppgItemContent: {
    flexDirection: "row",
    gap: 22,
  },
  sppgItemContentItem: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  activeStatus: {
    backgroundColor: "#D1FAE5",
  },
  inactiveStatus: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  activeText: {
    color: "#065F46",
  },
  inactiveText: {
    color: "#991B1B",
  },
});
