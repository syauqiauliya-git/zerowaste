import { apiFetch } from './api'

export type LoginResponse = {
  token: string
  guru_id: string
  nama: string
}

export async function loginApi(payload: { email: string; password: string }) {
  return apiFetch<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export type RegisterResponse = {
  guru_id: string
  nama: string
  email: string
  sekolah_id: string
  token: string
}

export async function registerApi(payload: {
  nama: string
  email: string
  password: string
  sekolah_id: string
  role?: string
}) {
  return apiFetch<RegisterResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
