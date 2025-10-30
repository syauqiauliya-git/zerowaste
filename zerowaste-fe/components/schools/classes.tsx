import { Class } from "@/lib/class";
import { getRole } from "@/lib/auth-storage";
import { fetchClassesBySchoolId } from "@/store/slices/classSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

function ClassesSection({ schoolId, classCount }: { schoolId: string; classCount: string }) {
  const [role, setRole] = useState<string | null>(null);
  const { classes, loading } = useAppSelector((state) => state.classes);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleAddClass = () => {
    router.push({ pathname: "/class-create", params: { schoolId: schoolId } });
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

  useEffect(() => {
    dispatch(fetchClassesBySchoolId(schoolId));
    getRole().then((role) => {
      setRole(role);
    });
  }, [dispatch, schoolId]);

  const renderClassItem = ({ item }: { item: Class }) => {
    return (
      <Pressable
        style={styles.classItem}
        onPress={() => handleClassPress(item._id)}
      >
        <Text style={{ fontWeight: "bold" }}>{item.class_name}</Text>
        <Text style={{ fontWeight: "thin", fontSize: 12 }}>
          {item.grade_level}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.classHeader}>
        <Text style={styles.sectionTitle}>Classes</Text>
        {(role === "admin" && classes.length < Number(classCount)) && (
          <Pressable onPress={handleAddClass}>
            <MaterialIcons name="add" size={24} color="#10B981" />
          </Pressable>
        )}
      </View>

      <View style={styles.classContainer}>
        {classes.length === 0 ? (
          <View key="no-classs">
            <Text>No classes found</Text>
          </View>
        ) : (
          <FlatList
            data={classes}
            renderItem={renderClassItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  );
}

export default ClassesSection;

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#059669",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  label: {
    width: 80,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 8,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    minWidth: 120,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  sectionButtons: {
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  button: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  classHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  classContainer: {
    overflow: "hidden",
    backgroundColor: "white",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  classItem: {
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: "column",
    justifyContent: "space-between",
  },
});
