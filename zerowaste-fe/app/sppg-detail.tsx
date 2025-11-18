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
import { useCallback, useEffect, useState } from "react";
import { fetchSPPGById, updateSPPG, deleteSPPG, SPPG } from "@/lib/sppg";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchSPPGList } from "@/store/slices/sppgSlice";

export default function SPPGDetailScreen() {
  const { sppgId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.role?.toLowerCase() || null);
  const [sppgDetail, setSppgDetail] = useState<SPPG | null>(null);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    address: "",
    is_active: true,
  });

  const fetchSPPGDetailData = useCallback(async () => {
    try {
      if (!sppgId) {
        console.error("SPPG ID is required");
        return;
      }

      const sppg = await fetchSPPGById(sppgId as string);
      console.log("SPPG detail response:", sppg);
      setSppgDetail(sppg);
      setEditData({
        name: sppg.name || "",
        address: sppg.address || "",
        is_active: sppg.is_active ?? true,
      });
    } catch (error) {
      console.error("Failed to fetch SPPG detail:", error);
    }
  }, [sppgId]);

  const handleSave = async () => {
    if (
      !editData.name.trim() ||
      !editData.address.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const sppgData = {
        name: editData.name,
        address: editData.address,
        is_active: editData.is_active,
      };

      const result = await updateSPPG(sppgId as string, sppgData);
      console.log("SPPG updated successfully:", result);
      setSppgDetail(result);
      dispatch(fetchSPPGList());
      router.back();
    } catch (error) {
      console.error("Failed to update SPPG:", error);
      alert("Failed to update SPPG");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete SPPG",
      "Are you sure you want to delete this SPPG? This action cannot be undone.",
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
              await deleteSPPG(sppgId as string);
              console.log("SPPG deleted successfully");
              // Refresh SPPG list in Redux store
              dispatch(fetchSPPGList());
              router.back();
            } catch (error) {
              console.error("Failed to delete SPPG:", error);
              alert("Failed to delete SPPG");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchSPPGDetailData();
  }, [fetchSPPGDetailData]);

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <Header title="SPPG Details" icon="business" />

      <View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SPPG Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            {role === "admin" ? (
              <TextInput
                style={styles.input}
                value={editData.name}
                onChangeText={(text) =>
                  setEditData({ ...editData, name: text })
                }
                placeholder="Enter SPPG name"
              />
            ) : (
              <Text style={styles.value}>{editData.name}</Text>
            )}
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Address:</Text>
            {role === "admin" ? (
              <TextInput
                style={styles.input}
                value={editData.address}
                onChangeText={(text) =>
                  setEditData({ ...editData, address: text })
                }
                placeholder="Enter address"
                multiline
              />
            ) : (
              <Text style={styles.value}>{editData.address}</Text>
            )}
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            {role === "admin" ? (
              <View style={styles.statusOptions}>
                <Pressable
                  style={[
                    styles.statusOption,
                    editData.is_active && styles.statusOptionSelected,
                    editData.is_active && styles.activeOptionSelected,
                  ]}
                  onPress={() => setEditData({ ...editData, is_active: true })}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      editData.is_active && styles.statusOptionTextSelected,
                    ]}
                  >
                    Active
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.statusOption,
                    !editData.is_active && styles.statusOptionSelected,
                    !editData.is_active && styles.inactiveOptionSelected,
                  ]}
                  onPress={() => setEditData({ ...editData, is_active: false })}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      !editData.is_active && styles.statusOptionTextSelected,
                    ]}
                  >
                    Inactive
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View
                style={[
                  styles.statusBadge,
                  editData.is_active ? styles.activeStatus : styles.inactiveStatus,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    editData.is_active ? styles.activeText : styles.inactiveText,
                  ]}
                >
                  {editData.is_active ? "Active" : "Inactive"}
                </Text>
              </View>
            )}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
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
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1F2937",
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: "#1F2937",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  sectionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusOptions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: "flex-start",
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
