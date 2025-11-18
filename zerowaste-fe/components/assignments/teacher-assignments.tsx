import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Pressable,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  getAllTeacherAssignments,
  createTeacherAssignment,
  updateTeacherAssignment,
  deleteTeacherAssignment,
  TeacherClassAssignment,
} from "@/lib/assignments";
import { fetchApprovedTeachers, Teacher } from "@/lib/admin";
import { fetchClasses, Class } from "@/lib/class";

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<TeacherClassAssignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    teacher_id: "",
    class_id: "",
    is_active: true,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTeacherPicker, setShowTeacherPicker] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [tempTeacherId, setTempTeacherId] = useState("");
  const [tempClassId, setTempClassId] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [assignmentsRes, teachersRes, classesRes] = await Promise.all([
        getAllTeacherAssignments(),
        fetchApprovedTeachers(),
        fetchClasses(),
      ]);
      setAssignments(assignmentsRes.data.assignments);
      setTeachers(teachersRes.data.teachers);
      setClasses(classesRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
      setErrorMessage("Failed to load assignments data");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddAssignment = async () => {
    if (!formData.teacher_id || !formData.class_id) {
      setErrorMessage("Please select both teacher and class");
      setShowErrorModal(true);
      return;
    }

    try {
      if (editingId) {
        await updateTeacherAssignment(editingId, formData);
        setSuccessMessage("Assignment updated successfully");
      } else {
        await createTeacherAssignment(formData);
        setSuccessMessage("Assignment added successfully");
      }
      setFormData({ teacher_id: "", class_id: "", is_active: true });
      setShowForm(false);
      setEditingId(null);
      setShowSuccessModal(true);
      await loadData();
    } catch (error) {
      console.error("Failed to save assignment:", error);
      setErrorMessage("Failed to save assignment");
      setShowErrorModal(true);
    }
  };

  const handleEdit = (assignment: TeacherClassAssignment) => {
    setFormData({
      teacher_id: assignment.teacher_id._id,
      class_id: assignment.class_id._id,
      is_active: assignment.is_active,
    });
    setEditingId(assignment._id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTeacherAssignment(deleteId);
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setSuccessMessage("Assignment deleted successfully");
      setShowSuccessModal(true);
      await loadData();
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setErrorMessage("Failed to delete assignment");
      setShowErrorModal(true);
    }
  };

  const renderItem = ({ item }: { item: TeacherClassAssignment }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.teacher_id.name}</Text>
        <Text style={styles.cardSubtitle}>
          {item.class_id.class_name} • {item.class_id.school_id?.school_name}
        </Text>
        <View style={styles.statusRow}>
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
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleEdit(item)}
        >
          <MaterialIcons name="edit" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item._id)}
        >
          <MaterialIcons name="delete" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredAssignments = assignments.filter((assignment) => {
    const query = searchQuery.toLowerCase();
    return (
      assignment.teacher_id.name.toLowerCase().includes(query) ||
      assignment.class_id.class_name.toLowerCase().includes(query) ||
      (assignment.class_id.school_id?.school_name || "").toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assignments..."
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
          style={styles.addButton}
          onPress={() => {
            setFormData({ teacher_id: "", class_id: "", is_active: true });
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={filteredAssignments}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No assignments yet</Text>
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Assignment" : "Add Assignment"}
              </Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Teacher</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      setTempTeacherId(formData.teacher_id);
                      setShowTeacherPicker(true);
                    }}
                  >
                    <Text style={styles.pickerButtonText}>
                      {formData.teacher_id
                        ? teachers.find((t) => t._id === formData.teacher_id)
                            ?.name || "Select teacher"
                        : "Select teacher"}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Class</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      setTempClassId(formData.class_id);
                      setShowClassPicker(true);
                    }}
                  >
                    <Text style={styles.pickerButtonText}>
                      {formData.class_id
                        ? (() => {
                            const cls = classes.find((c) => c._id === formData.class_id);
                            return cls ? `${cls.class_name} - ${cls.school_id.school_name}` : "Select class";
                          })()
                        : "Select class"}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      formData.is_active && styles.statusOptionSelected,
                      formData.is_active && styles.activeOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, is_active: true })}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        formData.is_active && styles.statusOptionTextSelected,
                      ]}
                    >
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      !formData.is_active && styles.statusOptionSelected,
                      !formData.is_active && styles.inactiveOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, is_active: false })}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        !formData.is_active && styles.statusOptionTextSelected,
                      ]}
                    >
                      Inactive
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleAddAssignment}
                >
                  <Text style={styles.submitButtonText}>
                    {editingId ? "Update" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Teacher Picker Modal */}
      <Modal
        visible={showTeacherPicker}
        animationType="fade"
        transparent
        onRequestClose={() => setShowTeacherPicker(false)}
      >
        <View style={styles.pickerModalBackdrop}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Teacher</Text>
              <TouchableOpacity onPress={() => setShowTeacherPicker(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={teachers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    tempTeacherId === item._id && styles.pickerItemSelected,
                  ]}
                  onPress={() => setTempTeacherId(item._id)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      tempTeacherId === item._id && styles.pickerItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {tempTeacherId === item._id && (
                    <MaterialIcons name="check-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.pickerList}
            />
            <View style={styles.pickerModalButtons}>
              <TouchableOpacity
                style={[styles.pickerButton2, styles.pickerCancelButton]}
                onPress={() => setShowTeacherPicker(false)}
              >
                <Text style={styles.pickerCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerButton2, styles.pickerOkButton]}
                onPress={() => {
                  setFormData({ ...formData, teacher_id: tempTeacherId });
                  setShowTeacherPicker(false);
                }}
              >
                <Text style={styles.pickerOkButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Class Picker Modal */}
      <Modal
        visible={showClassPicker}
        animationType="fade"
        transparent
        onRequestClose={() => setShowClassPicker(false)}
      >
        <View style={styles.pickerModalBackdrop}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Class</Text>
              <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={classes}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    tempClassId === item._id && styles.pickerItemSelected,
                  ]}
                  onPress={() => setTempClassId(item._id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.pickerItemText,
                        tempClassId === item._id && styles.pickerItemTextSelected,
                      ]}
                    >
                      {item.class_name}
                    </Text>
                    <Text style={styles.pickerItemSubtext}>
                      {item.school_id.school_name}
                    </Text>
                  </View>
                  {tempClassId === item._id && (
                    <MaterialIcons name="check-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.pickerList}
            />
            <View style={styles.pickerModalButtons}>
              <TouchableOpacity
                style={[styles.pickerButton2, styles.pickerCancelButton]}
                onPress={() => setShowClassPicker(false)}
              >
                <Text style={styles.pickerCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerButton2, styles.pickerOkButton]}
                onPress={() => {
                  setFormData({ ...formData, class_id: tempClassId });
                  setShowClassPicker(false);
                }}
              >
                <Text style={styles.pickerOkButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.customModalBackdrop}>
          <View style={styles.customModalContent}>
            <View style={styles.customModalIconContainer}>
              <MaterialIcons name="warning" size={48} color="#EF4444" />
            </View>
            <Text style={styles.customModalTitle}>Delete Assignment?</Text>
            <Text style={styles.customModalMessage}>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </Text>
            <View style={styles.customModalButtons}>
              <TouchableOpacity
                style={[styles.customModalButton, styles.customModalCancelButton]}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
              >
                <Text style={styles.customModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customModalButton, styles.customModalDeleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.customModalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.customModalBackdrop}>
          <View style={styles.customModalContent}>
            <View style={styles.customModalIconContainer}>
              <MaterialIcons name="check-circle" size={48} color="#10B981" />
            </View>
            <Text style={styles.customModalTitle}>Success!</Text>
            <Text style={styles.customModalMessage}>{successMessage}</Text>
            <TouchableOpacity
              style={styles.customModalSuccessButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.customModalSuccessText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.customModalBackdrop}>
          <View style={styles.customModalContent}>
            <View style={styles.customModalIconContainer}>
              <MaterialIcons name="error" size={48} color="#EF4444" />
            </View>
            <Text style={styles.customModalTitle}>Error</Text>
            <Text style={styles.customModalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.customModalErrorButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.customModalErrorText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 10,
    width: 40,
    height: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  cardDetail: {
    fontSize: 13,
    color: "#10B981",
    marginTop: 4,
    fontWeight: "600",
  },
  cardDate: {
    fontSize: 11,
    color: "#9ca3af",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
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
  actions: {
    flexDirection: "row",
    gap: 12,
    marginLeft: 12,
  },
  actionBtn: {
    padding: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#666",
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 18,
    paddingBottom: 32,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerButtonText: {
    fontSize: 14,
    color: "#374151",
  },
  statusOptions: {
    flexDirection: "row",
    gap: 12,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  statusOptionSelected: {
    borderColor: "transparent",
  },
  activeOptionSelected: {
    backgroundColor: "#3B82F6",
  },
  inactiveOptionSelected: {
    backgroundColor: "#EF4444",
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  statusOptionTextSelected: {
    color: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: "#10B981",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
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
  pickerItemSubtext: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
  },
  pickerModalButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  pickerButton2: {
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
  customModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  customModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  customModalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  customModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  customModalMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  customModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  customModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  customModalCancelButton: {
    backgroundColor: "#f3f4f6",
  },
  customModalCancelText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 15,
  },
  customModalDeleteButton: {
    backgroundColor: "#EF4444",
  },
  customModalDeleteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  customModalSuccessButton: {
    backgroundColor: "#10B981",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  customModalSuccessText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  customModalErrorButton: {
    backgroundColor: "#EF4444",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  customModalErrorText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
