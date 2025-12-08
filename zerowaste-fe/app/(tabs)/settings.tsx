"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
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
  TextInput,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import {
  approveProfile,
  fetchPendingProfiles,
  rejectProfile,
} from "@/lib/admin";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSchools } from '@/store/slices/schoolSlice';
import { fetchClasses } from '@/store/slices/classSlice';
import { fetchSPPGList } from '@/store/slices/sppgSlice';
import SchoolSettings from '@/components/schools/school-settings';
import ClassSettings from '@/components/schools/class-settings';
import SPPGSettings from '@/components/sppg/sppg-settings';
import TeacherAssignments from '@/components/assignments/teacher-assignments';
import SPPGAssignments from '@/components/assignments/sppg-assignments';
import { useTranslation } from '@/hooks/useTranslation';

type CombinedPending = {
  _id: string;
  name: string;
  email?: string;
  profileType: "teacher" | "sppgstaff";
};

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { schools, loading: schoolsLoading } = useAppSelector((state) => state.schools);
  const { classes, loading: classesLoading } = useAppSelector((state) => state.classes);
  const { sppgList, loading: sppgLoading } = useAppSelector((state) => state.sppg);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"school" | "class" | "sppg" | "user" | "teacher-assignment" | "sppg-assignment">(
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
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const tabScrollViewRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);

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
      Alert.alert(t("common.error"), t("settings.failedToLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const checkRole = async () => {
      const userRole = await getRole();
      if (userRole?.toLowerCase() !== "admin") {
        router.replace("/(tabs)/home");
      }
    };
    checkRole();
    loadPending();
    if (activeTab === "school") {
      dispatch(fetchSchools());
    } else if (activeTab === "class") {
      dispatch(fetchClasses());
    } else if (activeTab === "sppg") {
      dispatch(fetchSPPGList());
    }
  }, [router, loadPending, dispatch, activeTab]);

  // Auto-refresh data when screen comes into focus (after navigating back from detail screens)
  useFocusEffect(
    useCallback(() => {
      if (activeTab === "school") {
        dispatch(fetchSchools());
      } else if (activeTab === "class") {
        dispatch(fetchClasses());
      } else if (activeTab === "sppg") {
        dispatch(fetchSPPGList());
      }
    }, [dispatch, activeTab])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPending();
    setRefreshing(false);
  }, [loadPending]);

  const onSchoolsRefresh = async () => {
    dispatch(fetchSchools());
    console.log('Refreshing schools: ', schools);
  };

  const onClassesRefresh = async () => {
    dispatch(fetchClasses());
    console.log('Refreshing classes: ', classes);
  };

  const onSPPGRefresh = async () => {
    dispatch(fetchSPPGList());
    console.log('Refreshing SPPG: ', sppgList);
  };

  return (
    <View style={styles.mainView}>
      <Header title={t("settings.title")} icon="settings" />

      <View style={styles.tabScrollView}>
        <TouchableOpacity
          style={styles.scrollArrowLeft}
          onPress={() => {
            const newX = Math.max(0, scrollX - 150);
            tabScrollViewRef.current?.scrollTo({ x: newX, y: 0, animated: true });
          }}
        >
          <MaterialIcons name="chevron-left" size={24} color="#6b7280" />
        </TouchableOpacity>
        <ScrollView
          ref={tabScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
          style={styles.tabScrollContent}
          onScroll={(event) => {
            setScrollX(event.nativeEvent.contentOffset.x);
          }}
          scrollEventThrottle={16}
        >
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
              {t("settings.school")}
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
              {t("settings.class")}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "sppg" && styles.activeTab]}
            onPress={() => setActiveTab("sppg")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "sppg" && styles.activeTabText,
              ]}
            >
              {t("settings.sppg")}
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
              {t("settings.user")}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "teacher-assignment" && styles.activeTab]}
            onPress={() => setActiveTab("teacher-assignment")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "teacher-assignment" && styles.activeTabText,
              ]}
            >
              {t("settings.teacherAssignment")}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "sppg-assignment" && styles.activeTab]}
            onPress={() => setActiveTab("sppg-assignment")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "sppg-assignment" && styles.activeTabText,
              ]}
            >
              {t("settings.sppgAssignment")}
            </Text>
          </Pressable>
        </ScrollView>
        <TouchableOpacity
          style={styles.scrollArrowRight}
          onPress={() => {
            const newX = scrollX + 150;
            tabScrollViewRef.current?.scrollTo({ x: newX, y: 0, animated: true });
          }}
        >
          <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {activeTab === "school" && (
        <SchoolSettings
          schools={schools}
          loading={schoolsLoading}
          onRefresh={onSchoolsRefresh}
        />
      )}

      {activeTab === "class" && (
        <ClassSettings
          classes={classes}
          loading={classesLoading}
          onRefresh={onClassesRefresh}
        />
      )}

      {activeTab === "sppg" && (
        <SPPGSettings
          sppgList={sppgList}
          loading={sppgLoading}
          onRefresh={onSPPGRefresh}
        />
      )}

      {activeTab === "user" && (
        <View style={styles.content}>
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder={t("settings.searchUsers")}
                placeholderTextColor="#9ca3af"
                value={userSearchQuery}
                onChangeText={setUserSearchQuery}
              />
              {userSearchQuery.length > 0 && (
                <Pressable onPress={() => setUserSearchQuery("")}>
                  <MaterialIcons name="close" size={20} color="#6b7280" />
                </Pressable>
              )}
            </View>
          </View>
          <View style={{ flex: 1 }}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#10B981"
                style={{ marginTop: 16 }}
              />
            ) : (
              <FlatList
                data={pending.filter((item) => {
                  const query = userSearchQuery.toLowerCase();
                  return (
                    item.name.toLowerCase().includes(query) ||
                    (item.email || "").toLowerCase().includes(query)
                  );
                })}
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
                        Alert.alert(t("common.error"), t("settings.failedToApprove"));
                      }
                    }}
                    onReject={async () => {
                      try {
                        await rejectProfile(item._id, item.profileType);
                        Alert.alert(t("common.success"), t("settings.profileRejected"));
                        loadPending();
                      } catch (e) {
                        console.error(e);
                        Alert.alert(t("common.error"), t("settings.failedToReject"));
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

      {activeTab === "teacher-assignment" && (
        <View style={styles.content}>
          <TeacherAssignments />
        </View>
      )}

      {activeTab === "sppg-assignment" && (
        <View style={styles.content}>
          <SPPGAssignments />
        </View>
      )}

      {/* Success popup */}
      <ApproveSuccessModal
        visible={showApprovedPopup}
        name={approvedInfo?.name ?? ""}
        role={approvedInfo?.profileType}
        onClose={() => setShowApprovedPopup(false)}
      />
    </View>
  );
}

type PendingItemProps = Readonly<{
  item: CombinedPending;
  onApprove: () => void | Promise<void>;
  onReject: () => void | Promise<void>;
}>;

function PendingItem({ item, onApprove, onReject }: PendingItemProps) {
  const { t } = useTranslation();
  const roleLabel = item.profileType === "teacher" ? t("settings.teacher") : t("settings.sppgStaff");
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
  const { t } = useTranslation();
  return (
    <Text style={{ textAlign: "center", marginTop: 24, color: "#666" }}>
      {t("settings.noPendingProfiles")}
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
  const { t } = useTranslation();
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
  if (role === "teacher") roleLabel = t("settings.teacher");
  else if (role === "sppgstaff") roleLabel = t("settings.sppgStaff");

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
          <Text style={styles.popupTitle}>{t("settings.approved")}</Text>
          {!!name && <Text style={styles.popupName}>{name}</Text>}
          {!!roleLabel && <Text style={styles.popupRole}>{roleLabel}</Text>}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mainView: {
    paddingHorizontal: 18,
    paddingTop: 20,
    flex: 1,
  },
  tabScrollView: {
    marginVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
  },
  tabScrollContent: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollArrowLeft: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollArrowRight: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    minWidth: 100,
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
  comingSoon: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 24,
    fontStyle: "italic",
  },
});
