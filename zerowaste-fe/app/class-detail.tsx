import { Class, fetchClassDetail } from "@/lib/class";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteClass, updateClass } from "@/store/slices/classSlice";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

function ClassDetail() {
  const { classId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.classes);
  const role = useAppSelector((state) => state.auth.role?.toLowerCase() || null);
  const [classDetail, setClassDetail] = useState<Class | null>(null);
  const [editData, setEditData] = useState({
    class_name: "",
    grade_level: "",
  });

  const fetchClassDetailData = async () => {
    try {
      const classData = await fetchClassDetail(classId as string);
      console.log("Class detail response:", classData);
      setClassDetail(classData.data);
      setEditData({
        class_name: classData.data.class_name || "",
        grade_level: classData.data.grade_level || "",
      });
    } catch (error) {
      console.error("Failed to fetch class detail:", error);
    }
  };

  const handleSave = async () => {
    if (!editData.class_name.trim() || !editData.grade_level.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const classData = {
        class_name: editData.class_name,
        grade_level: editData.grade_level,
      };

      const result = await dispatch(
        updateClass({ classId: classId as string, classData })
      ).unwrap();
      console.log("Class updated successfully:", result);
      setClassDetail(result);
      router.back();
    } catch (error) {
      console.error("Failed to update class:", error);
      alert("Failed to update class");
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Class",
      "Are you sure you want to delete this class? This action cannot be undone.",
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
              await dispatch(deleteClass(classId as string)).unwrap();
              console.log("Class deleted successfully");
              router.back();
            } catch (error) {
              console.error("Failed to delete class:", error);
              alert("Failed to delete class");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchClassDetailData();
  }, [classId]);

  return (
    <View style={styles.scrollView}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Class Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Class name:</Text>
          {role !== "admin" ? (
            <Text style={styles.value}>{editData.class_name}</Text>
          ) : (
            <TextInput
              style={styles.input}
              value={editData.class_name}
              onChangeText={(text) =>
                setEditData({ ...editData, class_name: text })
              }
              placeholder="Enter class name"
            />
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Grade Level:</Text>
          {role !== "admin" ? (
            <Text style={styles.value}>{editData.grade_level}</Text>
          ) : (
            <TextInput
              style={styles.input}
              value={editData.grade_level}
              onChangeText={(text) =>
                setEditData({ ...editData, grade_level: text })
              }
              placeholder="Enter grade level"
              multiline
            />
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Created At:</Text>
          <Text style={styles.value}>
            {classDetail?.createdAt
              ? new Date(classDetail.createdAt).toLocaleString()
              : "-"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Updated At:</Text>
          <Text style={styles.value}>
            {classDetail?.updatedAt
              ? new Date(classDetail.updatedAt).toLocaleString()
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
    </View>
  );
}

export default ClassDetail;

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
