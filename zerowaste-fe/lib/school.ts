import { apiFetch } from '@/lib/api';

export interface School {
  _id: string;
  school_name: string;
  address: string;
  jml_murid: number;
  jml_kelas: number;
  is_active?: boolean;
  created_at?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CreateSchoolData {
  school_name: string;
  address: string;
  jml_murid: number;
  jml_kelas: number;
}

export interface UpdateSchoolData {
  school_name: string;
  address: string;
  jml_murid: number;
  jml_kelas: number;
}

export const fetchSchools = async (): Promise<School[]> => {
  const response = await apiFetch<{ data: { schools: School[] } }>('/api/v1/schools');
  return response.data.schools;
};

export const createSchool = async (schoolData: CreateSchoolData): Promise<School> => {
  const response = await apiFetch<{ data: { school: School } }>('/api/v1/schools', {
    method: 'POST',
    body: JSON.stringify(schoolData),
  });
  return response.data.school;
};

export const updateSchool = async (schoolId: string, schoolData: UpdateSchoolData): Promise<School> => {
  const response = await apiFetch<{ data: { school: School } }>(`/api/v1/schools/${schoolId}`, {
    method: 'PUT',
    body: JSON.stringify(schoolData),
  });
  return response.data.school;
};

export const fetchSchoolDetail = async (schoolId: string): Promise<School> => {
  const response = await apiFetch<{ data: { school: School } }>(`/api/v1/schools/${schoolId}`);
  return response.data.school;
};

export const deleteSchool = async (schoolId: string): Promise<void> => {
  await apiFetch(`/api/v1/schools/${schoolId}`, {
    method: 'DELETE',
  });
};
