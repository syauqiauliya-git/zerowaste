import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@react-navigation/elements';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import API_BASE_URL from '@/constants/api';

export default function SchoolsScreen() {
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
    console.log('Navigating to school detail with ID:', schoolId);
    router.push({
      pathname: '/school-detail',
      params: {
        schoolId: schoolId,
      },
    });
  };

  const renderSchoolItem = ({ item }: { item: { _id: string; school_name: string; address: string } }) => {
    return (
      <Pressable style={styles.schoolItem} onPress={() => handleSchoolPress(item._id)}>
        <Text style={{ fontWeight: 'bold' }}>{item.school_name}</Text>
        <Text style={{ fontWeight: 'thin', fontSize: 12 }}>{item.address}</Text>
      </Pressable>
    );
  };

  return (
    <ScrollView 
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.schoolContainer}>
        {schools.length === 0 ? (
          <View style={styles.schoolItem}>
            <Text>No schools found</Text>
          </View>
        ) : (
          <FlatList
            data={schools}
            renderItem={renderSchoolItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} 
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  schoolContainer: {
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 3,
  },
  schoolHeader: {
    backgroundColor: '#10B981',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  schoolItem: {
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});
