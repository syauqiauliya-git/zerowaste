"use client";

import { Tabs } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, TouchableOpacity, Alert, View } from "react-native";
import { logout } from "@/lib/auth";
import { router } from "expo-router";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearRole } from "@/store/slices/authSlice";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.role?.toLowerCase() || null);

  const handleNavigateToQrScanner = () => {
    router.push("/qr-scanner");
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            dispatch(clearRole());
            console.log("User logged out");
            router.replace("/");
          },
        },
      ]
    );
  };

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
        headerRight: () => (
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              alignItems: "center",
              marginRight: 20,
            }}
          >
            {role === "teacher" && (
              <TouchableOpacity
                onPress={handleNavigateToQrScanner}
                style={{
                  marginRight: 16,
                }}
              >
                <MaterialIcons name="qr-code-scanner" size={23} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleLogout}>
              <MaterialIcons name="logout" size={23} color="#fff" />
            </TouchableOpacity>
          </View>
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

      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          // Only SPPG staff can see this tab
          href: role === "sppg_staff" ? undefined : null,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="assessment" size={28} color={color} />
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
