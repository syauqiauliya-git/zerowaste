import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Entypo } from '@expo/vector-icons';
import { useEffect } from 'react';
import { getToken } from '@/lib/auth-storage';
import { useAppSelector } from '@/store/hooks';

export default function HomeScreen() {
  const router = useRouter();
  const role = useAppSelector((state) => state.auth.role?.toLowerCase() || null);

  return (
    <View style={styles.mainView}>
      {role === "admin" ? (
        <View style={styles.adminView}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text>Select a tab below to manage your system</Text>
        </View>
      ) : (
        <View style={styles.userView}>
          <Text style={styles.title}>Dashboard</Text>
          <Text>Select a tab below to manage your system</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  adminView: {
    alignItems: 'center',
  },
  userView: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    paddingVertical: 10,
  },
});
