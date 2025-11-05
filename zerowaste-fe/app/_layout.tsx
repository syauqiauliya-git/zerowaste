import { Stack, useRouter } from "expo-router";
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { useEffect, useState } from "react";
import { getRole } from "@/lib/auth-storage";

export default function RootLayout() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  
  const handleAddSchool = () => {
    router.push('/school-create');
  };

  useEffect(() => {
    getRole().then(role => {
        console.log('Role:', role);
        setRole(role);
      });
    }, []);

  return (
    <Provider store={store}>
      <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
      <Stack.Screen 
        name="class-create" 
        options={{
          title: 'Create Class',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#10B981',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="class-detail" 
        options={{
          title: 'Class Detail',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#10B981',
          },
          headerTintColor: '#fff',
        }}
      />
      </Stack>
    </Provider>
  );
}
