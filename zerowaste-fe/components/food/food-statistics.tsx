import { StyleSheet, View, Text } from "react-native";
import { Colors } from "@/constants/theme";
import { Menu } from "@/lib/menu";

interface FoodStatisticsProps {
  menus: Menu[];
}

export default function FoodStatistics({ menus }: FoodStatisticsProps) {
  const totalItems = menus.length;
  const activeItems = menus.filter((menu) => menu.is_active).length;

  return (
    <View style={styles.statistics}>
      <View style={styles.totalItem}>
        <Text style={styles.totalItemText}>Total Items</Text>
        <Text style={styles.totalItemValue}>{totalItems}</Text>
      </View>
      <View style={styles.totalItem}>
        <Text style={styles.totalItemText}>Active Items</Text>
        <Text style={styles.totalItemValue}>{activeItems}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statistics: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  totalItem: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  totalItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  totalItemValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
});


