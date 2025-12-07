import { apiFetch } from "@/lib/api";

export interface SchoolAnalytics {
  totalReduction: number;
  averageRating: number;
  totalReports: number;
  totalLikes: number;
  totalDislikes: number;
  trend: {
    _id: string;
    totalWaste: number;
  }[];
  topReasons: {
    code: string;
    count: number;
  }[];
}

export interface GlobalAnalytics {
  totalReduction: number;
  averageRating: number;
  totalReports: number;
}

export interface ClassAnalyticsEntry {
  _id: string;
  className: string;
  totalWaste: number;
  trend: {
    _id: string;
    totalWaste: number;
  }[];
}

export interface ClassAnalyticsResponse {
  status: string;
  results: number;
  data: ClassAnalyticsEntry[];
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

export async function fetchClassAnalytics() {
  return apiFetch<ClassAnalyticsResponse>("/api/v1/analytics/class");
}

export interface LeaderboardEntry {
  class_id: string;
  class_name: string;
  totalWaste: number;
  totalReports: number;
  averageRating: number;
}

export interface LeaderboardResponse {
  status: string;
  period: string;
  results: number;
  data: LeaderboardEntry[];
}

export async function fetchLeaderboard(period: string = "all") {
  return apiFetch<LeaderboardResponse>(`/api/v1/analytics/leaderboard?period=${period}`);
}

