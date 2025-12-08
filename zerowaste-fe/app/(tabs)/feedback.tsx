import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getRole } from "@/lib/auth-storage";
import Header from "@/components/ui/header";
import Tip from "@/components/feedback/tip";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors } from "@/constants/theme";
import ImagePicker from "@/components/feedback/image-picker";
import { sendReport } from "@/lib/report";

const DetailField = ({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) => (
  <View style={[styles.fieldContainer, fullWidth && styles.fieldFullWidth]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.fieldInputMock}>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  </View>
);

export default function FeedbackScreen() {
  const router = useRouter();
  const { scannedData } = useLocalSearchParams<{ scannedData?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const checkRole = async () => {
      const userRole = await getRole();
      if (userRole?.toLowerCase() !== "teacher") {
        router.replace("/(tabs)/analytics");
      }
    };
    checkRole();
  }, [router]);

  // Parse the raw string data into a structured object
  const parsedData = useMemo(() => {
    if (!scannedData) return null;

    // Create a full date-time string: YYYY-MM-DD HH:mm:ss
    const now = new Date();
    const pad = (n: any) => n.toString().padStart(2, "0");

    const fullDateTime =
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
        now.getSeconds()
      )}`;

    // Regex strategies to extract specific lines/patterns safely
    const feedbackMatch = scannedData.match(/L:(\d+)\s+D:(\d+)/);
    const catRow1Match = scannedData.match(/A:(\d+)\s+B:(\d+)\s+C:(\d+)/);
    const catRow2Match = scannedData.match(/D:(\d+)\s+E:(\d+)\s+O:(\d+)/);
    const totalMatch = scannedData.match(/Total:\s*(.+)/);

    return {
      time: fullDateTime, // <-- complete date + time
      likes: feedbackMatch ? feedbackMatch[1] : "0",
      dislikes: feedbackMatch ? feedbackMatch[2] : "0",
      catA: catRow1Match ? catRow1Match[1] : "0",
      catB: catRow1Match ? catRow1Match[2] : "0",
      catC: catRow1Match ? catRow1Match[3] : "0",
      catD: catRow2Match ? catRow2Match[1] : "0",
      catE: catRow2Match ? catRow2Match[2] : "0",
      catO: catRow2Match ? catRow2Match[3] : "0",
      total: totalMatch ? totalMatch[1].trim() : "0 kg",
    };
  }, [scannedData]);

  const imageTakenHandler = (imagePath: string) => {
    setSelectedImage(imagePath);
  };

  const sendFeedbackHandler = async () => {
    const feedbackMessage = feedback.trim();
    if (feedbackMessage.length === 0) {
      alert("Please fill in class and feedback.");
      return;
    }
    try {
      setIsLoading(true);
      await sendReport(scannedData!, feedbackMessage, selectedImage);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={50}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Header title="Feedback" icon="feedback" />
        <Tip />

        {parsedData && (
          <View>
            {/* Time Field */}
            <DetailField label="Waktu Scan" value={parsedData.time} fullWidth />

            {/* Feedback Stats */}
            <View style={styles.row}>
              <DetailField label="Likes (L)" value={parsedData.likes} />
              <DetailField label="Dislikes (D)" value={parsedData.dislikes} />
            </View>

            {/* Menu Categories Row 1 */}
            <View style={styles.row}>
              <DetailField label="Menu A" value={parsedData.catA} />
              <DetailField label="Menu B" value={parsedData.catB} />
              <DetailField label="Menu C" value={parsedData.catC} />
            </View>

            {/* Menu Categories Row 2 */}
            <View style={styles.row}>
              <DetailField label="Menu D" value={parsedData.catD} />
              <DetailField label="Menu E" value={parsedData.catE} />
              <DetailField label="Menu O" value={parsedData.catO} />
            </View>

            {/* Total Weight */}
            <DetailField
              label="Total Berat"
              value={parsedData.total}
              fullWidth
            />
          </View>
        )}

        <View style={styles.formControl}>
          <Text style={styles.label}>Feedback</Text>
          <TextInput
            style={[styles.inputContainer, styles.textArea]}
            value={feedback}
            multiline
            numberOfLines={4}
            onChangeText={(e) => setFeedback(e)}
            placeholder="Enter feedback description..."
          />
        </View>
        <ImagePicker onImageTaken={imageTakenHandler} />
        <View>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.9 },
              ]}
              onPress={sendFeedbackHandler}
              disabled={isLoading || !parsedData}
            >
              <Text style={styles.buttonText}>Send Feedback</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
    backgroundColor: "#F9FAFB", // Slightly off-white background for contrast
  },
  parsedContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: 12,
  },
  fieldFullWidth: {
    width: "100%",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 6,
  },
  fieldInputMock: {
    backgroundColor: "#F3F4F6", // Gray-100 mimic
    borderWidth: 1,
    borderColor: "#D1D5DB", // Gray-300 mimic
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827", // Gray-900
  },
  formControl: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingVertical: 10,
  },
  iconContainer: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
