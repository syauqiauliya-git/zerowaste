"use client"

import { useEffect } from "react"
import { useRouter } from "expo-router"
import { getRole } from "@/lib/auth-storage"
import Header from "@/components/ui/header"
import { ScrollView, StyleSheet, View, Text, Pressable } from "react-native"
import { useState } from "react"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"

export default function SettingsScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"school" | "class" | "user">("school")

  useEffect(() => {
    const checkRole = async () => {
      const userRole = await getRole()
      if (userRole?.toLowerCase() !== "admin") {
        router.replace("/(tabs)/home")
      }
    }
    checkRole()
  }, [router])

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <Header title="Settings" icon="settings" />

      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "school" && styles.activeTab]}
          onPress={() => setActiveTab("school")}
        >
          <Text style={[styles.tabText, activeTab === "school" && styles.activeTabText]}>School</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "class" && styles.activeTab]}
          onPress={() => setActiveTab("class")}
        >
          <Text style={[styles.tabText, activeTab === "class" && styles.activeTabText]}>Class</Text>
        </Pressable>
        <Pressable style={[styles.tab, activeTab === "user" && styles.activeTab]} onPress={() => setActiveTab("user")}>
          <Text style={[styles.tabText, activeTab === "user" && styles.activeTabText]}>User</Text>
        </Pressable>
      </View>

      {/* School Settings */}
      {activeTab === "school" && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>School Settings</Text>
          <View style={styles.settingItem}>
            <MaterialIcons name="school" size={24} color="#10B981" />
            <Text style={styles.settingText}>Manage school information</Text>
          </View>
        </View>
      )}

      {/* Class Settings */}
      {activeTab === "class" && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Class Settings</Text>
          <View style={styles.settingItem}>
            <MaterialIcons name="class" size={24} color="#10B981" />
            <Text style={styles.settingText}>Manage class information</Text>
          </View>
        </View>
      )}

      {/* User Settings & Account Approvals */}
      {activeTab === "user" && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>User Management</Text>
          <View style={styles.settingItem}>
            <MaterialIcons name="person-add" size={24} color="#10B981" />
            <Text style={styles.settingText}>Pending Account Approvals</Text>
          </View>
          <View style={styles.settingItem}>
            <MaterialIcons name="people" size={24} color="#10B981" />
            <Text style={styles.settingText}>Manage user accounts</Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  tabContainer: {
    flexDirection: "row",
    marginVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#10B981",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#10B981",
  },
  content: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  settingText: {
    fontSize: 15,
    color: "#111827",
    marginLeft: 12,
    flex: 1,
  },
})
