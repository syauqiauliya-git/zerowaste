import Header from "@/components/ui/header";
import { fetchReports, Report } from "@/lib/report";
import renderReportItem from "@/components/report/render-report-item";
import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

export default function ReportsScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const fetchData = async () => {
    try {
      const reports = await fetchReports();
      setReports(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, []);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.mainView}>
      <Header title="Reports" icon="assessment" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No reports available</Text>
          }
          // Enable pull-to-refresh
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#10B981"]}
            />
          }
          // Ensure list expands properly
          contentContainerStyle={
            reports.length === 0 ? { flex: 1 } : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    marginTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#6B7280",
  },
  separator: {
    height: 12,
  },
});
