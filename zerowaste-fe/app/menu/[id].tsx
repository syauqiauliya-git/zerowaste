import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "@/components/ui/header";
import { DailyMenu, getMenu } from "@/lib/menus";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const isNil = (v: unknown) => v === undefined || v === null;

const MenuCard = ({
  data,
  onEdit,
}: {
  data: DailyMenu;
  onEdit: () => void;
}) => (
  <View style={styles.card}>
    <Text style={styles.title}>{data.nama_menu}</Text>
    {data.deskripsi ? <Text style={styles.desc}>{data.deskripsi}</Text> : null}

    <View style={styles.row}>
      <Text style={styles.label}>Sekolah</Text>
      <Text style={styles.value}>
        {typeof data.school === "object"
          ? data.school?.school_name
          : data.school || "-"}
      </Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>SPPG</Text>
      <Text style={styles.value}>
        {typeof data.sppg === "object" ? data.sppg?.name : data.sppg || "-"}
      </Text>
    </View>

    <View style={styles.divider} />

    <View style={styles.grid}>
      <View style={styles.gridItem}>
        <Text style={styles.miniLabel}>Harga</Text>
        <Text style={styles.miniValue}>
          {isNil(data.harga) ? "-" : `Rp${data.harga}`}
        </Text>
      </View>
      <View style={styles.gridItem}>
        <Text style={styles.miniLabel}>Protein</Text>
        <Text style={styles.miniValue}>
          {isNil(data.protein) ? "-" : `${data.protein} g`}
        </Text>
      </View>
      <View style={styles.gridItem}>
        <Text style={styles.miniLabel}>Lemak</Text>
        <Text style={styles.miniValue}>
          {isNil(data.lemak) ? "-" : `${data.lemak} g`}
        </Text>
      </View>
      <View style={styles.gridItem}>
        <Text style={styles.miniLabel}>Karbohidrat</Text>
        <Text style={styles.miniValue}>
          {isNil(data.karbohidrat) ? "-" : `${data.karbohidrat} g`}
        </Text>
      </View>
    </View>

    <View style={styles.actions}>
      <TouchableOpacity style={[styles.btn, styles.edit]} onPress={onEdit}>
        <MaterialIcons name="edit" size={18} color="#fff" />
        <Text style={styles.btnLabel}>Edit</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function MenuDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState<DailyMenu | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getMenu(String(id));
      setMenu(res.data.menu);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Gagal memuat detail menu");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const renderBody = () => {
    if (loading)
      return (
        <ActivityIndicator
          size="large"
          color="#10B981"
          style={{ marginTop: 16 }}
        />
      );
    if (menu)
      return (
        <MenuCard
          data={menu}
          onEdit={() =>
            router.push({
              pathname: "/menu/[id]/edit" as any,
              params: { id: String(id) },
            })
          }
        />
      );
    return (
      <Text style={{ textAlign: "center", marginTop: 24, color: "#666" }}>
        Data tidak ditemukan
      </Text>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Menu Detail" icon="restaurant" />
      {renderBody()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  desc: {
    marginTop: 6,
    color: "#4b5563",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  label: { color: "#6b7280" },
  value: { fontWeight: "600", color: "#111827" },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
  },
  miniLabel: { color: "#6b7280", marginBottom: 4 },
  miniValue: { fontWeight: "700", color: "#111827" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  edit: { backgroundColor: "#3B82F6" },
  btnLabel: { color: "#fff", fontWeight: "700" },
});
