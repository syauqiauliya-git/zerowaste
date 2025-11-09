import { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert, Switch } from "react-native";
import { useRouter, useFocusEffect } from 'expo-router';
import Header from '@/components/ui/header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createMenu } from '@/store/slices/menuSlice';
import { fetchSchools } from '@/store/slices/schoolSlice';
import { getSppgId } from '@/lib/auth-storage';
import { School } from '@/lib/school';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';

const SELECTED_SCHOOL_KEY = "selected_school_id";

export default function FoodCreateScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.menus);
  const { schools } = useAppSelector((state) => state.schools);
  
  const [selectedSppg, setSelectedSppg] = useState<string>("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [namaMenu, setNamaMenu] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState("");
  const [protein, setProtein] = useState("");
  const [lemak, setLemak] = useState("");
  const [karbohidrat, setKarbohidrat] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Load selected school from storage
  const loadSelectedSchool = useCallback(async () => {
    try {
      const storedSchoolId = await SecureStore.getItemAsync(SELECTED_SCHOOL_KEY);
      if (storedSchoolId) {
        setSelectedSchoolId(storedSchoolId);
        // Use Redux state to find the school
        const school = schools.find((s) => s._id === storedSchoolId);
        if (school) {
          setSelectedSchool(school);
        }
      }
    } catch (err) {
      console.error("Failed to get selected school:", err);
    }
  }, [schools]);

  useEffect(() => {
    // Fetch schools if not already loaded
    if (schools.length === 0) {
      dispatch(fetchSchools());
    }
    // Load SPPG ID from storage
    const loadSppgId = async () => {
      const sppgId = await getSppgId();
      if (sppgId) {
        setSelectedSppg(sppgId);
      }
    };
    loadSppgId();
  }, [dispatch, schools.length]);

  // Load selected school when schools are available
  useEffect(() => {
    if (schools.length > 0) {
      loadSelectedSchool();
    }
  }, [schools, loadSelectedSchool]);

  // Check for selected school when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSelectedSchool();
    }, [loadSelectedSchool])
  );

  const handleSelectSchool = () => {
    router.push({
      pathname: "/school-select",
      params: { 
        schoolId: selectedSchoolId || "",
        returnPath: "/food-create"
      }
    });
  };

  const handleSubmit = async () => {
    const nama = namaMenu.trim();
    
    if (!selectedSppg || !selectedSchoolId || nama.length === 0) {
      Alert.alert("Validation Error", "Please fill in all required fields (School and Menu Name).");
      return;
    }
    
    try {
      const menuData = {
        sppg: selectedSppg,
        school: selectedSchoolId,
        menu_date: new Date().toISOString().split('T')[0],
        nama_menu: nama,
        deskripsi: deskripsi.trim() || undefined,
        rating: 0,
        harga: harga ? parseFloat(harga) : 0,
        protein: protein ? parseFloat(protein) : 0,
        lemak: lemak ? parseFloat(lemak) : 0,
        karbohidrat: karbohidrat ? parseFloat(karbohidrat) : 0,
        is_active: isActive,
      };

      console.log('Menu data: ', menuData);
      
      const result = await dispatch(createMenu(menuData)).unwrap();
      console.log('Menu created successfully:', result);
      router.back();
    } catch (error: any) {
      console.error('Failed to create menu:', error);
      Alert.alert("Error", error.message || "Something went wrong!");
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
        <Header title="Create Menu" icon="restaurant" />

        <View style={styles.container}>
          <View style={styles.formControl}>
            <Text style={styles.label}>School <Text style={styles.required}>*</Text></Text>
            <Pressable
              style={styles.selectButton}
              onPress={handleSelectSchool}
            >
              <Text style={[styles.selectText, !selectedSchool && styles.selectPlaceholder]}>
                {schools.length === 0 
                  ? "No school selected" 
                  : selectedSchool 
                    ? selectedSchool.school_name 
                    : "Select a school"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#6B7280"
              />
            </Pressable>
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>Menu Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.inputContainer}
              value={namaMenu}
              onChangeText={setNamaMenu}
              placeholder="Enter menu name"
            />
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.inputContainer, styles.textArea]}
              value={deskripsi}
              onChangeText={setDeskripsi}
              placeholder="Enter menu description"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Harga (Rp)</Text>
              <TextInput
                style={styles.inputContainer}
                value={harga}
                onChangeText={setHarga}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                style={styles.inputContainer}
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Lemak (g)</Text>
              <TextInput
                style={styles.inputContainer}
                value={lemak}
                onChangeText={setLemak}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Karbohidrat (g)</Text>
              <TextInput
                style={styles.inputContainer}
                value={karbohidrat}
                onChangeText={setKarbohidrat}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formControl}>
            <Pressable
              style={[
                styles.checkboxContainer,
                isActive && styles.checkboxSelected
              ]}
              onPress={() => setIsActive(!isActive)}
            >
              <Text style={styles.checkboxLabel}>Active</Text>
              <View style={[styles.checkbox, isActive && styles.checkboxChecked]}>
                {isActive && <Text style={styles.checkboxCheckmark}>✓</Text>}
              </View>
            </Pressable>
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create'}</Text>
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
  required: {
    color: '#EF4444',
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
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  selectPlaceholder: {
    color: '#9CA3AF',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  checkboxSelected: {
    borderColor: '#10B981',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxCheckmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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

