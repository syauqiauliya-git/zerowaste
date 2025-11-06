"use client"

import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { router } from "expo-router"
import { AuthHeader } from "@/components/ui/auth-header"
import { Colors } from "@/constants/theme"
import { loginApi } from "@/lib/auth"
import { saveToken } from "@/lib/auth-storage"

type LoginFormProps = {
  onSignUp?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSignUp }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await loginApi({ email: email.trim(), password })
      await saveToken(response.token, response.role)
      router.replace("/(tabs)/home")
    } catch (e: any) {
      setError(e?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={50}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AuthHeader size={200} />

        <View style={styles.formBox}>
          <Text style={styles.title}>Login to your Account</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.icon} />
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
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.icon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={{ position: 'absolute', right: 14, top: 14 }} onPress={() => setShowPassword(s => !s)}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <Pressable style={styles.rememberRow} onPress={() => setRememberMe((v) => !v)}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </Pressable>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>{loading ? "SIGNING IN..." : "SIGN IN"}</Text>
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginTop: 16 }}>
            <Pressable onPress={() => console.log("Forgot password")}>
              <Text style={styles.forgotPassword}>Forgot the password?</Text>
            </Pressable>
          </View>

          <View style={{ alignItems: "center", marginTop: 12 }}>
            <Text style={styles.noAccount}>Dont have an account?</Text>
            <Pressable onPress={onSignUp}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  formBox: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 22,
    color: "#064E3B",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#064E3B",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingLeft: 40,
    paddingRight: 14,
    minHeight: 48,
    // subtle drop shadow to match register form
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'visible',
  },
  icon: {
    position: "absolute",
    left: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 8,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
  },
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
  checkboxChecked: {
    backgroundColor: "#10b981",
  },
  rememberText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#064E3B",
  },
  submitButton: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 10,
    height: 48,
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
  forgotPassword: {
    color: Colors.light.secondary,
    fontWeight: "700",
  },
  noAccount: {
    marginTop: 4,
    color: "#6b7280",
  },
  signUpLink: {
    marginTop: 2,
    color: Colors.light.secondary,
    fontWeight: "700",
  },
  errorText: {
    color: "#b91c1c",
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
  },
})

export default LoginForm
