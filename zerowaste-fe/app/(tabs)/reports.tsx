import Header from "@/components/ui/header";
import { fetchReports, Report } from "@/lib/report";
import renderReportItem from "@/components/report/render-report-item";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";

export default function ReportsScreen() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const reports = await fetchReports();
      setReports(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.mainView}>
      <Header title="Reports" icon="assessment" />
      <View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading reports...</Text>
          </View>
        ) : (
          <FlatList
            data={reports}
            renderItem={renderReportItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No reports available</Text>
            }
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    padding: 16
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: "center",
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
    height: 16,
  },
});
