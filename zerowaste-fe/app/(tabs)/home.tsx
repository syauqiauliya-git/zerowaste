import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Entypo } from '@expo/vector-icons';
import { useEffect } from 'react';
import { getToken } from '@/lib/auth-storage';

export default function HomeScreen() {
  const router = useRouter();

  const handleSchoolsPress = () => {
    router.push('/schools');
  };

  useEffect(() => {
  getToken().then(token => {
    console.log('JWT Token:', token);
  });
}, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
        <Pressable style={styles.schoolButton} onPress={handleSchoolsPress}>
          <LinearGradient
            colors={["#059669", "#10B981", "#059669"]}
            start={{ x: -0.1, y: 0.5 }}
            end={{ x: 1.1, y: 0.5 }}
            style={styles.gradient}
          >
            <Text style={styles.headerTitle}>Schools</Text>
            <Entypo name="chevron-thin-right" size={24} color="white" />
          </LinearGradient>
        </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
  },
  schoolContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  schoolButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  schoolItem: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
});
