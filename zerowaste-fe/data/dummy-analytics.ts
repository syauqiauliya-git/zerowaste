import { SchoolAnalytics, GlobalAnalytics } from "@/lib/analytics";

// TEMPORARY: Dummy data for testing analytics page
export const dummyTrendData = [
  { _id: "2024-01-15", totalWaste: 45.5 },
  { _id: "2024-01-16", totalWaste: 52.3 },
  { _id: "2024-01-17", totalWaste: 38.7 },
  { _id: "2024-01-18", totalWaste: 61.2 },
  { _id: "2024-01-19", totalWaste: 48.9 },
  { _id: "2024-01-20", totalWaste: 55.1 },
  { _id: "2024-01-21", totalWaste: 42.8 },
];

export const dummySchoolAnalytics: SchoolAnalytics = {
  totalReduction: 344.5,
  averageRating: 4.2,
  totalReports: 127,
  trend: dummyTrendData,
};

export const dummyGlobalAnalytics: GlobalAnalytics = {
  totalReduction: 1250.8,
  averageRating: 4.5,
  totalReports: 450,
};

