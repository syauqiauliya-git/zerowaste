import { apiFetch } from "@/lib/api";

export const sendFeedback = async (
  qr_string: string,
  feedback: string,
  imageBase64: string // <-- this should be a base64 string
) => {
  try {
    const response = await apiFetch("/api/v1/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        qr_payload_string: qr_string,
        verbal_feedback: feedback,
        image: imageBase64, // send base64 instead of file
      }),
    });

    // If the API does NOT return ok status
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw {
        status: response.status,
        statusText: response.statusText,
        ...errorData,
      };
    }

    const data = await response.json();
    console.log("Feedback sent successfully", data);
    return data;

  } catch (error: any) {
    console.error(
      `❌ Failed to send feedback (status: ${error?.status || "unknown"})`,
      error
    );

    throw error;
  }
};
