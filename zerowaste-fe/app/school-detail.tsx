import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
} from "react-native";
import { Text } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/ui/header";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSchool, deleteSchool } from "@/store/slices/schoolSlice";
import { fetchSchoolDetail } from "@/lib/school";
import { getRole } from "@/lib/auth-storage";
import ClassesSection from "@/components/schools/classes";

export default function SchoolDetailScreen() {
  const { schoolId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.schools);
  const [schoolDetail, setSchoolDetail] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    school_name: "",
    address: "",
    jml_murid: "",
    jml_kelas: "",
  });

  const fetchSchoolDetailData = async () => {
    try {
      if (!schoolId) {
        console.error("School ID is required");
        return;
      }

      const school = await fetchSchoolDetail(schoolId as string);
      console.log("School detail response:", school);
      setSchoolDetail(school);
      setEditData({
        school_name: school.school_name || "",
        address: school.address || "",
        jml_murid: school.jml_murid?.toString() || "",
        jml_kelas: school.jml_kelas?.toString() || "",
      });
    } catch (error) {
      console.error("Failed to fetch school detail:", error);
    }
  };

  const handleSave = async () => {
    if (
      !editData.school_name.trim() ||
      !editData.address.trim() ||
      !editData.jml_murid.trim() ||
      !editData.jml_kelas.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const schoolData = {
        school_name: editData.school_name,
        address: editData.address,
        jml_murid: parseInt(editData.jml_murid) || 0,
        jml_kelas: parseInt(editData.jml_kelas) || 0,
      };

      const result = await dispatch(
        updateSchool({ schoolId: schoolId as string, schoolData })
      ).unwrap();
      console.log("School updated successfully:", result);
      setSchoolDetail(result);
      router.back();
    } catch (error) {
      console.error("Failed to update school:", error);
      alert("Failed to update school");
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete School",
      "Are you sure you want to delete this school? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteSchool(schoolId as string)).unwrap();
              console.log("School deleted successfully");
              router.back();
            } catch (error) {
              console.error("Failed to delete school:", error);
              alert("Failed to delete school");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchSchoolDetailData();
    getRole().then((role) => {
      console.log("Role:", role);
      setRole(role);
    });
  }, [schoolId]);

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <Header title="School Details" icon="school" />

      <View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>School Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            {role !== "admin" ? (
              <Text style={styles.value}>{editData.school_name}</Text>
            ) : (
              <TextInput
                style={styles.input}
                value={editData.school_name}
                onChangeText={(text) =>
                  setEditData({ ...editData, school_name: text })
                }
                placeholder="Enter school name"
              />
            )}
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Address:</Text>
            {role !== "admin" ? (
              <Text style={styles.value}>{editData.address}</Text>
            ) : (
              <TextInput
                style={styles.input}
                value={editData.address}
                onChangeText={(text) =>
                  setEditData({ ...editData, address: text })
                }
                placeholder="Enter address"
                multiline
              />
            )}
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Number of Students:</Text>
            {role !== "admin" ? (
              <Text style={styles.value}>{editData.jml_murid}</Text>
            ) : (
              <TextInput
                style={styles.input}
                value={editData.jml_murid}
                onChangeText={(text) =>
                  setEditData({ ...editData, jml_murid: text })
                }
                placeholder="Enter number of students"
                keyboardType="numeric"
              />
            )}
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Number of Classes:</Text>
            {role !== "admin" ? (
              <Text style={styles.value}>{editData.jml_kelas}</Text>
            ) : (
              <TextInput
                style={styles.input}
                value={editData.jml_kelas}
                onChangeText={(text) =>
                  setEditData({ ...editData, jml_kelas: text })
                }
                placeholder="Enter number of classes"
                keyboardType="numeric"
              />
            )}
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Created At:</Text>
            <Text style={styles.value}>
              {schoolDetail?.created_at
                ? new Date(schoolDetail.created_at).toLocaleString()
                : "-"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Updated At:</Text>
            <Text style={styles.value}>
              {schoolDetail?.updatedAt
                ? new Date(schoolDetail.updatedAt).toLocaleString()
                : "-"}
            </Text>
          </View>

          {role === "admin" && (
            <View style={styles.sectionButtons}>
              <Pressable
                style={[styles.button, { backgroundColor: "#EF4444" }]}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  { backgroundColor: "#10B981" },
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
        <ClassesSection schoolId={schoolId as string} classCount={editData.jml_kelas as string} />
      </View>
    </ScrollView>
  );
}

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
    alignItems: "center",
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
});
