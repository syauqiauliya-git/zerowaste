import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Header from "@/components/ui/header";
import * as Haptics from "expo-haptics";
import { createMenu } from "@/lib/menus";
import { getRole } from "@/lib/auth-storage";

export default function MenuCreateScreen() {
  const router = useRouter();
  const [namaMenu, setNamaMenu] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [sppgId, setSppgId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [harga, setHarga] = useState("");
  const [protein, setProtein] = useState("");
  const [lemak, setLemak] = useState("");
  const [karbo, setKarbo] = useState("");
  const [loading, setLoading] = useState(false);

  const isHex24 = (v: string) => /^[a-fA-F0-9]{24}$/.test(v);

  const handleSubmit = async () => {
    const name = namaMenu.trim();
    const desc = deskripsi.trim();
    if (!name) return Alert.alert("Validation", "Nama menu wajib diisi");
    if (!isHex24(sppgId))
      return Alert.alert("Validation", "SPPG ID harus 24-hex");
    if (!isHex24(schoolId))
      return Alert.alert("Validation", "School ID harus 24-hex");

    setLoading(true);
    try {
      // Ensure role is SPPG
      const role = await getRole();
      if (role?.toLowerCase() !== "sppg_staff") {
        Alert.alert("Unauthorized", "Hanya SPPG Staff yang dapat membuat menu");
        setLoading(false);
        return;
      }

      await createMenu({
        nama_menu: name,
        deskripsi: desc || undefined,
        sppg: sppgId,
        school: schoolId,
        harga: harga ? Number(harga) : undefined,
        protein: protein ? Number(protein) : undefined,
        lemak: lemak ? Number(lemak) : undefined,
        karbohidrat: karbo ? Number(karbo) : undefined,
      });
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch {}
      router.back();
    } catch (error: any) {
      console.error("Failed to create menu:", error);
      Alert.alert("Error", error?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Header title="Create Menu" icon="restaurant" />

        <View style={styles.container}>
          <View style={styles.formControl}>
            <Text style={styles.label}>Nama Menu</Text>
            <TextInput
              style={styles.inputContainer}
              value={namaMenu}
              onChangeText={setNamaMenu}
              placeholder="cth: Nasi Ayam"
            />
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>Deskripsi</Text>
            <TextInput
              style={[styles.inputContainer, styles.textArea]}
              value={deskripsi}
              onChangeText={setDeskripsi}
              placeholder="cth: Porsi anak"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>SPPG ID</Text>
            <TextInput
              style={styles.inputContainer}
              value={sppgId}
              onChangeText={setSppgId}
              placeholder="24-hex ObjectId"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formControl}>
            <Text style={styles.label}>School ID</Text>
            <TextInput
              style={styles.inputContainer}
              value={schoolId}
              onChangeText={setSchoolId}
              placeholder="24-hex ObjectId"
              autoCapitalize="none"
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Harga</Text>
              <TextInput
                style={styles.inputContainer}
                value={harga}
                onChangeText={setHarga}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Protein</Text>
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
              <Text style={styles.label}>Lemak</Text>
              <TextInput
                style={styles.inputContainer}
                value={lemak}
                onChangeText={setLemak}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Karbohidrat</Text>
              <TextInput
                style={styles.inputContainer}
                value={karbo}
                onChangeText={setKarbo}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating..." : "Create"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1 },
  scrollView: { paddingHorizontal: 18, paddingVertical: 20, flexGrow: 1 },
  container: { gap: 16, paddingBottom: 20 },
  formControl: { gap: 8 },
  label: { fontSize: 16, fontWeight: "500", color: "#374151" },
  inputContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  button: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});