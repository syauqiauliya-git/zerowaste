import { apiFetch } from "@/lib/api";

export interface Report {
  _id: string;
  teacher: {
    _id: string;
    user_id: {
      email: string;
      role: "teacher" | "sppg";
    };
    name: string;
  };
  class: {
    _id: string;
    class_name: string;
  };
  menu: {
    _id: string;
    nama_menu: string;
  };
  report_date: string; // ISO date string
  total_waste_kg: number;
  total_likes: number;
  total_dislikes: number;
  reason_breakdown_json: {
    [reasonCode: string]: number; // dynamic object with counts
  };
  verbal_feedback: string;
  status: "submitted" | "pending" | string; // adjust if you have enums
  submitted_at: string; // ISO date string
  __v: number;
}

export const fetchReports = async (): Promise<Report[]> => {
  const response = await apiFetch<{ data: { reports: Report[] } }>('/api/v1/reports');
  return response.data.reports;
};

export const fetchReportById = async (reportId: string): Promise<Report> => {
  const response = await apiFetch<{ data: { report: Report } }>(`/api/v1/reports/${reportId}`);
  return response.data.report;
};

export const sendReport = async (
  qr_string: string,
  feedback: string,
  imageBase64: string, // <-- this should be a base64 string
  class_id: string,
  scan_timestamp?: string
) => {
  try {
    const data = await apiFetch("/api/v1/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        qr_payload_string: qr_string,
        verbal_feedback: feedback,
        image: imageBase64, // send base64 instead of file
        class_id: class_id,
        scan_timestamp: scan_timestamp || new Date().toISOString(),
      }),
    });

    console.log("Feedback sent successfully", data);
    return data;

  } catch (error: any) {
    console.error(
      `❌ Failed to send feedback`,
      error
    );

    // Extract error message from backend response
    const errorMessage = error?.message || error?.error?.message || "Failed to send report";
    throw new Error(errorMessage);
  }
};
