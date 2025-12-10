import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Header from "@/components/ui/header";
import { fetchReportById, Report } from "@/lib/report";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "@/hooks/useTranslation";

// Helper to format date nicely
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ReportDetailScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  const load = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    try {
      const reportData = await fetchReportById(String(reportId));
      setReport(reportData);
    } catch (e) {
      console.error(e);
      Alert.alert(t("common.error"), t("reports.failedToLoad"));
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    load();
  }, [load]);

  const renderBody = () => {
    if (loading)
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>{t("reports.loadingReport")}</Text>
        </View>
      );
    
    if (!report)
      return (
        <Text style={styles.emptyText}>{t("reports.reportNotFound")}</Text>
      );

    return (
      <View style={styles.container}>
        {/* Header Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.menuName}>{report.menu.nama_menu}</Text>
              <Text style={styles.dateText}>{formatDate(report.report_date)}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                report.status === "submitted"
                  ? styles.statusSuccess
                  : styles.statusPending,
              ]}
            >
              <Text style={styles.statusText}>
                {report.status === "submitted" 
                  ? t("reports.status.submitted") 
                  : t("reports.status.pending")}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Meta Information */}
          <View style={styles.metaSection}>
            <View style={styles.metaRow}>
              <MaterialIcons name="person-outline" size={18} color="#6B7280" />
              <Text style={styles.metaLabel}>{t("reports.teacher")}:</Text>
              <Text style={styles.metaValue}>{report.teacher.name}</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialIcons name="class" size={18} color="#6B7280" />
              <Text style={styles.metaLabel}>{t("reports.class")}:</Text>
              <Text style={styles.metaValue}>{report.class.class_name}</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialIcons name="schedule" size={18} color="#6B7280" />
              <Text style={styles.metaLabel}>{t("reports.submitted")}:</Text>
              <Text style={styles.metaValue}>{formatDateTime(report.submitted_at)}</Text>
            </View>
          </View>
        </View>

        {/* Statistics Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("reports.statistics")}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
              <Text style={styles.statLabel}>{t("reports.totalWaste")}</Text>
              <Text style={[styles.statValue, { color: "#EF4444" }]}>
                {report.total_waste_kg} kg
              </Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="thumb-up-off-alt" size={24} color="#10B981" />
              <Text style={styles.statLabel}>{t("reports.likes")}</Text>
              <Text style={[styles.statValue, { color: "#10B981" }]}>
                {report.total_likes}
              </Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="thumb-down-off-alt" size={24} color="#F59E0B" />
              <Text style={styles.statLabel}>{t("reports.dislikes")}</Text>
              <Text style={[styles.statValue, { color: "#F59E0B" }]}>
                {report.total_dislikes}
              </Text>
            </View>
          </View>
        </View>

        {/* Verbal Feedback Card - Highlighted */}
        <View style={styles.card}>
          <View style={styles.feedbackHeader}>
            <MaterialIcons name="feedback" size={20} color="#10B981" />
            <Text style={styles.feedbackTitle}>{t("reports.verbalFeedback")}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.feedbackText}>
            {report.verbal_feedback || t("reports.noVerbalFeedback")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Header title={t("reports.reportDetails")} icon="assessment" />
      {renderBody()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  menuName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusSuccess: {
    backgroundColor: "#D1FAE5",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#065F46",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  metaSection: {
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  metaValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065F46",
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#1F2937",
    textAlign: "left",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#6B7280",
  },
});

