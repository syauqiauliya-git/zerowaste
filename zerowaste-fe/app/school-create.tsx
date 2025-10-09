import { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from 'expo-router';
import Header from '@/components/ui/header';
import API_BASE_URL from "@/constants/api";

export default function SchoolCreateScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [classCount, setClassCount] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async () => {
    const name = schoolName.trim();
    const addr = address.trim();
    if (name.length === 0 || addr.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      setIsLoading(true);
      console.log('Creating school:', { school_name: name, address: addr, jml_murid: studentCount, jml_kelas: classCount });
      const response = await fetch(`${API_BASE_URL}/schools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ school_name: name, address: addr, jml_murid: studentCount, jml_kelas: classCount }),
      });
      const data = await response.json();
      console.log(data);
      router.back();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Header title="Create School" icon="school" />

        <View style={styles.container}>
          <View style={styles.formControl}>
            <Text style={styles.label}>School Name</Text>
            <TextInput
              style={styles.inputContainer}
              value={schoolName}
              onChangeText={setSchoolName}
              placeholder="Enter school name"
            />
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>Number of Students</Text>
            <TextInput
              style={styles.inputContainer}
              value={studentCount}
              onChangeText={setStudentCount}
              placeholder="Enter number of students"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>Number of Classes</Text>
            <TextInput
              style={styles.inputContainer}
              value={classCount}
              onChangeText={setClassCount}
              placeholder="Enter number of classes"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.inputContainer, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter school address"
              multiline
              numberOfLines={3}
            />
          </View>

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Create</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  container: {
    gap: 16,
    paddingBottom: 20,
  },
  formControl: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
