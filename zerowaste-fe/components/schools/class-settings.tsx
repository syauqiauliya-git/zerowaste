import { useState, useEffect } from "react";
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
  Modal,
  TouchableOpacity,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Class } from "@/lib/class";
import { School, fetchSchools } from "@/lib/school";

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
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("all");
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [tempSchoolId, setTempSchoolId] = useState<string>("all");

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const schoolsData = await fetchSchools();
      setSchools(schoolsData);
    } catch (error) {
      console.error("Failed to load schools:", error);
    }
  };

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

    // Filter by selected school
    const matchesSchool = selectedSchoolId === "all"
      ? true
      : (typeof classItem.school_id === "object"
          ? classItem.school_id._id === selectedSchoolId
          : classItem.school_id === selectedSchoolId);

    // Filter by search query
    const matchesSearch =
      classItem.class_name.toLowerCase().includes(query) ||
      classItem.grade_level.toLowerCase().includes(query) ||
      schoolName.toLowerCase().includes(query);

    return matchesSchool && matchesSearch;
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
      {/* School Filter Dropdown */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.schoolPickerButton}
          onPress={() => {
            setTempSchoolId(selectedSchoolId);
            setShowSchoolPicker(true);
          }}
        >
          <Text style={styles.schoolPickerButtonText}>
            {selectedSchoolId === "all"
              ? "All Schools"
              : schools.find((s) => s._id === selectedSchoolId)?.school_name || "Select School"}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
        </TouchableOpacity>
      </View>

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

      {/* School Picker Modal */}
      <Modal
        visible={showSchoolPicker}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSchoolPicker(false)}
      >
        <View style={styles.pickerModalBackdrop}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select School</Text>
              <TouchableOpacity onPress={() => setShowSchoolPicker(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={[{ _id: "all", school_name: "All Schools" } as School, ...schools]}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    tempSchoolId === item._id && styles.pickerItemSelected,
                  ]}
                  onPress={() => setTempSchoolId(item._id)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      tempSchoolId === item._id && styles.pickerItemTextSelected,
                    ]}
                  >
                    {item.school_name}
                  </Text>
                  {tempSchoolId === item._id && (
                    <MaterialIcons name="check-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.pickerList}
            />
            <View style={styles.pickerModalButtons}>
              <TouchableOpacity
                style={[styles.pickerButton, styles.pickerCancelButton]}
                onPress={() => setShowSchoolPicker(false)}
              >
                <Text style={styles.pickerCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerButton, styles.pickerOkButton]}
                onPress={() => {
                  setSelectedSchoolId(tempSchoolId);
                  setShowSchoolPicker(false);
                }}
              >
                <Text style={styles.pickerOkButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  filterContainer: {
    marginBottom: 16,
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  schoolPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  schoolPickerButtonText: {
    fontSize: 15,
    color: "#374151",
  },
  pickerModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  pickerModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  pickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  pickerItemSelected: {
    backgroundColor: "#F0FDF4",
    borderColor: "#10B981",
  },
  pickerItemText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
  pickerItemTextSelected: {
    color: "#10B981",
    fontWeight: "600",
  },
  pickerModalButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  pickerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  pickerCancelButton: {
    backgroundColor: "#f3f4f6",
  },
  pickerCancelButtonText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 15,
  },
  pickerOkButton: {
    backgroundColor: "#10B981",
  },
  pickerOkButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});

