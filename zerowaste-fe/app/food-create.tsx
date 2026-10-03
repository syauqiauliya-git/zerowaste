import { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert, Switch, Modal } from "react-native";
import { useRouter, useFocusEffect } from 'expo-router';
import Header from '@/components/ui/header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createMenu } from '@/store/slices/menuSlice';
import { fetchSchools } from '@/store/slices/schoolSlice';
import { getSppgId } from '@/lib/auth-storage';
import { School } from '@/lib/school';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from '@/hooks/useTranslation';

const SELECTED_SCHOOL_KEY = "selected_school_id";

// Helper function to format date as YYYY-MM-DD in local timezone
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function FoodCreateScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
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
  const [menuDate, setMenuDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      Alert.alert(t("food.validationError"), t("food.fillRequiredFields"));
      return;
    }
    
    try {
      const menuData = {
        sppg: selectedSppg,
        school: selectedSchoolId,
        menu_date: formatDateLocal(menuDate),
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
      Alert.alert(t("common.error"), error.message || t("food.somethingWentWrong"));
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
        <Header title={t("food.createMenu")} icon="restaurant" />

        <View style={styles.container}>
          <View style={styles.formControl}>
            <Text style={styles.label}>{t("food.school")} <Text style={styles.required}>*</Text></Text>
            <Pressable
              style={styles.selectButton}
              onPress={handleSelectSchool}
            >
              <Text style={[styles.selectText, !selectedSchool && styles.selectPlaceholder]}>
                {schools.length === 0 
                  ? t("food.noSchoolSelected")
                  : selectedSchool 
                    ? selectedSchool.school_name 
                    : t("food.selectSchool")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#6B7280"
              />
            </Pressable>
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>{t("food.menuDate")} <Text style={styles.required}>*</Text></Text>
            <Pressable
              style={styles.selectButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.selectText}>
                {menuDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#6B7280"
              />
            </Pressable>
            {Platform.OS === 'ios' ? (
              <Modal
                visible={showDatePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Pressable onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.modalButton}>{t("food.cancel")}</Text>
                      </Pressable>
                      <Text style={styles.modalTitle}>{t("food.selectDate")}</Text>
                      <Pressable
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={[styles.modalButton, styles.modalButtonDone]}>{t("food.done")}</Text>
                      </Pressable>
                    </View>
                    <DateTimePicker
                      value={menuDate}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setMenuDate(selectedDate);
                        }
                      }}
                      maximumDate={new Date()}
                      style={styles.datePicker}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              showDatePicker && (
                <DateTimePicker
                  value={menuDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type !== 'dismissed' && selectedDate) {
                      setMenuDate(selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                />
              )
            )}
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>{t("food.menuName")} <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.inputContainer}
              value={namaMenu}
              onChangeText={setNamaMenu}
              placeholder={t("food.enterMenuName")}
            />
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>{t("food.description")}</Text>
            <TextInput
              style={[styles.inputContainer, styles.textArea]}
              value={deskripsi}
              onChangeText={setDeskripsi}
              placeholder={t("food.enterDescription")}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t("food.price")} (Rp)</Text>
              <TextInput
                style={styles.inputContainer}
                value={harga}
                onChangeText={setHarga}
                placeholder={t("food.enterPrice")}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t("food.protein")} (g)</Text>
              <TextInput
                style={styles.inputContainer}
                value={protein}
                onChangeText={setProtein}
                placeholder={t("food.enterProtein")}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t("food.fat")} (g)</Text>
              <TextInput
                style={styles.inputContainer}
                value={lemak}
                onChangeText={setLemak}
                placeholder={t("food.enterFat")}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t("food.carbohydrate")} (g)</Text>
              <TextInput
                style={styles.inputContainer}
                value={karbohidrat}
                onChangeText={setKarbohidrat}
                placeholder={t("food.enterCarbohydrate")}
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
              <Text style={styles.checkboxLabel}>{t("food.active")}</Text>
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
            <Text style={styles.buttonText}>{loading ? t("food.creating") : t("food.create")}</Text>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalButtonDone: {
    color: '#10B981',
    fontWeight: '600',
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
});

