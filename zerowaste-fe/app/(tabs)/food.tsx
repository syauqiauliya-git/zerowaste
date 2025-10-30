"use client"

import { useEffect } from "react"
import { useRouter } from "expo-router"
import { getRole } from "@/lib/auth-storage"
import Header from "@/components/ui/header"
import { ScrollView, StyleSheet, View, Text } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"

export default function FoodScreen() {
  const router = useRouter()

  useEffect(() => {
    const checkRole = async () => {
      const userRole = await getRole()
      if (userRole?.toLowerCase() !== "sppg_staff") {
        router.replace("/(tabs)/home")
      }
    }
    checkRole()
  }, [router])

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <Header title="Food Management" icon="restaurant" />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Daily Menu</Text>
        <View style={styles.foodItem}>
          <MaterialIcons name="restaurant-menu" size={24} color="#10B981" />
          <Text style={styles.foodText}>View and manage daily menus</Text>
        </View>

        <Text style={styles.sectionTitle}>Food Waste Reports</Text>
        <View style={styles.foodItem}>
          <MaterialIcons name="assessment" size={24} color="#10B981" />
          <Text style={styles.foodText}>Monitor food waste data</Text>
        </View>

        <Text style={styles.sectionTitle}>School Assignments</Text>
        <View style={styles.foodItem}>
          <MaterialIcons name="assignment" size={24} color="#10B981" />
          <Text style={styles.foodText}>Manage school assignments</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  content: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    marginTop: 16,
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  foodText: {
    fontSize: 15,
    color: "#111827",
    marginLeft: 12,
    flex: 1,
  },
})
