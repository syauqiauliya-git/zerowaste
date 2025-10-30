import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "@/components/ui/header";
import { DailyMenu, getMenu, updateMenu } from "@/lib/menus";
import * as Haptics from "expo-haptics";

const isHex24 = (v: string) => /^[a-fA-F0-9]{24}$/.test(v);

export default function MenuEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama_menu: "",
    deskripsi: "",
    sppg: "",
    school: "",
    harga: "",
    protein: "",
    lemak: "",
    karbohidrat: "",
  });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getMenu(String(id));
      const m: DailyMenu = res.data.menu;
      setForm({
        nama_menu: m.nama_menu || "",
        deskripsi: m.deskripsi || "",
        sppg: typeof m.sppg === "string" ? m.sppg : m.sppg?._id || "",
        school: typeof m.school === "string" ? m.school : m.school?._id || "",
        harga: m.harga == null ? "" : String(m.harga),
        protein: m.protein == null ? "" : String(m.protein),
        lemak: m.lemak == null ? "" : String(m.lemak),
        karbohidrat: m.karbohidrat == null ? "" : String(m.karbohidrat),
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Gagal memuat data menu");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    if (!form.nama_menu.trim())
      return Alert.alert("Validation", "Nama menu wajib diisi");
    if (!isHex24(form.sppg))
      return Alert.alert("Validation", "SPPG ID harus 24-hex");
    if (!isHex24(form.school))
      return Alert.alert("Validation", "School ID harus 24-hex");

    const payload = {
      nama_menu: form.nama_menu.trim(),
      deskripsi: form.deskripsi?.trim() || undefined,
      sppg: form.sppg,
      school: form.school,
      harga: form.harga ? Number(form.harga) : undefined,
      protein: form.protein ? Number(form.protein) : undefined,
      lemak: form.lemak ? Number(form.lemak) : undefined,
      karbohidrat: form.karbohidrat ? Number(form.karbohidrat) : undefined,
    };

    try {
      setSaving(true);
      await updateMenu(String(id), payload);
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch {}
      router.replace({
        pathname: "/menu/[id]" as any,
        params: { id: String(id) },
      });
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message || "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Edit Menu" icon="edit" />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#10B981"
          style={{ marginTop: 16 }}
        />
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Nama Menu *</Text>
          <TextInput
            style={styles.input}
            placeholder="cth: Nasi Ayam"
            value={form.nama_menu}
            onChangeText={(t) => setForm((s) => ({ ...s, nama_menu: t }))}
          />

          <Text style={styles.label}>Deskripsi</Text>
          <TextInput
            style={styles.input}
            placeholder="cth: Porsi anak"
            value={form.deskripsi}
            onChangeText={(t) => setForm((s) => ({ ...s, deskripsi: t }))}
          />

          <Text style={styles.label}>SPPG ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="24-hex ObjectId"
            autoCapitalize="none"
            value={form.sppg}
            onChangeText={(t) => setForm((s) => ({ ...s, sppg: t }))}
          />

          <Text style={styles.label}>School ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="24-hex ObjectId"
            autoCapitalize="none"
            value={form.school}
            onChangeText={(t) => setForm((s) => ({ ...s, school: t }))}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Harga</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                value={form.harga}
                onChangeText={(t) => setForm((s) => ({ ...s, harga: t }))}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Protein</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                value={form.protein}
                onChangeText={(t) => setForm((s) => ({ ...s, protein: t }))}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Lemak</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                value={form.lemak}
                onChangeText={(t) => setForm((s) => ({ ...s, lemak: t }))}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Karbohidrat</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                value={form.karbohidrat}
                onChangeText={(t) => setForm((s) => ({ ...s, karbohidrat: t }))}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.cancel]}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.btnLabel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.save]}
              onPress={onSave}
              disabled={saving}
            >
              <Text style={[styles.btnLabel, { color: "#fff" }]}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 14,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnLabel: {
    fontWeight: "700",
    color: "#111827",
  },
  cancel: {
    backgroundColor: "#e5e7eb",
  },
  save: {
    backgroundColor: "#10B981",
  },
});
