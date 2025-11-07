import { StyleSheet, Text, View } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabTwoScreen() {

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<MaterialIcons name="home" size={28} color="#808080" />}
    >
      <View style={styles.container}>
        <Text>Profile</Text>
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
});
