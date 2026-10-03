import { apiFetch } from "./api";

export interface SPPG {
  _id: string;
  name: string;
  address: string;
  number?: string;
  is_active?: boolean;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSPPGData {
  name: string;
  address: string;
  is_active?: boolean;
}

export interface UpdateSPPGData {
  name: string;
  address: string;
  is_active?: boolean;
}

export async function fetchAllSPPG(): Promise<SPPG[]> {
  const response = await apiFetch<{
    status: string;
    results: number;
    data: SPPG[];
  }>("/api/v1/sppg");
  return response.data;
}

export async function fetchSPPGById(id: string): Promise<SPPG> {
  const response = await apiFetch<{
    status: string;
    data: SPPG;
  }>(`/api/v1/sppg/${id}`);
  return response.data;
}

export async function createSPPG(sppgData: CreateSPPGData): Promise<SPPG> {
  const response = await apiFetch<{ status: string; data: SPPG }>('/api/v1/sppg', {
    method: 'POST',
    body: JSON.stringify(sppgData),
  });
  return response.data;
}

export async function updateSPPG(sppgId: string, sppgData: UpdateSPPGData): Promise<SPPG> {
  const response = await apiFetch<{ status: string; data: SPPG }>(`/api/v1/sppg/${sppgId}`, {
    method: 'PUT',
    body: JSON.stringify(sppgData),
  });
  return response.data;
}

export async function deleteSPPG(sppgId: string): Promise<void> {
  await apiFetch(`/api/v1/sppg/${sppgId}`, {
    method: 'DELETE',
  });
}
