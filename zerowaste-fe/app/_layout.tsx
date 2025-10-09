import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

export default function RootLayout() {
  const router = useRouter();
  
  const handleAddSchool = () => {
    router.push('/school-create');
  };

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="schools" 
        options={{
          title: 'Schools',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#10B981',
          },
          headerTintColor: '#fff',
          headerRight: () => (
            <Pressable onPress={handleAddSchool} style={{ marginRight: 16 }}>
              <MaterialIcons name="add" size={24} color="white" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen 
        name="school-detail" 
        options={{
          title: 'School Detail',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#10B981',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="school-create" 
        options={{
          title: 'Create School',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#10B981',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack>
  );
}
