"use client";

import { Tabs } from "expo-router";
import { useEffect, useState } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "react-native";
import { getRole } from "@/lib/auth-storage";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    getRole().then((userRole) => {
      setRole(userRole?.toLowerCase() || null);
    });
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: true,
        headerTitle: "",
        headerLeft: () => (
          <Image
            source={require("../../assets/images/zerowaste-logo.png")}
            style={{ width: 122, height: 32, marginLeft: 15 }}
            resizeMode="contain"
          />
        ),
        headerStyle: {
          backgroundColor: "#10B981",
        },
        tabBarButton: HapticTab,
      }}
    >
      {/* Common tabs for all roles */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          // Hide leaderboard for SPPG staff per requirement
          href: role === "sppg_staff" ? null : undefined,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="medal" size={26} color={color} />
          ),
        }}
      />

      {/* Role-gated tabs: always declare, hide with href when not allowed */}
      <Tabs.Screen
        name="feedback"
        options={{
          title: "Feedback",
          // Only teachers can see this tab
          href: role === "teacher" ? undefined : null,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="feedback" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="food"
        options={{
          title: "Food",
          // Only SPPG staff can see this tab
          href: role === "sppg_staff" ? undefined : null,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="restaurant" size={28} color={color} />
          ),
        }}
      />

      {/* Settings tab: only for admin */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          href: role === "admin" ? undefined : null,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={28} color={color} />
          ),
        }}
      />

      {/* Profile tab for all roles */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person-outline" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
