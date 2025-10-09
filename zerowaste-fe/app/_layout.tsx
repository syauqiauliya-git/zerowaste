import { Image } from "expo-image";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="school-detail" 
        options={{
          title: '',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#10B981',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="school-edit" 
        options={{
          title: '',
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
