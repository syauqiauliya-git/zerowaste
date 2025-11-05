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
import { School } from "@/lib/school";

type SchoolSettingsProps = {
  schools: School[];
  loading: boolean;
  onRefresh: () => void;
};

export default function SchoolSettings({
  schools,
  loading,
  onRefresh,
}: SchoolSettingsProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSchoolPress = (schoolId: string) => {
    console.log("Navigating to school detail with ID:", schoolId);
    router.push({
      pathname: "/school-detail",
      params: {
        schoolId: schoolId,
      },
    });
  };

  const filteredSchools = schools.filter((school) => {
    const query = searchQuery.toLowerCase();
    return (
      school.school_name.toLowerCase().includes(query) ||
      school.address.toLowerCase().includes(query)
    );
  });

  const renderSchoolItem = ({ item }: { item: School }) => {
    return (
      <Pressable
        style={styles.schoolItem}
        onPress={() => handleSchoolPress(item._id)}
      >
        <Text style={{ fontWeight: "bold" }}>{item.school_name}</Text>
        <View>
          <Text style={{ fontWeight: "thin", fontSize: 12 }}>
            {item.address}
          </Text>
          <Text style={{ fontWeight: "thin", fontSize: 12 }}>
            {item.jml_murid}
          </Text>
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
            placeholder="Search schools..."
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
          style={styles.addSchoolButton}
          onPress={() => router.push("/school-create")}
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
        <View style={styles.schoolContainer}>
          {filteredSchools.length === 0 ? (
            <View key="no-schools" style={styles.schoolItem}>
              <Text>No schools found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSchools}
              renderItem={renderSchoolItem}
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
    marginTop: 16,
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
  addSchoolButton: {
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
  schoolContainer: {
    overflow: "hidden",
  },
  schoolItem: {
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
});

