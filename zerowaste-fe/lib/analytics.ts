import { apiFetch } from "@/lib/api";

export interface SchoolAnalytics {
  totalReduction: number;
  averageRating: number;
  totalReports: number;
  trend: Array<{
    _id: string;
    totalWaste: number;
  }>;
}

export interface GlobalAnalytics {
  totalReduction: number;
  averageRating: number;
  totalReports: number;
}

export async function fetchSchoolAnalytics(schoolId?: string) {
  const url = schoolId 
    ? `/api/v1/analytics/school?school_id=${schoolId}`
    : "/api/v1/analytics/school";
  return apiFetch<{ status: string; data: SchoolAnalytics }>(url);
}

export async function fetchGlobalAnalytics() {
  return apiFetch<{ status: string; data: GlobalAnalytics }>("/api/v1/analytics/global");
}

