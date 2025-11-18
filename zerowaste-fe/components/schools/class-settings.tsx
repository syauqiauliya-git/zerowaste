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
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Class } from "@/lib/class";

type ClassSettingsProps = {
  classes: Class[];
  loading: boolean;
  onRefresh: () => void;
};

export default function ClassSettings({
  classes,
  loading,
  onRefresh,
}: ClassSettingsProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleClassPress = (classId: string) => {
    console.log("Navigating to class detail with ID:", classId);
    router.push({
      pathname: "/class-detail",
      params: {
        classId: classId,
      },
    });
  };

  const filteredClasses = classes.filter((classItem) => {
    const query = searchQuery.toLowerCase();
    const schoolName =
      typeof classItem.school_id === "object"
        ? classItem.school_id.school_name
        : "";
    return (
      classItem.class_name.toLowerCase().includes(query) ||
      classItem.grade_level.toLowerCase().includes(query) ||
      schoolName.toLowerCase().includes(query)
    );
  });

  const renderClassItem = ({ item }: { item: Class }) => {

    return (
      <Pressable
        style={styles.classItem}
        onPress={() => handleClassPress(item._id)}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>{item.class_name}-{item.grade_level}</Text>
        <View style={styles.classItemContent}>
        <View style={styles.classItemContentItem}>
            <Text style={{ fontWeight: "bold", fontSize: 12 }}>School</Text>
            <Text style={{ fontWeight: "thin", fontSize: 12 }}>
              {item.school_id.school_name}
            </Text>
          </View>
          <View style={styles.classItemContentItem}>
            <Text style={{ fontWeight: "bold", fontSize: 12 }}>Grade</Text>
            <Text style={{ fontWeight: "thin", fontSize: 12 }}>
              {item.grade_level}
            </Text>
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
            placeholder="Search classes..."
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
      </View>
      <ScrollView
        style={styles.scrollViewContent}
        contentContainerStyle={styles.scrollViewContentContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        <View style={styles.classContainer}>
          {filteredClasses.length === 0 ? (
            <View key="no-classes" style={styles.classItem}>
              <Text>No classes found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredClasses}
              renderItem={renderClassItem}
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
  addClassButton: {
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
  classContainer: {
    overflow: "hidden",
  },
  classItem: {
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
  classItemContent: {
    flexDirection: "row",
    gap: 22,
  },
  classItemContentItem: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
});

