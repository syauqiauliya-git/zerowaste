import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { useEffect, useState } from "react";
import { getRole } from "@/lib/auth-storage";

export default function RootLayout() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  const handleAddSchool = () => {
    router.push("/school-create");
  };

  useEffect(() => {
    getRole().then((role) => {
      console.log("Role:", role);
      setRole(role);
    });
  }, []);

  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="schools"
          options={{
            title: "Schools",
            presentation: "modal",
            headerStyle: {
              backgroundColor: "#10B981",
            },
            headerTintColor: "#fff",
            headerRight: () =>
              role && role === "admin" ? (
                <Pressable
                  onPress={handleAddSchool}
                  style={{ marginRight: 16 }}
                >
                  <MaterialIcons name="add" size={24} color="white" />
                </Pressable>
              ) : null,
          }}
        />
        <Stack.Screen
          name="school-detail"
          options={{
            title: "School Detail",
            presentation: "modal",
            headerStyle: {
              backgroundColor: "#10B981",
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="school-create"
          options={{
            title: "Create School",
            presentation: "modal",
            headerStyle: {
              backgroundColor: "#10B981",
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="class-create"
          options={{
            title: "Create Class",
            presentation: "modal",
            headerStyle: {
              backgroundColor: "#10B981",
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="class-detail"
          options={{
            title: "Class Detail",
            presentation: "modal",
            headerStyle: {
              backgroundColor: "#10B981",
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="menu-create"
          options={{
            title: "Create Menu",
            presentation: "modal",
            headerStyle: {
              backgroundColor: "#10B981",
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="menu/[id]"
          options={{
            title: "Menu Detail",
            presentation: "modal",
            headerStyle: {
              backgroundColor: "#10B981",
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="menu/[id]/edit"
          options={{
            title: "Edit Menu",
            presentation: "modal",
            headerStyle: {
              backgroundColor: "#10B981",
            },
            headerTintColor: "#fff",
          }}
        />
      </Stack>
    </Provider>
  );
}
