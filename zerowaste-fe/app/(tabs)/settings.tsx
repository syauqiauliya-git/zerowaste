"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { getRole } from "@/lib/auth-storage";
import Header from "@/components/ui/header";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Animated,
  StyleSheet,
  View,
  Text,
  Pressable,
  TouchableOpacity,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import {
  approveProfile,
  fetchPendingProfiles,
  rejectProfile,
} from "@/lib/admin";

type CombinedPending = {
  _id: string;
  name: string;
  email?: string;
  profileType: "teacher" | "sppgstaff";
};

export default function SettingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"school" | "class" | "user">(
    "school"
  );
  const [pending, setPending] = useState<CombinedPending[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showApprovedPopup, setShowApprovedPopup] = useState(false);
  const [approvedInfo, setApprovedInfo] = useState<{
    name: string;
    profileType: "teacher" | "sppgstaff";
  } | null>(null);
  const [showRejectedPopup, setShowRejectedPopup] = useState(false);
  const [rejectedInfo, setRejectedInfo] = useState<{
    name: string;
    profileType: "teacher" | "sppgstaff";
  } | null>(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPendingProfiles();
      const teachers = (res.data.teachers || []).map((t) => ({
        _id: t._id,
        name: t.name,
        email: t.user_id?.email,
        profileType: "teacher" as const,
      }));
      const staff = (res.data.sppgstaff || []).map((s) => ({
        _id: s._id,
        name: s.name,
        email: s.user_id?.email,
        profileType: "sppgstaff" as const,
      }));
      setPending([...teachers, ...staff]);
    } catch (err) {
      console.error("Failed to load pending profiles", err);
      Alert.alert("Error", "Failed to load pending profiles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkRole = async () => {
      const userRole = await getRole();
      if (userRole?.toLowerCase() !== "admin") {
        router.replace("/(tabs)/home");
      }
    };
    checkRole();
    loadPending();
  }, [router, loadPending]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPending();
    setRefreshing(false);
  }, [loadPending]);

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <Header title="Settings" icon="settings" />

      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "school" && styles.activeTab]}
          onPress={() => setActiveTab("school")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "school" && styles.activeTabText,
            ]}
          >
            School
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "class" && styles.activeTab]}
          onPress={() => setActiveTab("class")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "class" && styles.activeTabText,
            ]}
          >
            Class
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "user" && styles.activeTab]}
          onPress={() => setActiveTab("user")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "user" && styles.activeTabText,
            ]}
          >
            User
          </Text>
        </Pressable>
      </View>

      {activeTab === "school" && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>School Settings</Text>
          <View style={styles.settingItem}>
            <MaterialIcons name="school" size={24} color="#10B981" />
            <Text style={styles.settingText}>Manage school information</Text>
          </View>
        </View>
      )}

      {activeTab === "class" && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Class Settings</Text>
          <View style={styles.settingItem}>
            <MaterialIcons name="class" size={24} color="#10B981" />
            <Text style={styles.settingText}>Manage class information</Text>
          </View>
        </View>
      )}

      {activeTab === "user" && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>User Management</Text>
          <View style={{ flex: 1 }}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#10B981"
                style={{ marginTop: 16 }}
              />
            ) : (
              <FlatList
                data={pending}
                keyExtractor={(item) => `${item.profileType}-${item._id}`}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                renderItem={({ item }) => (
                  <PendingItem
                    item={item}
                    onApprove={async () => {
                      try {
                        await approveProfile(item._id, item.profileType);
                        // Haptic feedback and success popup
                        try {
                          await Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success
                          );
                        } catch {}
                        setApprovedInfo({
                          name: item.name,
                          profileType: item.profileType,
                        });
                        setShowApprovedPopup(true);
                        setTimeout(() => setShowApprovedPopup(false), 1500);
                        loadPending();
                      } catch (e) {
                        console.error(e);
                        Alert.alert("Error", "Failed to approve profile");
                      }
                    }}
                    onReject={async () => {
                      try {
                        await rejectProfile(item._id, item.profileType);
                        try {
                          await Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Error
                          );
                        } catch {}
                        setRejectedInfo({
                          name: item.name,
                          profileType: item.profileType,
                        });
                        setShowRejectedPopup(true);
                        setTimeout(() => setShowRejectedPopup(false), 1500);
                        loadPending();
                      } catch (e) {
                        console.error(e);
                        Alert.alert("Error", "Failed to reject profile");
                      }
                    }}
                  />
                )}
                ListEmptyComponent={EmptyList}
                contentContainerStyle={{ paddingBottom: 32 }}
              />
            )}
          </View>
        </View>
      )}
      {/* Success popup */}
      <ApproveSuccessModal
        visible={showApprovedPopup}
        name={approvedInfo?.name ?? ""}
        role={approvedInfo?.profileType}
        onClose={() => setShowApprovedPopup(false)}
      />
      <RejectResultModal
        visible={showRejectedPopup}
        name={rejectedInfo?.name ?? ""}
        role={rejectedInfo?.profileType}
        onClose={() => setShowRejectedPopup(false)}
      />
    </ScrollView>
  );
}

