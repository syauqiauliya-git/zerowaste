"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { getRole } from "@/lib/auth-storage";
import Header from "@/components/ui/header";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { DailyMenu, deleteMenu, getAllMenus } from "@/lib/menus";

export default function FoodScreen() {
  const router = useRouter();
  const [menus, setMenus] = useState<DailyMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletedPopupVisible, setDeletedPopupVisible] = useState(false);
  const deletedScale = useRef(new Animated.Value(0.9)).current;
  const deletedOpacity = useRef(new Animated.Value(0)).current;

  const showDeletedPopup = () => {
    setDeletedPopupVisible(true);
    deletedScale.setValue(0.9);
    deletedOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(deletedScale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(deletedOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(deletedOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(deletedScale, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setDeletedPopupVisible(false);
      });
    }, 1200);
  };

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllMenus();
      setMenus(res.data.menus || []);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to load menus");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const userRole = await getRole();
      if (userRole?.toLowerCase() !== "sppg_staff") {
        router.replace("/(tabs)/home");
        return;
      }
      loadMenus();
    };
    init();
  }, [router, loadMenus]);

  const openAdd = () => {
    router.push("/menu-create");
  };
  useFocusEffect(
    useCallback(() => {
      // Reload menus whenever screen comes into focus
      loadMenus();
    }, [loadMenus])
  );

  const onDelete = (id: string) => {
    Alert.alert("Delete", "Hapus menu ini?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          (async () => {
            try {
              await deleteMenu(id);
              try {
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
              } catch {}
              loadMenus();
              // Show polished deleted success popup
              showDeletedPopup();
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Gagal menghapus menu");
            }
          })();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: DailyMenu }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: "/menu/[id]" as any,
            params: { id: item._id },
          })
        }
      >
        <Text style={styles.cardTitle}>{item.nama_menu}</Text>
        {item.deskripsi ? (
          <Text style={styles.cardSubtitle}>{item.deskripsi}</Text>
        ) : null}
        <Text style={styles.meta}>
          {typeof item.school === "object" ? item.school?.school_name : ""}
          {typeof item.sppg === "object" && item.sppg?.name
            ? ` • ${item.sppg.name}`
            : ""}
        </Text>
      </TouchableOpacity>
      <View style={styles.rowActions}>
        <TouchableOpacity
          style={[styles.iconBtn, styles.edit]}
          onPress={() =>
            router.push({
              pathname: "/menu/[id]/edit" as any,
              params: { id: item._id },
            })
          }
        >
          <MaterialIcons name="edit" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, styles.delete]}
          onPress={() => onDelete(item._id)}
        >
          <MaterialIcons name="delete" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <Header title="Food Management" icon="restaurant" />

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Add Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.reloadBtn]} onPress={loadMenus}>
          <MaterialIcons name="refresh" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#10B981"
          style={{ marginTop: 16 }}
        />
      ) : (
        <FlatList
          data={menus}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await loadMenus();
            setRefreshing(false);
          }}
          ListEmptyComponent={EmptyList}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}

      {/* Delete success popup */}
      <Modal
        visible={deletedPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletedPopupVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Animated.View
            style={[
              styles.modalCard,
              { opacity: deletedOpacity, transform: [{ scale: deletedScale }] },
            ]}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#ECFDF5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="check" size={36} color="#10B981" />
              </View>
            </View>
            <Text style={styles.modalTitle}>Menu berhasil dihapus</Text>
            <Text style={{ textAlign: "center", color: "#6b7280" }}>
              Data telah dihapus dari daftar.
            </Text>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function EmptyList() {
  return (
    <Text style={{ textAlign: "center", marginTop: 24, color: "#666" }}>
      Belum ada menu
    </Text>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
  },
  reloadBtn: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#10B981",
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
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },
  rowActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  edit: { backgroundColor: "#3B82F6" },
  delete: { backgroundColor: "#EF4444" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 14,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnLabel: {
    fontWeight: "700",
    color: "#111827",
  },
  cancel: {
    backgroundColor: "#e5e7eb",
  },
  save: {
    backgroundColor: "#10B981",
  },
});
