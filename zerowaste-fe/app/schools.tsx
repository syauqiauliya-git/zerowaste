import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@react-navigation/elements';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSchools, School } from '@/store/slices/schoolSlice';
import { getToken } from '@/lib/auth-storage';

export default function SchoolsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { schools, loading } = useAppSelector((state) => state.schools);

  const onRefresh = async () => {
    dispatch(fetchSchools());
    console.log('Refreshing schools: ', schools);
  };

  useEffect(() => {
    dispatch(fetchSchools());
    getToken().then(token => {
        console.log('JWT Token (school):', token);
      });
  }, [dispatch]);

  const handleSchoolPress = (schoolId: string) => {
    console.log('Navigating to school detail with ID:', schoolId);
    router.push({
      pathname: '/school-detail',
      params: {
        schoolId: schoolId,
      },
    });
  };

  const renderSchoolItem = ({ item }: { item: School }) => {
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
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
      <View style={styles.schoolContainer}>
        {schools.length === 0 ? (
          <View key="no-schools" style={styles.schoolItem}>
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
