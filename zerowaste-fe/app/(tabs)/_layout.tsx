"use client";

import { Tabs , router } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Image, TouchableOpacity, View } from "react-native";

import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/hooks/useTranslation";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const role = useAppSelector((state) => state.auth.role?.toLowerCase() || null);
  const { t } = useTranslation();

  const handleNavigateToQrScanner = () => {
    router.push("/qr-scanner");
  };

  // Logout is handled inside Profile screen now; header shows Notifications button

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
            <TouchableOpacity onPress={() => router.push('/notifications')}>
              <MaterialIcons name="notifications" size={23} color="#fff" />
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
        name="analytics"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: t("tabs.leaderboard"),
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
          title: t("tabs.feedback"),
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
          title: t("tabs.food"),
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
          title: t("tabs.reports"),
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
          title: t("tabs.settings"),
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
          title: t("tabs.profile"),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person-outline" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
