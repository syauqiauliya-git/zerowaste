import { apiFetch } from "@/lib/api";

export type PendingProfilesResponse = {
  status: "success";
  results: number;
  data: {
    teachers: {
      _id: string;
      name: string;
      school_id?: string;
      user_id?: { email: string; role: string };
      status: "PENDING";
      createdAt?: string;
    }[];
    sppgstaff: {
      _id: string;
      name: string;
      sppg_id?: string;
      user_id?: { email: string; role: string };
      status: "PENDING";
      createdAt?: string;
    }[];
  };
};

export async function fetchPendingProfiles() {
  return apiFetch<PendingProfilesResponse>("/api/v1/admin/profiles/pending");
}

export async function approveProfile(
  id: string,
  profileType: "teacher" | "sppgstaff"
) {
  return apiFetch<{ status: string; message: string }>(
    `/api/v1/admin/profiles/${id}/approve`,
    {
      method: "PUT",
      body: JSON.stringify({ profileType }),
    }
  );
}

export async function rejectProfile(
  id: string,
  profileType: "teacher" | "sppgstaff"
) {
  return apiFetch<{ status: string; message: string }>(
    `/api/v1/admin/profiles/${id}/reject`,
    {
      method: "PUT",
      body: JSON.stringify({ profileType }),
    }
  );
}

export interface Teacher {
  _id: string;
  name: string;
  school_id?: {
    _id: string;
    school_name: string;
  };
  user_id?: {
    email: string;
  };
  createdAt: string;
}

export async function fetchApprovedTeachers() {
  return apiFetch<{
    status: string;
    results: number;
    data: { teachers: Teacher[] };
  }>("/api/v1/admin/teachers");
}
