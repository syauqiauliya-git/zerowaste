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
  Alert,
} from "react-native";
import { Colors } from "@/constants/theme";
import ImagePicker from "@/components/feedback/image-picker";
import { sendReport } from "@/lib/report";
import { useTranslation } from "@/hooks/useTranslation";
import { getMyTeacherAssignments, TeacherClassAssignment } from "@/lib/assignments";
import { getMe } from "@/lib/user";

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
  const [classAssignments, setClassAssignments] = useState<TeacherClassAssignment[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const checkRole = async () => {
      const userRole = await getRole();
      if (userRole?.toLowerCase() !== "teacher") {
        router.replace("/(tabs)/analytics");
        return;
      }
      
      // Load teacher assignments
      try {
        setLoadingAssignments(true);
        const userRes = await getMe();
        const teacherId = (userRes.data.user_info as any).teacher_id;
        
        if (teacherId) {
          const assignmentsRes = await getMyTeacherAssignments();
          const myAssignments = assignmentsRes.data.assignments.filter(
            (a: TeacherClassAssignment) => a.teacher_id._id === teacherId && a.is_active
          );
          setClassAssignments(myAssignments);
          
          // Automatically select the first active assignment
          if (myAssignments.length > 0) {
            setSelectedClassId(myAssignments[0].class_id._id);
          }
        }
      } catch (err) {
        console.error('Failed to load class assignments', err);
      } finally {
        setLoadingAssignments(false);
      }
    };
    checkRole();
  }, [router]);

  // Parse the raw string data into a structured object
  // Format: WEIGHT|LIKES|DISLIKES|A,A,B,C,D
  // Example: 0.00|2|3|A,A,B,B,C,C,D,E,O
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

    // Parse the new format: WEIGHT|LIKES|DISLIKES|CATEGORIES
    const parts = scannedData.split("|");
    
    if (parts.length < 4) {
      // Fallback to old format if new format is not detected
      return {
        time: fullDateTime,
        likes: "0",
        dislikes: "0",
        catA: "0",
        catB: "0",
        catC: "0",
        catD: "0",
        catE: "0",
        catO: "0",
        total: "0.00 kg",
      };
    }

    const weight = parts[0].trim();
    const likes = parts[1].trim();
    const dislikes = parts[2].trim();
    const categories = parts[3].trim();

    // Count occurrences of each category
    const categoryList = categories.split(",").map(c => c.trim().toUpperCase());
    const catA = categoryList.filter(c => c === "A").length.toString();
    const catB = categoryList.filter(c => c === "B").length.toString();
    const catC = categoryList.filter(c => c === "C").length.toString();
    const catD = categoryList.filter(c => c === "D").length.toString();
    const catE = categoryList.filter(c => c === "E").length.toString();
    const catO = categoryList.filter(c => c === "O").length.toString();

    return {
      time: fullDateTime,
      likes: likes || "0",
      dislikes: dislikes || "0",
      catA: catA || "0",
      catB: catB || "0",
      catC: catC || "0",
      catD: catD || "0",
      catE: catE || "0",
      catO: catO || "0",
      total: `${weight} kg`,
    };
  }, [scannedData]);

  const imageTakenHandler = (imagePath: string) => {
    setSelectedImage(imagePath);
  };

  const sendFeedbackHandler = async () => {
    const feedbackMessage = feedback.trim();
    if (feedbackMessage.length === 0) {
      Alert.alert(t("common.error"), t("feedback.fillRequired"));
      return;
    }
    
    // Check if teacher has assignments
    if (classAssignments.length === 0) {
      Alert.alert(
        t("common.error"),
        t("feedback.noAssignments")
      );
      return;
    }
    
    if (!selectedClassId) {
      Alert.alert(
        t("common.error"),
        t("feedback.noAssignments")
      );
      return;
    }
    
    try {
      setIsLoading(true);
      // Get current timestamp for scan_timestamp
      const scanTimestamp = new Date().toISOString();
      await sendReport(scannedData!, feedbackMessage, selectedImage, selectedClassId, scanTimestamp);
      Alert.alert(t("common.success"), t("feedback.reportSubmitted") || "Report submitted successfully");
      // Clear form after successful submission
      setFeedback("");
      setSelectedImage("");
    } catch (error: any) {
      console.error(error);
      Alert.alert(t("common.error"), error.message || t("feedback.somethingWentWrong"));
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
        <Header title={t("feedback.title")} icon="feedback" />
        <Tip />

        {loadingAssignments ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.loadingText}>{t("common.loading")}</Text>
          </View>
        ) : classAssignments.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t("feedback.noAssignments")}</Text>
          </View>
        ) : parsedData && (
          <View>
            {/* Time Field */}
            <DetailField label={t("feedback.scanTime")} value={parsedData.time} fullWidth />

            {/* Feedback Stats */}
            <View style={styles.row}>
              <DetailField label={t("feedback.likes")} value={parsedData.likes} />
              <DetailField label={t("feedback.dislikes")} value={parsedData.dislikes} />
            </View>

            {/* Menu Categories Row 1 */}
            <View style={styles.row}>
              <DetailField label={t("feedback.menuA")} value={parsedData.catA} />
              <DetailField label={t("feedback.menuB")} value={parsedData.catB} />
              <DetailField label={t("feedback.menuC")} value={parsedData.catC} />
            </View>

            {/* Menu Categories Row 2 */}
            <View style={styles.row}>
              <DetailField label={t("feedback.menuD")} value={parsedData.catD} />
              <DetailField label={t("feedback.menuE")} value={parsedData.catE} />
              <DetailField label={t("feedback.menuO")} value={parsedData.catO} />
            </View>

            {/* Total Weight */}
            <DetailField
              label={t("feedback.totalWeight")}
              value={parsedData.total}
              fullWidth
            />
          </View>
        )}

        <View style={styles.formControl}>
          <Text style={styles.label}>{t("feedback.label")}</Text>
          <TextInput
            style={[styles.inputContainer, styles.textArea]}
            value={feedback}
            multiline
            numberOfLines={4}
            onChangeText={(e) => setFeedback(e)}
            placeholder={t("feedback.placeholder")}
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
              disabled={isLoading || !parsedData || !selectedClassId || classAssignments.length === 0}
            >
              <Text style={styles.buttonText}>{t("feedback.sendFeedback")}</Text>
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
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
    lineHeight: 20,
  },
});
