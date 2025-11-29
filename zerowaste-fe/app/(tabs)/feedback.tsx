"use client"

import { useEffect } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import { getRole } from "@/lib/auth-storage"
import Header from "@/components/ui/header"
import Tip from "@/components/feedback/tip"
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from "react-native"
import FeedbackForm from "@/components/feedback/feedback-form"

export default function FeedbackScreen() {
  const router = useRouter()
  const { scannedData } = useLocalSearchParams<{ scannedData?: string }>()

  useEffect(() => {
    const checkRole = async () => {
      const userRole = await getRole()
      if (userRole?.toLowerCase() !== "teacher") {
        router.replace("/(tabs)/home")
      }
    }
    checkRole()
  }, [router])

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={50}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Header title="Feedback" icon="feedback" />
        <Tip />
        {scannedData ? (
          <View style={styles.scannedDataCard}>
            <Text style={styles.scannedDataLabel}>Data hasil pemindaian</Text>
            <Text style={styles.scannedDataValue}>{scannedData}</Text>
          </View>
        ) : null}
        <FeedbackForm />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
  scannedDataCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  scannedDataLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#047857",
    marginBottom: 6,
  },
  scannedDataValue: {
    fontSize: 16,
    color: "#065F46",
    fontWeight: "600",
  },
})
