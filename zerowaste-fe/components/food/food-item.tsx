import { StyleSheet, View, Text, Pressable, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Menu } from "@/lib/menu";
import { formatDate } from "@/utils/date";
import { useAppDispatch } from "@/store/hooks";
import { deleteMenu, fetchMenus } from "@/store/slices/menuSlice";

interface FoodItemProps {
  item: Menu;
}

export default function FoodItem({ item }: FoodItemProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleEdit = () => {
    router.push({
      pathname: "/food-edit",
      params: { menuId: item._id },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Menu",
      `Are you sure you want to delete "${item.nama_menu}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteMenu(item._id)).unwrap();
              // Refresh the menu list after deletion
              dispatch(fetchMenus());
            } catch (error: any) {
              Alert.alert("Error", error?.message || "Failed to delete menu");
            }
          },
        },
      ]
    );
  };
  return (
    <View style={styles.foodItem}>
      <View style={styles.foodItemContent}>
        <View style={styles.foodItemContentItem}>
          <Text style={styles.foodItemText}>{item.nama_menu}</Text>
          <View>
            {item.is_active ? (
              <MaterialIcons name="check-circle" size={15} color="#10B981" />
            ) : (
              <MaterialIcons name="cancel" size={15} color="#10B981" />
            )}
          </View>
        </View>
        <View style={styles.foodInformationContainer}>
          <View>
            <Text style={styles.foodItemContentItemText}>Date</Text>
            <Text>{formatDate(item.menu_date)}</Text>
          </View>
          <View>
            <Text style={styles.foodItemContentItemText}>School</Text>
            <Text>
              {typeof item.school === "object" && item.school !== null
                ? item.school.school_name
                : "N/A"}
            </Text>
          </View>
          <View>
            <Text style={styles.foodItemContentItemText}>Rating</Text>
            <Text>{item.rating}</Text>
          </View>
        </View>
      </View>
      <View style={styles.foodItemActions}>
        <Pressable onPress={handleEdit}>
          <MaterialIcons name="edit" size={23} color="#111827" />
        </Pressable>
        <Pressable onPress={handleDelete}>
          <MaterialIcons name="delete" size={23} color="#EF4444" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  foodItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  foodItemText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  foodItemContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  foodItemContentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  foodItemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 13,
  },
  foodItemContentItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  foodInformationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
  },
});

