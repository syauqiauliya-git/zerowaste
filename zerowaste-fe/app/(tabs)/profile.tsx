import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { logout } from '@/lib/auth';
import { getToken } from '@/lib/auth-storage';

export default function TabTwoScreen() {
  const handleLogout = async () => {
    await logout();
    console.log("User logged out");
    const token = await getToken();
    console.log('Token after logout:', token);
    router.replace("/");
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<MaterialIcons name="home" size={28} color="#808080" />}
    >
      <View style={styles.container}>
        <Text>Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  logoutButton: {
    backgroundColor: "red",
    padding: 16,
    borderRadius: 10,
    marginTop: 24,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
