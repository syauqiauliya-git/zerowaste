import Header from "@/components/ui/header";
import Tip from "@/components/feedback/tip";
import { KeyboardAvoidingView, ScrollView, StyleSheet } from "react-native";
import FeedbackForm from "@/components/feedback/feedback-form";

export default function FeedbackScreen() {
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={50}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Header title="Feedback" icon="feedback" />
        <Tip />
        <FeedbackForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexGrow: 1,
  },
});
