import { Report } from "@/lib/report";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Ensure you have this installed


// Helper to format date nicely
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

interface RenderReportItemProps {
  item: Report;
  onPress?: (item: Report) => void;
}

const renderReportItem = ({ item, onPress }: RenderReportItemProps) => {
  const content = (
    <>
      {/* Header: Menu Name & Status */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.menuName}>{item.menu.nama_menu}</Text>
          <Text style={styles.dateText}>{formatDate(item.report_date)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === "submitted"
              ? styles.statusSuccess
              : styles.statusPending,
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {/* Sub-Header: Teacher & Class */}
      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <MaterialIcons name="person-outline" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{item.teacher.name}</Text>
        </View>
        <View style={styles.metaSeparator} />
        <View style={styles.metaItem}>
          <MaterialIcons name="class" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{item.class.class_name}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        {/* Waste Stat */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Waste</Text>
          <View style={styles.statValueContainer}>
            <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
            <Text style={[styles.statValue, { color: "#EF4444" }]}>
              {item.total_waste_kg} kg
            </Text>
          </View>
        </View>

        {/* Likes Stat */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Likes</Text>
          <View style={styles.statValueContainer}>
            <MaterialIcons name="thumb-up-off-alt" size={18} color="#10B981" />
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {item.total_likes}
            </Text>
          </View>
        </View>

        {/* Dislikes Stat */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Dislikes</Text>
          <View style={styles.statValueContainer}>
            <MaterialIcons
              name="thumb-down-off-alt"
              size={18}
              color="#F59E0B"
            />
            <Text style={[styles.statValue, { color: "#F59E0B" }]}>
              {item.total_dislikes}
            </Text>
          </View>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable style={styles.card} onPress={() => onPress(item)}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
};

export default renderReportItem;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3, // Android shadow
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  menuName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusSuccess: {
    backgroundColor: "#D1FAE5",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#065F46", // Dark green text for success
    textTransform: "capitalize",
  },

  // Meta Data (Teacher/Class)
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 4,
  },
  metaSeparator: {
    width: 1,
    height: 12,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 12,
  },

  // Stats Grid
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
  },
});
