import { useEffect, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Menu } from "@/lib/menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMenus } from "@/store/slices/menuSlice";
import FoodItem from "@/components/food/food-item";
import FoodStatistics from "@/components/food/food-statistics";
import { useTranslation } from "@/hooks/useTranslation";

export default function FoodScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { menus: foodList, loading } = useAppSelector((state) => state.menus);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMenus());
    }, [dispatch])
  );

  const renderFoodItem = ({ item }: { item: Menu }) => {
    return (<FoodItem item={item} />);
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>{t("food.title")}</Text>
          <Text>{t("food.subtitle")}</Text>
        </View>

        <Pressable
          style={styles.addFoodButton}
          onPress={() => router.push("/food-create")}
        >
          <Text style={styles.addFoodButtonText}>+ {t("food.addFood")}</Text>
        </Pressable>
      </View>

      <FoodStatistics menus={foodList} />

      <View style={styles.foodList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>{t("food.loadingMenus")}</Text>
          </View>
        ) : foodList.length === 0 ? (
          <Text style={styles.emptyText}>{t("food.noFoodFound")}</Text>
        ) : (
          foodList.map((item, index) => (
            <View key={item._id}>
              {index > 0 && <View style={styles.separator} />}
              {renderFoodItem({ item })}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  addFoodButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  addFoodButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  foodList: {
    marginBottom: 26,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#6B7280",
  },
  separator: {
    height: 12,
  },
});
