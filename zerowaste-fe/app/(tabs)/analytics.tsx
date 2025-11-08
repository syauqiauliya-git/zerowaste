import { Text, StyleSheet, View, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchSchools as fetchSchoolsAction } from "@/store/slices/schoolSlice";
import { fetchSchoolAnalytics, fetchGlobalAnalytics, SchoolAnalytics, GlobalAnalytics } from "@/lib/analytics";
import { fetchSchools, School } from "@/lib/school";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialSchool = useCallback(async () => {
    if (role !== "admin" || selectedSchoolId) return;

    // Use Redux state if available
    if (schools.length > 0) {
      const firstSchool = schools[0];
      setSelectedSchoolId(firstSchool._id);
      setSelectedSchool(firstSchool);
      await SecureStore.setItemAsync(SELECTED_SCHOOL_KEY, firstSchool._id);
    }
  }, [role, selectedSchoolId, schools.length]);

  // Load initial school for admin and fetch schools to Redux
  useEffect(() => {
    if (role === "admin") {
      dispatch(fetchSchoolsAction());
    } else {
      loadAnalytics();
    }
  }, [role, dispatch]);

  // Load initial school when Redux schools are available
  useEffect(() => {
    if (role === "admin" && schools.length > 0 && !selectedSchoolId) {
      loadInitialSchool();
    } else if (role === "admin" && schools.length === 0 && !selectedSchoolId) {
      // No schools available, stop loading
      setLoading(false);
    }
  }, [schools.length, role, selectedSchoolId, loadInitialSchool]);

  // Reload analytics when school changes
  useEffect(() => {
    if (role === "admin" && selectedSchoolId) {
      loadAnalytics();
    } else if (role === "teacher") {
      loadAnalytics();
    }
    // For admin with no schools, set loading to false to prevent infinite refresh
    else if (role === "admin" && schools.length === 0) {
      setLoading(false);
    }
  }, [schools.length]);

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
  }, [schools.length, selectedSchoolId, role, selectedSchool?._id]);

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

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load school analytics for teachers and admins
      if (role === "teacher" || role === "admin") {
        const schoolResponse = await fetchSchoolAnalytics(
          role === "admin" ? selectedSchoolId || undefined : undefined
        );
        setSchoolAnalytics(schoolResponse.data);
        // TEMPORARY: Use dummy data
        // setSchoolAnalytics(dummySchoolAnalytics);
      }

      // Load global analytics for admins only
      if (role === "admin") {
        const globalResponse = await fetchGlobalAnalytics();
        setGlobalAnalytics(globalResponse.data);
        // TEMPORARY: Use dummy data
        // setGlobalAnalytics(dummyGlobalAnalytics);
      }
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // Show loading only if we're loading analytics
  // For admins, wait until a school is selected
  if (loading && !(role === "admin" && !selectedSchoolId)) {
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
      {role === "admin" && globalAnalytics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Analytics</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {globalAnalytics.totalReduction.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>kg</Text>
              <Text style={styles.statSubLabel}>Total Reduction</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {globalAnalytics.averageRating.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>/ 5.0</Text>
              <Text style={styles.statSubLabel}>Avg Rating</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {globalAnalytics.totalReports}
              </Text>
              <Text style={styles.statLabel}>reports</Text>
              <Text style={styles.statSubLabel}>Total Reports</Text>
            </View>
          </View>
        </View>
      )}

      {/* School Analytics - for teachers and admins */}
      {(role === "teacher" || role === "admin") && schoolAnalytics && (
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

          {
            role === "teacher" && (
              <Text style={styles.sectionTitle}>School Analytics</Text>)
          }

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {schoolAnalytics.totalReduction.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>kg</Text>
              <Text style={styles.statSubLabel}>Total Reduction</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {schoolAnalytics.averageRating.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>/ 5.0</Text>
              <Text style={styles.statSubLabel}>Avg Rating</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {schoolAnalytics.totalReports}
              </Text>
              <Text style={styles.statLabel}>reports</Text>
              <Text style={styles.statSubLabel}>Total Reports</Text>
            </View>
          </View>

            <View style={styles.trendSection}>
              <Text style={styles.trendTitle}>Waste Trend</Text>
              <View style={styles.chartContainer}>
                <BarChart data={schoolAnalytics.trend} height={220} />
              </View>
            </View>
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
  trendSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  noDataText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 20,
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
});
