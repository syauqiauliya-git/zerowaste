import React, { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "@/constants/theme";
import ImagePicker from "./image-picker";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { sendFeedback } from "@/store/actions/feedback";

function FeedbackForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [className, setClassName] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const imageTakenHandler = (imagePath: string) => {
    setSelectedImage(imagePath);
  };

  const sendFeedbackHandler = async () => {
    const clas = className.trim();
    const feedbackMessage = feedback.trim();
    if (clas.length === 0 || feedbackMessage.length === 0) {
      alert("Please fill in class and feedback.");
      return;
    }
    try {
      setIsLoading(true);
      await sendFeedback(clas, date.toISOString(), feedbackMessage, selectedImage);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View>
      <View style={styles.formControl}>
        <Text style={styles.label}>Class</Text>
        <TextInput
          style={styles.inputContainer}
          value={className}
          onChangeText={(e) => setClassName(e)}
          placeholder="Enter class"
        />
      </View>
      <View style={styles.formControl}>
        <Text style={styles.label}>Select Date</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={date.toISOString().split("T")[0]}
            editable={false}
          />
          <Pressable
            onPress={() => setShowPicker(true)}
            style={styles.iconContainer}
          >
            <MaterialIcons name="date-range" size={24} color="#555" />
          </Pressable>
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
          />
        )}
      </View>
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
          >
            <Text style={styles.buttonText}>Send Feedback</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default FeedbackForm;

const styles = StyleSheet.create({
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
