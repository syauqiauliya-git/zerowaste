import { ScrollView, StyleSheet, Text } from 'react-native';

export default function TabTwoScreen() {
  return (
    <ScrollView>
      <Text>Feedback</Text>
    </ScrollView>
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
});