type PendingItemProps = Readonly<{
  item: CombinedPending;
  onApprove: () => void | Promise<void>;
  onReject: () => void | Promise<void>;
}>;

function PendingItem({ item, onApprove, onReject }: PendingItemProps) {
  const roleLabel = item.profileType === "teacher" ? "Teacher" : "SPPG Staff";
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {!!item.email && <Text style={styles.cardSubtitle}>{item.email}</Text>}
        <Text style={styles.badge}>{roleLabel}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.reject]}
          onPress={onReject}
        >
          <MaterialIcons name="close" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.approve]}
          onPress={onApprove}
        >
          <MaterialIcons name="check" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyList() {
  return (
    <Text style={{ textAlign: "center", marginTop: 24, color: "#666" }}>
      No pending profiles
    </Text>
  );
}

type ApproveSuccessModalProps = Readonly<{
  visible: boolean;
  name: string;
  role?: "teacher" | "sppgstaff";
  onClose: () => void;
}>;

function ApproveSuccessModal({
  visible,
  name,
  role,
  onClose,
}: ApproveSuccessModalProps) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    } else {
      fade.setValue(0);
      scale.setValue(0.9);
    }
  }, [visible, fade, scale]);

  let roleLabel = "";
  if (role === "teacher") roleLabel = "Teacher";
  else if (role === "sppgstaff") roleLabel = "SPPG Staff";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.popupBackdrop} onPress={onClose}>
        <Animated.View
          style={[styles.popupCard, { opacity: fade, transform: [{ scale }] }]}
        >
          <View style={styles.popupIconWrap}>
            <MaterialIcons name="check-circle" size={66} color="#10B981" />
          </View>
          <Text style={styles.popupTitle}>Approved!</Text>
          {!!name && <Text style={styles.popupName}>{name}</Text>}
          {!!roleLabel && <Text style={styles.popupRole}>{roleLabel}</Text>}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

type RejectResultModalProps = Readonly<{
  visible: boolean;
  name: string;
  role?: "teacher" | "sppgstaff";
  onClose: () => void;
}>;

function RejectResultModal({ visible, name, role, onClose }: RejectResultModalProps) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    } else {
      fade.setValue(0);
      scale.setValue(0.9);
    }
  }, [visible, fade, scale]);

  let roleLabel = "";
  if (role === "teacher") roleLabel = "Teacher";
  else if (role === "sppgstaff") roleLabel = "SPPG Staff";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.popupBackdrop} onPress={onClose}>
        <Animated.View style={[styles.popupCard, { opacity: fade, transform: [{ scale }] }]}> 
          <View style={[styles.popupIconWrap, { backgroundColor: "#FEF2F2" }]}>
            <MaterialIcons name="cancel" size={66} color="#EF4444" />
          </View>
          <Text style={styles.popupTitle}>Rejected</Text>
          {!!name && <Text style={[styles.popupName, { color: "#EF4444" }]}>{name}</Text>}
          {!!roleLabel && <Text style={styles.popupRole}>{roleLabel}</Text>}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  tabContainer: {
    flexDirection: "row",
    marginVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#10B981",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#10B981",
  },
  content: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  settingText: {
    fontSize: 15,
    color: "#111827",
    marginLeft: 12,
    flex: 1,
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
  badge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#10B981",
    color: "#fff",
    fontSize: 11,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  approve: {
    backgroundColor: "#10B981",
  },
  reject: {
    backgroundColor: "#EF4444",
  },
  popupBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  popupCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  popupIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  popupName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 6,
  },
  popupRole: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
});
