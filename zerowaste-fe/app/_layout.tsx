import { Stack, useRouter } from "expo-router";
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { useEffect } from "react";
import { fetchRole } from '../store/slices/authSlice';

export default function RootLayout() {
  const router = useRouter();
  
  const handleAddSchool = () => {
    router.push('/school-create');
  };

  useEffect(() => {
    store.dispatch(fetchRole()).then((result) => {
      if (fetchRole.fulfilled.match(result)) {
        console.log('Role:', result.payload);
      }
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
      <Stack.Screen 
        name="school-select" 
        options={{
          title: 'Select School',
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
