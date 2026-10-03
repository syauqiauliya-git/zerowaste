import { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '@/components/ui/header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createClass } from "@/store/slices/classSlice";
import { useTranslation } from '@/hooks/useTranslation';

export default function ClassCreateScreen() {
  const { schoolId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { loading } = useAppSelector((state) => state.classes);
  const [className, setClassName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");

  const handleSubmit = async () => {
    const name = className.trim();
    const grade = gradeLevel.trim();
    if (name.length === 0 || grade.length === 0) {
      alert(t("class.fillAllRequired"));
      return;
    }
    
    try {
      const classData = {
        school_id: schoolId as string,
        class_name: className,
        grade_level: grade,
      };

      console.log('Class data: ', classData);
      
      const result = await dispatch(createClass(classData)).unwrap();
      console.log('Class created successfully:', result);
      router.back();
    } catch (error: any) {
      console.error('Failed to create class:', error);
      alert(error.message || t("common.error"));
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
        <Header title={t("class.createClass")} icon="group" />

        <View style={styles.container}>
          <View style={styles.formControl}>
            <Text style={styles.label}>{t("class.className")}</Text>
            <TextInput
              style={styles.inputContainer}
              value={className}
              onChangeText={setClassName}
              placeholder={t("class.enterClassName")}
            />
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>{t("class.gradeLevel")}</Text>
            <TextInput
              style={styles.inputContainer}
              value={gradeLevel}
              onChangeText={setGradeLevel}
              placeholder={t("class.enterGradeLevel")}
              keyboardType="numeric"
            />
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? t("class.creating") : t("class.create")}</Text>
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
