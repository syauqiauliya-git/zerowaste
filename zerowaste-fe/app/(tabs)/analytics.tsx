import { Text, StyleSheet, View, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchSchools as fetchSchoolsAction } from "@/store/slices/schoolSlice";
import { fetchSchoolAnalytics, fetchGlobalAnalytics, fetchClassAnalytics, SchoolAnalytics, GlobalAnalytics, ClassAnalyticsResponse } from "@/lib/analytics";
import { School } from "@/lib/school";
import { useRouter, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import BarChart from "@/components/charts/BarChart";
// import { dummySchoolAnalytics, dummyGlobalAnalytics } from "@/data/dummy-analytics";

const SELECTED_SCHOOL_KEY = "selected_school_id";

export default function AnalyticsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.role?.toLowerCase() || null);
  const schools = useAppSelector((state) => state.schools.schools);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolAnalytics, setSchoolAnalytics] = useState<SchoolAnalytics | null>(null);
  const [globalAnalytics, setGlobalAnalytics] = useState<GlobalAnalytics | null>(null);
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("Last Week");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("");
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  const loadInitialSchool = useCallback(async () => {
    if (role !== "admin" || selectedSchoolId) return;

    // Use Redux state if available
    if (schools.length > 0) {
      const firstSchool = schools[0];
      setSelectedSchoolId(firstSchool._id);
      setSelectedSchool(firstSchool);
      await SecureStore.setItemAsync(SELECTED_SCHOOL_KEY, firstSchool._id);
    }
  }, [role, selectedSchoolId, schools]);

  // Memoize loadAnalytics to prevent unnecessary re-renders
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For admin, only load if a school is selected
      if (role === "admin" && !selectedSchoolId) {
        setLoading(false);
        return;
      }

      if (role === "teacher" || role === "admin") {
        const schoolResponse = await fetchSchoolAnalytics(
          role === "admin" ? selectedSchoolId || undefined : undefined
        );
        setSchoolAnalytics(schoolResponse.data);
      }

      if (role === "teacher") {
        const classResponse = await fetchClassAnalytics();
        setClassAnalytics(classResponse);
        if (classResponse.data.length > 0 && !selectedClassFilter) {
          setSelectedClassFilter(classResponse.data[0].className);
        }
      }

      // Load global analytics for admins only
      if (role === "admin") {
        const globalResponse = await fetchGlobalAnalytics();
        setGlobalAnalytics(globalResponse.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [role, selectedSchoolId]);

  // Load initial school for admin and fetch schools to Redux
  useEffect(() => {
    if (role === "admin") {
      dispatch(fetchSchoolsAction());
    } else if (role === "teacher") {
      loadAnalytics();
    }
  }, [role, dispatch, loadAnalytics]);

  // Load initial school when Redux schools are available
  useEffect(() => {
    if (role === "admin") {
      if (schools.length > 0 && !selectedSchoolId) {
        loadInitialSchool();
      } else if (schools.length === 0) {
        // No schools available, stop loading
        setLoading(false);
      }
    }
  }, [schools, role, selectedSchoolId, loadInitialSchool]);

  // Reload analytics when school selection changes
  useEffect(() => {
    if (role === "teacher" || (role === "admin" && selectedSchoolId)) {
      loadAnalytics();
    }
  }, [role, selectedSchoolId, loadAnalytics]);

  // Check if selected school still exists in Redux state (handles deleted schools)
  useEffect(() => {
    if (role === "admin") {
      // If no schools available, clear selection only if it's currently set
      if (schools.length === 0) {
        if (selectedSchoolId !== null || selectedSchool !== null) {
          setSelectedSchoolId(null);
          setSelectedSchool(null);
        }
        return;
      }

      // If a school is selected, check if it still exists
      if (selectedSchoolId) {
        const schoolExists = schools.find((s) => s._id === selectedSchoolId);
        if (schoolExists) {
          // Only update if the school object is different
          if (!selectedSchool || selectedSchool._id !== schoolExists._id) {
            setSelectedSchool(schoolExists);
          }
        } else {
          // Selected school was deleted, select another school
          const firstSchool = schools[0];
          if (firstSchool) {
            setSelectedSchoolId(firstSchool._id);
            setSelectedSchool(firstSchool);
            SecureStore.setItemAsync(SELECTED_SCHOOL_KEY, firstSchool._id);
          }
        }
      }
    }
  }, [schools, selectedSchoolId, role]);

  // Check for selected school when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Check if a school was selected from the modal
      const checkSelectedSchool = async () => {
        if (role === "admin") {
          try {
            const storedSchoolId = await SecureStore.getItemAsync(SELECTED_SCHOOL_KEY);
            if (storedSchoolId && storedSchoolId !== selectedSchoolId) {
              setSelectedSchoolId(storedSchoolId);
              // Use Redux state to find the school
              const school = schools.find((s) => s._id === storedSchoolId);
              if (school) {
                setSelectedSchool(school);
              }
            }
          } catch (err) {
            console.error("Failed to get selected school:", err);
          }
        }
      };
      checkSelectedSchool();
    }, [role, selectedSchoolId, schools])
  );

  const handleSelectSchool = () => {
    router.push({
      pathname: "/school-select",
      params: {
        schoolId: selectedSchoolId || "",
        returnPath: "/(tabs)/analytics"
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.mainView, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.mainView, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.mainView} contentContainerStyle={styles.scrollContent}>
      {/* Global Analytics - for admins only */}
      {role === "admin" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Analytics</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {globalAnalytics?.totalReduction?.toFixed(1) ?? "0.0"}
              </Text>
              <Text style={styles.statLabel}>kg</Text>
              <Text style={styles.statSubLabel}>Total Reduction</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {globalAnalytics?.averageRating?.toFixed(1) ?? "0.0"}
              </Text>
              <Text style={styles.statLabel}>/ 5.0</Text>
              <Text style={styles.statSubLabel}>Avg Rating</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {globalAnalytics?.totalReports ?? 0}
              </Text>
              <Text style={styles.statLabel}>reports</Text>
              <Text style={styles.statSubLabel}>Total Reports</Text>
            </View>
          </View>
        </View>
      )}

      {/* School Analytics - for teachers and admins */}
      {(role === "teacher" || role === "admin") && (
        <View style={styles.section}>
          {role === "admin" && (
            <View style={styles.selectSchoolContainer}>
              <Text style={styles.sectionTitle}>School Analytics</Text>
              <Pressable
                style={styles.selectButton}
                onPress={handleSelectSchool}
              >
                <Text style={[styles.selectText, !selectedSchool && styles.selectPlaceholder]}>
                  {schools.length === 0
                    ? "No school selected"
                    : selectedSchool
                      ? selectedSchool.school_name
                      : "Select a school"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
            </View>
          )}

          {role === "teacher" && (
            <Text style={styles.sectionTitle}>School Analytics</Text>
          )}

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Text style={styles.statNumber}>
                {schoolAnalytics?.totalReduction?.toFixed(1) ?? "0.0"}
              </Text>
              <Text style={styles.statCardLabel}>kg</Text>
              <Text style={styles.statCardSub}>Total Waste</Text>
            </View>

            <View style={[styles.statCard, styles.statCardAccent]}>
              <Text style={styles.statNumber}>
                {schoolAnalytics?.averageRating?.toFixed(1) ?? "0.0"}
              </Text>
              <Text style={styles.statCardLabel}>/ 5.0</Text>
              <Text style={styles.statCardSub}>Avg Rating</Text>
            </View>

            <View style={[styles.statCard, styles.statCardPurple]}>
              <Text style={styles.statNumber}>
                {schoolAnalytics?.totalReports ?? 0}
              </Text>
              <Text style={styles.statCardLabel}>reports</Text>
              <Text style={styles.statCardSub}>Total Reports</Text>
            </View>
          </View>

          {/* Additional Stats: Likes and Dislikes */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <View style={styles.statValueRow}>
                <Ionicons name="thumbs-up" size={28} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.statNumber}>
                  {schoolAnalytics?.totalLikes ?? 0}
                </Text>
              </View>
              <Text style={styles.statCardSub}>Total Likes</Text>
            </View>

            <View style={[styles.statCard, styles.statCardDanger]}>
              <View style={styles.statValueRow}>
                <Ionicons name="thumbs-down" size={28} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.statNumber}>
                  {schoolAnalytics?.totalDislikes ?? 0}
                </Text>
              </View>
              <Text style={styles.statCardSub}>Total Dislikes</Text>
            </View>
          </View>

          {/* Trend by Date */}
          {schoolAnalytics && schoolAnalytics.trend && schoolAnalytics.trend.length > 0 && (
            <View style={styles.trendSection}>
              {/* Header with Dropdown */}
              <View style={styles.cardHeader}>
                <Text style={styles.trendTitle}>Food Waste Trend by Date</Text>

                {/* Time Period Filter Dropdown */}
                <View style={styles.dropdownWrapper}>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                  >
                    <Text style={styles.dropdownButtonText}>{selectedTimePeriod}</Text>
                    <Text style={[styles.dropdownIcon, isTimeDropdownOpen && styles.dropdownIconOpen]}>▼</Text>
                  </Pressable>

                  {isTimeDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {["Last Week", "Last Month", "Last Year"].map((period, index) => (
                        <Pressable
                          key={`period-${period}`}
                          style={[
                            styles.dropdownItem,
                            selectedTimePeriod === period && styles.dropdownItemActive,
                            index === 2 && styles.dropdownItemLast
                          ]}
                          onPress={() => {
                            setSelectedTimePeriod(period);
                            setIsTimeDropdownOpen(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            selectedTimePeriod === period && styles.dropdownItemTextActive
                          ]}>
                            {period}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.chartContainer}>
                <BarChart
                  data={(() => {
                    // Filter data based on selected time period
                    const now = new Date();
                    let filteredData = schoolAnalytics.trend;

                    if (selectedTimePeriod === "Last Week") {
                      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      filteredData = schoolAnalytics.trend.filter(
                        item => new Date(item._id) >= weekAgo
                      );
                    } else if (selectedTimePeriod === "Last Month") {
                      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                      filteredData = schoolAnalytics.trend.filter(
                        item => new Date(item._id) >= monthAgo
                      );
                    } else if (selectedTimePeriod === "Last Year") {
                      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                      filteredData = schoolAnalytics.trend.filter(
                        item => new Date(item._id) >= yearAgo
                      );
                    }

                    return filteredData;
                  })()}
                  height={220}
                />
              </View>
            </View>
          )}

          {/* Food Waste by Class - for teachers only */}
          {role === "teacher" && classAnalytics && classAnalytics.data.length > 0 && (
            <View style={styles.trendSection}>
              {/* Header with Dropdown */}
              <View style={styles.cardHeader}>
                <Text style={styles.trendTitle}>Food Waste Trend by Class</Text>

                {/* Class Filter Dropdown */}
                <View style={styles.dropdownWrapper}>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                  >
                    <Text style={styles.dropdownButtonText}>{selectedClassFilter}</Text>
                    <Text style={[styles.dropdownIcon, isClassDropdownOpen && styles.dropdownIconOpen]}>▼</Text>
                  </Pressable>

                  {isClassDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {classAnalytics.data.map((item, index) => (
                        <Pressable
                          key={`filter-${item.className}-${index}`}
                          style={[
                            styles.dropdownItem,
                            selectedClassFilter === item.className && styles.dropdownItemActive,
                            index === classAnalytics.data.length - 1 && styles.dropdownItemLast
                          ]}
                          onPress={() => {
                            setSelectedClassFilter(item.className);
                            setIsClassDropdownOpen(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            selectedClassFilter === item.className && styles.dropdownItemTextActive
                          ]}>
                            {item.className}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Display bar chart for selected class waste trend by date */}
              <View style={styles.chartContainer}>
                <BarChart
                  data={(() => {
                    const selectedClass = classAnalytics.data.find(
                      item => item.className === selectedClassFilter
                    );
                    return selectedClass && selectedClass.trend ? selectedClass.trend : [];
                  })()}
                  height={220}
                />
              </View>
            </View>
          )}

          {/* Top Waste Reasons */}
          {schoolAnalytics && schoolAnalytics.topReasons && schoolAnalytics.topReasons.length > 0 && (
            <View style={styles.trendSection}>
              <Text style={styles.trendTitle}>Top Waste Reasons</Text>
              {schoolAnalytics.topReasons.map((item, index) => {
                const barColors = ['#10B981', '#059669', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4'];
                const barColor = barColors[index % barColors.length];

                return (
                  <View key={index} style={styles.reasonRow}>
                    <View style={styles.reasonBadge}>
                      <Text style={styles.reasonCode}>{item.code}</Text>
                    </View>
                    <View style={styles.reasonBar}>
                      <View
                        style={[
                          styles.reasonBarFill,
                          {
                            width: `${(item.count / (schoolAnalytics.topReasons[0]?.count || 1)) * 100}%`,
                            backgroundColor: barColor
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.reasonCount}>{item.count}</Text>
                  </View>
                );
              })}
            </View>
          )}

        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statBox: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    minWidth: 100,
    flex: 1,
    marginHorizontal: 4,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
    marginBottom: 4,
  },
  statSubLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    justifyContent: "center",
  },
  statCardPrimary: {
    backgroundColor: "#059669",
    borderWidth: 0,
    borderColor: "transparent",
  },
  statCardAccent: {
    backgroundColor: "#3B82F6",
    borderWidth: 0,
    borderColor: "transparent",
  },
  statCardPurple: {
    backgroundColor: "#8B5CF6",
    borderWidth: 0,
    borderColor: "transparent",
  },
  statCardSuccess: {
    backgroundColor: "#10B981",
    borderWidth: 0,
    borderColor: "transparent",
  },
  statCardDanger: {
    backgroundColor: "#EF4444",
    borderWidth: 0,
    borderColor: "transparent",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statCardLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  statCardSub: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    fontSize: 12,
  },
  trendSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#064E3B",
  },
  chartContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  selectText: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
  },
  selectPlaceholder: {
    color: "#9CA3AF",
  },
  selectSchoolContainer: {
    marginBottom: 16,
  },
  classRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 8,
  },
  className: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  classStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  classWaste: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
  },
  classReports: {
    fontSize: 12,
    color: "#6B7280",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  reasonBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 50,
    alignItems: "center",
  },
  reasonCode: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  reasonBar: {
    flex: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  reasonBarFill: {
    height: "100%",
    // backgroundColor will be set inline for each bar
  },
  reasonCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    minWidth: 30,
    textAlign: "right",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    zIndex: 10,
  },
  dropdownWrapper: {
    position: "relative",
    zIndex: 10,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    minWidth: 110,
  },
  dropdownButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 9,
    color: "#9CA3AF",
  },
  dropdownIconOpen: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemActive: {
    backgroundColor: "#F0FDF4",
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  dropdownItemTextActive: {
    color: "#064E3B",
  },
  classWasteSummary: {
    alignItems: "center",
    paddingVertical: 20,
  },
  classWasteLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 8,
  },
  classWasteValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#059669",
  },
});
