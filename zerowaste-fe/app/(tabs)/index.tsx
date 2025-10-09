import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import API_BASE_URL from '@/constants/api';

export default function HomeScreen() {
  const router = useRouter();
  const [schools, setSchools] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchools = async () => {
    try {
      console.log('Fetching schools from:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/schools`);
      const data = await response.json();
      console.log('Schools fetched:', data.data.schools);
      setSchools(data.data.schools);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchools();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSchoolPress = (schoolId: string) => {
    router.push({
      pathname: '/school-detail',
      params: {
        schoolId: schoolId,
      },
    });
  };

  const renderSchoolItem = (item: { item: { id: string; school_name: string } }) => (
    <Pressable style={styles.schoolItem} onPress={() => handleSchoolPress(item.item.id)} key={item.item.id}>
      <Text style={{ fontWeight: 'bold' }}>{item.item.school_name}</Text>
    </Pressable>
  );

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
        <View style={styles.schoolContainer}>
          <View style={styles.schoolHeader}>
            <LinearGradient
              colors={["#059669", "#10B981", "#059669"]}
              start={{ x: -0.1, y: 0.5 }}
              end={{ x: 1.1, y: 0.5 }}
              style={styles.gradient}
            >
              <Text style={styles.headerTitle}>Schools</Text>
            </LinearGradient>
          </View>
          {schools.length === 0 ? (
            <View style={styles.schoolItem}>
              <Text>No schools found</Text>
            </View>
          ) : (
            <FlatList
              data={schools}
              renderItem={renderSchoolItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
    maxHeight: 300,
  },
  gradient: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 400,
    maxHeight: 400,
    padding: 15,
    flexDirection: 'row',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  schoolContainer: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  schoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  schoolItem: {
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
