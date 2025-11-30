import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthHeader } from "@/components/ui/auth-header";
import { Colors } from "@/constants/theme";
import { registerApi } from "@/lib/auth";
import { saveToken } from "@/lib/auth-storage";
import * as SecureStore from "expo-secure-store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter, useFocusEffect } from "expo-router";
import { fetchSchools } from "@/store/slices/schoolSlice";
import { School } from "@/lib/school";
import { fetchAllSPPG, SPPG } from "@/lib/sppg";

type RegisterFormProps = {
  onSignIn?: () => void;
};

const SELECTED_SCHOOL_KEY = "selected_school_id";
const SELECTED_SPPG_KEY = "selected_sppg_id";

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSignIn }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { schools } = useAppSelector((state) => state.schools);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // SPPG State
  const [sppgs, setSppgs] = useState<SPPG[]>([]);
  const [selectedSppgId, setSelectedSppgId] = useState("");
  const [selectedSppg, setSelectedSppg] = useState<SPPG | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // School State
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const [role, setRole] = useState<string>("");
  const roles = ["Teacher", "SPPG", "Admin"];

  const roleMap: Record<string, string> = {
    Teacher: "teacher",
    SPPG: "sppg_staff",
    Admin: "admin",
  };
  const selectedBackendRole = role ? roleMap[role] || "teacher" : "";

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedSchoolId && selectedBackendRole === "teacher") {
        setError("Please select a school for Teacher role");
        return;
      }

      const trimmedSekolah = selectedSchoolId?.trim();
      const trimmedSppg = selectedSppgId.trim();

      if (selectedBackendRole === "sppg_staff") {
        if (!trimmedSppg) {
          setError("Please select an SPPG");
          return;
        }
        // Optional: Add specific ObjectId validation if strict
      }

      const backendRole = selectedBackendRole;
      const payload: any = {
        name: fullName,
        email: email.trim(),
        password,
        role: backendRole,
      };
      if (backendRole === "teacher") {
        payload.school_id = trimmedSekolah;
      }
      if (backendRole === "sppg_staff") {
        payload.sppg_id = trimmedSppg;
      }
      const response = await registerApi(payload);
      await saveToken(response.token, backendRole);
      onSignIn?.();
    } catch (e: any) {
      setError(e?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (value: string) => {
    setRole(value);
    setRoleOpen(false);
  };

  // --- LOADERS ---

  // 1. Fetch Lists (Schools & SPPGs)
  useEffect(() => {
    dispatch(fetchSchools());

    const fetchSppgList = async () => {
      try {
        const list = await fetchAllSPPG();
        setSppgs(list);
      } catch (err) {
        console.error("Failed to fetch SPPG list", err);
      }
    };
    fetchSppgList();
  }, [dispatch]);

  // 2. Load Selected School from Storage
  const loadSelectedSchool = useCallback(async () => {
    try {
      const storedSchoolId = await SecureStore.getItemAsync(
        SELECTED_SCHOOL_KEY
      );
      if (storedSchoolId) {
        setSelectedSchoolId(storedSchoolId);
        const school = schools.find((s: any) => s._id === storedSchoolId);
        if (school) setSelectedSchool(school);
      }
    } catch (err) {
      console.error("Failed to get selected school:", err);
    }
  }, [schools]);

  // 3. Load Selected SPPG from Storage
  const loadSelectedSppg = useCallback(async () => {
    try {
      const storedSppgId = await SecureStore.getItemAsync(SELECTED_SPPG_KEY);
      if (storedSppgId) {
        setSelectedSppgId(storedSppgId);
        const sppg = sppgs.find((s) => s._id === storedSppgId);
        if (sppg) setSelectedSppg(sppg);
      }
    } catch (err) {
      console.error("Failed to get selected SPPG:", err);
    }
  }, [sppgs]); // Helper depends on sppgs list being ready

  // 4. Initial Load when lists change
  useEffect(() => {
    if (schools.length > 0) loadSelectedSchool();
    if (sppgs.length > 0) loadSelectedSppg();
  }, [schools, sppgs, loadSelectedSchool, loadSelectedSppg]);

  // 5. Re-check Storage when screen gains focus (navigating back from select screen)
  useFocusEffect(
    useCallback(() => {
      loadSelectedSchool();
      loadSelectedSppg(); // <--- THIS WAS MISSING
    }, [loadSelectedSchool, loadSelectedSppg])
  );

  const handleSelectSchool = () => {
    router.push({
      pathname: "/school-select",
      params: {
        schoolId: selectedSchoolId || "",
        returnPath: "/register",
      },
    });
  };

  const handleSelectSppg = () => {
    router.push({
      pathname: "/sppg-select",
      params: {
        sppgId: selectedSppgId || "",
        returnPath: "/register",
      },
    });
  };

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={50}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AuthHeader size={200} />

        <View style={styles.formBox}>
          <Text style={styles.title}>Create your Account</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#6b7280"
                style={styles.icon}
              />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full name"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* School Selector */}
          {selectedBackendRole === "teacher" && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>School</Text>
              <Pressable
                style={styles.selectButton}
                onPress={handleSelectSchool}
              >
                <Text
                  style={[
                    styles.selectText,
                    !selectedSchool && styles.selectPlaceholder,
                  ]}
                >
                  {schools.length === 0
                    ? "Loading schools..."
                    : selectedSchool
                    ? selectedSchool.school_name
                    : "Select a school"}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </Pressable>
            </View>
          )}

          {/* SPPG Selector */}
          {selectedBackendRole === "sppg_staff" && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>SPPG</Text>
              <Pressable style={styles.selectButton} onPress={handleSelectSppg}>
                <Text
                  style={[
                    styles.selectText,
                    !selectedSppg && styles.selectPlaceholder,
                  ]}
                >
                  {sppgs.length === 0
                    ? "Loading SPPGs..."
                    : selectedSppg
                    ? selectedSppg.name
                    : "Select an SPPG"}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </Pressable>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#6b7280"
                style={styles.icon}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#6b7280"
                style={styles.icon}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={{ position: "absolute", right: 14, top: 14 }}
                onPress={() => setShowPassword((s) => !s)}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={18}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Role</Text>
            <View>
              <Pressable
                style={styles.inputWrapper}
                onPress={() => setRoleOpen((o) => !o)}
              >
                <Ionicons
                  name="people-outline"
                  size={20}
                  color="#6b7280"
                  style={styles.icon}
                />
                <Text
                  style={[
                    styles.input,
                    {
                      paddingVertical: 12,
                      color: role ? "#111827" : "#9ca3af",
                    },
                  ]}
                >
                  {role || "Role"}
                </Text>
                <Ionicons
                  name={roleOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#6b7280"
                  style={{ position: "absolute", right: 14, top: 14 }}
                />
              </Pressable>
              {roleOpen && (
                <View style={styles.dropdown}>
                  {roles.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => toggleRole(r)}
                      style={({ pressed }) => [
                        styles.dropdownItem,
                        pressed && { backgroundColor: "#f3f4f6" },
                      ]}
                    >
                      <Text style={styles.dropdownText}>{r}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>

          <Pressable
            style={styles.rememberRow}
            onPress={() => setRememberMe((v) => !v)}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
              {rememberMe && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </Pressable>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? "SIGNING UP..." : "SIGN UP"}
            </Text>
          </TouchableOpacity>

          <View style={styles.signInRow}>
            <Text style={styles.signInHint}>Already have an account? </Text>
            <Pressable onPress={onSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 32 },
  formBox: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 28,
    color: "#064E3B",
  },
  errorText: {
    color: "#b91c1c",
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#064E3B", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingLeft: 40,
    paddingRight: 14,
    minHeight: 52,
    shadowColor: "#064E3B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    overflow: "visible",
  },
  icon: { position: "absolute", left: 12 },
  input: { flex: 1, fontSize: 15, color: "#111827", paddingVertical: 8 },
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16 },
  dropdownText: { fontSize: 15, color: "#111827" },
  rememberRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: "#10b981" },
  rememberText: { fontSize: 15, fontWeight: "600", color: "#064E3B" },
  submitButton: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 10,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  signInRow: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  signInHint: { color: "#6b7280", fontSize: 13 },
  signInLink: {
    color: Colors.light.secondary,
    fontWeight: "600",
    fontSize: 13,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    minHeight: 52,
    shadowColor: "#064E3B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  selectText: { fontSize: 14, color: "#111827", flex: 1 },
  selectPlaceholder: { color: "#9CA3AF" },
});

export default RegisterForm;
