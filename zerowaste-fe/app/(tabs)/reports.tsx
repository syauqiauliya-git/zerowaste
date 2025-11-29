import Header from '@/components/ui/header';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ReportsScreen() {

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <Header title="Reports" icon="assessment" />

      <View style={styles.content}>
        <Text>Reports</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
