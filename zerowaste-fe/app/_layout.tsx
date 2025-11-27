import { Stack } from "expo-router";
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { TokenMonitor } from '../components/auth/token-monitor';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <TokenMonitor>
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
            name="sppg-create"
            options={{
              title: 'Create SPPG',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: '#10B981',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="sppg-detail"
            options={{
              title: 'SPPG Detail',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: '#10B981',
              },
              headerTintColor: '#fff',
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
          <Stack.Screen
            name="food-create"
            options={{
              title: 'Create Menu',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: '#10B981',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="food-edit"
            options={{
              title: 'Edit Menu',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: '#10B981',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="food-detail"
            options={{
              title: 'Menu Detail',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: '#10B981',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="qr-scanner"
            options={{
              title: 'QR Scanner',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: '#10B981',
              },
              headerTintColor: '#fff',
            }}
          />
        </Stack>
      </TokenMonitor>
    </Provider>
  );
}
