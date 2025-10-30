import { apiFetch } from "@/lib/api";

export const sendFeedback = async (
  className: string,
  date: string,
  feedback: string,
  image: string
) => {
  const formData = new FormData();
  formData.append("className", className);
  formData.append("date", date);
  formData.append("feedback", feedback);
  formData.append("image", {
    uri: image,
    name: "feedback.jpg",
    type: "image/jpeg",
  } as any);
  
  console.log("Sending feedback", className, date, feedback, formData);
  
  try {
    const response = await apiFetch("/api/v1/feedback", {
      method: "POST",
      body: formData,
      // Don't set Content-Type header for FormData - let the browser set it with boundary
    });
    
    console.log("Feedback sent successfully", response);
    return response;
  } catch (error) {
    console.error("Failed to send feedback:", error);
    throw error;
  }
};
