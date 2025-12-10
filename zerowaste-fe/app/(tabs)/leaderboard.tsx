import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { fetchLeaderboard, LeaderboardEntry } from "@/lib/analytics";
import Ionicons from "@expo/vector-icons/Ionicons";
import Header from "@/components/ui/header";
import { useTranslation } from "@/hooks/useTranslation";

type Period = "all" | "month" | "week";

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("month");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const PERIOD_LABELS: Record<Period, string> = {
    all: t("leaderboard.allTime"),
    month: t("leaderboard.thisMonth"),
    week: t("leaderboard.thisWeek"),
  };

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchLeaderboard(period);
      setLeaderboard(response.data);
    } catch (err: any) {
      console.error("Failed to fetch leaderboard:", err);
      setError(err.message || t("leaderboard.failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  // Calculate reduction percentage (using averageRating as basis, scaled to percentage)
  const getReductionPercentage = (averageRating: number): number => {
    // Convert 0-5 rating to 0-100% reduction percentage
    return Math.round((averageRating / 5) * 100);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>{t("leaderboard.loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={t("leaderboard.title")} icon="leaderboard" />
      <ScrollView style={styles.scrollView}>


        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("leaderboard.noData")}</Text>
          </View>
        ) : (
           <View style={styles.leaderboardContainer}>
             <View style={styles.headerContainer}>
               <View style={styles.header}>
                 <Text style={styles.title}>{t("leaderboard.ranking")}</Text>
                 <View style={styles.periodSelectorContainer}>
                   <Pressable
                     style={styles.periodSelector}
                     onPress={() => setShowPeriodDropdown(!showPeriodDropdown)}
                   >
                     <Text style={styles.periodText}>{t("leaderboard.period")} {PERIOD_LABELS[period]}</Text>
                     <Ionicons
                       name={showPeriodDropdown ? "chevron-up" : "chevron-down"}
                       size={20}
                       color="#6B7280"
                     />
                   </Pressable>

                   {showPeriodDropdown && (
                     <View style={styles.dropdown}>
                       {(["month", "week", "all"] as Period[]).map((p) => (
                         <Pressable
                           key={p}
                           style={styles.dropdownItem}
                           onPress={() => {
                             setPeriod(p);
                             setShowPeriodDropdown(false);
                           }}
                         >
                           <Text
                             style={[
                               styles.dropdownItemText,
                               period === p && styles.dropdownItemTextActive,
                             ]}
                           >
                             {PERIOD_LABELS[p]}
                           </Text>
                         </Pressable>
                       ))}
                     </View>
                   )}
                 </View>
               </View>
             </View>
            
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              const reductionPercentage = getReductionPercentage(entry.averageRating);
              const score = Math.round(entry.averageRating * 100); // Convert 0-5 rating to 0-500 score

              return (
                <View
                  key={entry.class_id}
                  style={[
                    styles.leaderboardItem,
                    isTopThree ? styles.leaderboardItemTop : styles.leaderboardItemOther,
                  ]}
                >
                  {/* Rank Circle */}
                  <View
                    style={[
                      styles.rankCircle,
                      isTopThree ? styles.rankCircleTop : styles.rankCircleOther,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rankText,
                        isTopThree ? styles.rankTextTop : styles.rankTextOther,
                      ]}
                    >
                      {rank}
                    </Text>
                  </View>

                  {/* Class Info */}
                  <View style={styles.classInfo}>
                    <Text
                      style={[
                        styles.className,
                        isTopThree ? styles.classNameTop : styles.classNameOther,
                      ]}
                    >
                      {entry.class_name}
                    </Text>
                    <Text
                      style={[
                        styles.reductionText,
                        isTopThree ? styles.reductionTextTop : styles.reductionTextOther,
                      ]}
                    >
                      {t("leaderboard.reduction")}: {reductionPercentage}%
                    </Text>
                  </View>

                  {/* Score */}
                  <Text
                    style={[
                      styles.scoreText,
                      isTopThree ? styles.scoreTextTop : styles.scoreTextOther,
                    ]}
                  >
                    {score}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 18,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    position: "relative",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  periodSelectorContainer: {
    position: "relative",
    zIndex: 10,
  },
  periodSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  periodText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginTop: 4,
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#6B7280",
  },
  dropdownItemTextActive: {
    color: "#10B981",
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  leaderboardContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  leaderboardItemTop: {
    backgroundColor: "#F0FDF4",
  },
  leaderboardItemOther: {
    backgroundColor: "#F9FAFB",
  },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankCircleTop: {
    backgroundColor: "#10B981",
  },
  rankCircleOther: {
    backgroundColor: "#9CA3AF",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  rankTextTop: {
    color: "white",
  },
  rankTextOther: {
    color: "white",
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  classNameTop: {
    color: "#111827",
  },
  classNameOther: {
    color: "#111827",
  },
  reductionText: {
    fontSize: 12,
  },
  reductionTextTop: {
    color: "#6B7280",
  },
  reductionTextOther: {
    color: "#9CA3AF",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "700",
  },
  scoreTextTop: {
    color: "#111827",
  },
  scoreTextOther: {
    color: "#6B7280",
  },
});
