import { Stack } from "expo-router";
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { TokenMonitor } from '../components/auth/token-monitor';
import { LanguageInitializer } from '../components/language-initializer';
import { useTranslation } from '@/hooks/useTranslation';

function StackNavigator() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="school-detail"
        options={{
          title: t('layout.schoolDetail'),
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
          title: t('layout.createSchool'),
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
          title: t('layout.createClass'),
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
          title: t('layout.classDetail'),
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
          title: t('layout.createSPPG'),
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
          title: t('layout.sppgDetail'),
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
          title: t('layout.selectSchool'),
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#10B981',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="sppg-select"
        options={{
          title: t('layout.selectSPPG'),
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
          title: t('layout.createMenu'),
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
          title: t('layout.editMenu'),
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
          title: t('layout.menuDetail'),
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
          title: t('layout.qrScanner'),
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#10B981',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: t('layout.backToHome'),
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#10B981',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="report-detail"
        options={{
          title: 'Report Details',
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

export default function RootLayout() {
  return (
    <Provider store={store}>
      <LanguageInitializer>
        <TokenMonitor>
          <StackNavigator />
        </TokenMonitor>
      </LanguageInitializer>
    </Provider>
  );
}
