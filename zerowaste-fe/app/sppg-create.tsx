import { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from 'expo-router';
import Header from '@/components/ui/header';
import { createSPPG } from "@/lib/sppg";

export default function SPPGCreateScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async () => {
    const sppgName = name.trim();
    const addr = address.trim();
    if (sppgName.length === 0 || addr.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const sppgData = {
        name: sppgName,
        address: addr,
        is_active: isActive,
      };

      console.log('SPPG data: ', sppgData);

      await createSPPG(sppgData);
      console.log('SPPG created successfully');
      router.back();
    } catch (error: any) {
      console.error('Failed to create SPPG:', error);
      alert(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
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
        <Header title="Create SPPG" icon="business" />

        <View style={styles.container}>
          <View style={styles.formControl}>
            <Text style={styles.label}>SPPG Name</Text>
            <TextInput
              style={styles.inputContainer}
              value={name}
              onChangeText={setName}
              placeholder="Enter SPPG name"
            />
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.inputContainer, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusOptions}>
              <Pressable
                style={[
                  styles.statusOption,
                  isActive && styles.statusOptionSelected,
                  isActive && styles.activeOptionSelected,
                ]}
                onPress={() => setIsActive(true)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    isActive && styles.statusOptionTextSelected,
                  ]}
                >
                  Active
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.statusOption,
                  !isActive && styles.statusOptionSelected,
                  !isActive && styles.inactiveOptionSelected,
                ]}
                onPress={() => setIsActive(false)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    !isActive && styles.statusOptionTextSelected,
                  ]}
                >
                  Inactive
                </Text>
              </Pressable>
            </View>
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
  statusOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusOptionSelected: {
    borderColor: 'transparent',
  },
  activeOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  inactiveOptionSelected: {
    backgroundColor: '#EF4444',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusOptionTextSelected: {
    color: '#fff',
  },
});
