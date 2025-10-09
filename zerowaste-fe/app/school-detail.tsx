import { Alert, Button, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@react-navigation/elements';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '@/components/ui/header';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import API_BASE_URL from '@/constants/api';

export default function SchoolDetailScreen() {
  const { schoolId } = useLocalSearchParams();
  const router = useRouter();
  const [schoolDetail, setSchoolDetail] = useState<any>(null);
  
  const handleDelete = () => {
    alert("Are you sure you want to delete this school?");
  };

  const fetchSchoolDetail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/schools/${schoolId}`);
      const data = await response.json();
      console.log('School detail response:', data.data.school);
      setSchoolDetail(data.data.school);
    } catch (error) {
      console.error('Failed to fetch school detail:', error);
    }
  };

  const handleEdit = () => {
    console.log('Editing school');
  };

  useEffect(() => {
    fetchSchoolDetail();
  }, [schoolId]);

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
        <Header title="School Details" icon="school" />

        <View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>School Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{schoolDetail?.school_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{schoolDetail?.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Number of Students:</Text>
              <Text style={styles.value}>{schoolDetail?.jml_murid}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Number of Classes:</Text>
              <Text style={styles.value}>{schoolDetail?.jml_kelas}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Created At:</Text>
              <Text style={styles.value}>{schoolDetail?.created_at ? new Date(schoolDetail.created_at).toLocaleDateString() : '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Updated At:</Text>
              <Text style={styles.value}>{schoolDetail?.updatedAt ? new Date(schoolDetail.updatedAt).toLocaleDateString() : '-'}</Text>
            </View>
          </View>

          <View style={styles.sectionButtons}>
          <Pressable style={[styles.button, { backgroundColor: '#EF4444' }]} onPress={handleDelete} >
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: '#10B981' }]} onPress={handleEdit} >
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
          </View>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#059669',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    width: 80,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    minWidth: 120,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionButtons: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
