import { apiFetch } from "./api";

export interface School {
  _id: string;
  school_name: string;
}

export interface Class {
  _id: string;
  school_id: School;
  class_name: string;
  grade_level: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export async function fetchClasses() {
  return apiFetch<Class[]>("/api/v1/classes");
}

export async function fetchClassDetail(classId: string) {
  return apiFetch<{status: string; data: Class}>(`/api/v1/classes/${classId}`);
}

export type CreateClassDto = {
  school_id: string;
  class_name: string;
  grade_level: string;
};

export async function createClass(classData: CreateClassDto) {
  return apiFetch<{status: string, data: Class}>("/api/v1/classes", {
    method: "POST",
    body: JSON.stringify(classData),
  });
}

export type UpdateClassDto = Partial<{
  class_name: string;
  grade_level: string;
}>;

export async function updateClass(classId: string, classData: UpdateClassDto) {
  return apiFetch<Class>(`/api/v1/classes/${classId}`, {
    method: "PUT",
    body: JSON.stringify(classData),
  });
}

export async function deleteClass(classId: string) {
  return apiFetch<void>(`/api/v1/classes/${classId}`, {
    method: "DELETE",
  });
}

export async function fetchClassesBySchoolId(schoolId: string) {
  return apiFetch<{ status: boolean; results: number; data: Class[] }>(
    `/api/v1/classes/school/${schoolId}`
  );
}
