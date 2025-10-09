import { Alert, Button, Pressable, ScrollView, StyleSheet, View, TextInput } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    school_name: '',
    address: '',
    jml_murid: '',
    jml_kelas: '',
  });

  const handleDelete = () => {
    alert("Are you sure you want to delete this school?");
  };

  const fetchSchoolDetail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/schools/${schoolId}`);
      const data = await response.json();
      console.log('School detail response:', data.data.school);
      const school = data.data.school;
      setSchoolDetail(school);
      setEditData({
        school_name: school.school_name || '',
        address: school.address || '',
        jml_murid: school.jml_murid?.toString() || '',
        jml_kelas: school.jml_kelas?.toString() || '',
      });
    } catch (error) {
      console.error('Failed to fetch school detail:', error);
    }
  };

  const handleSave = async () => {
    if (!editData.school_name.trim() || !editData.address.trim() || !editData.jml_murid.trim() || !editData.jml_kelas.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/schools/${schoolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          school_name: editData.school_name,
          address: editData.address,
          jml_murid: parseInt(editData.jml_murid) || 0,
          jml_kelas: parseInt(editData.jml_kelas) || 0,
        }),
      });
      const data = await response.json();
      console.log('Update response:', data);
      setSchoolDetail(data.data.school);
      router.back();
    } catch (error) {
      console.error('Failed to update school:', error);
      alert('Failed to update school');
    } finally {
      setIsLoading(false);
    }
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
            <TextInput
              style={styles.input}
              value={editData.school_name}
              onChangeText={(text) => setEditData({ ...editData, school_name: text })}
              placeholder="Enter school name"
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Address:</Text>
            <TextInput
              style={styles.input}
              value={editData.address}
              onChangeText={(text) => setEditData({ ...editData, address: text })}
              placeholder="Enter address"
              multiline
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Number of Students:</Text>
            <TextInput
              style={styles.input}
              value={editData.jml_murid}
              onChangeText={(text) => setEditData({ ...editData, jml_murid: text })}
              placeholder="Enter number of students"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Number of Classes:</Text>
            <TextInput
              style={styles.input}
              value={editData.jml_kelas}
              onChangeText={(text) => setEditData({ ...editData, jml_kelas: text })}
              placeholder="Enter number of classes"
              keyboardType="numeric"
            />
          </View>
           <View style={styles.infoRow}>
             <Text style={styles.label}>Created At:</Text>
             <Text style={styles.value}>{schoolDetail?.created_at ? new Date(schoolDetail.created_at).toLocaleString() : '-'}</Text>
           </View>
           <View style={styles.infoRow}>
             <Text style={styles.label}>Updated At:</Text>
             <Text style={styles.value}>{schoolDetail?.updatedAt ? new Date(schoolDetail.updatedAt).toLocaleString() : '-'}</Text>
           </View>
        </View>

        <View style={styles.sectionButtons}>
          <Pressable style={[styles.button, { backgroundColor: '#EF4444' }]} onPress={handleDelete} >
            <Text style={styles.buttonText}>Delete</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { backgroundColor: '#10B981' }, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Save'}</Text>
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
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    marginLeft: 8,
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
  buttonDisabled: {
    opacity: 0.7,
  },
});
