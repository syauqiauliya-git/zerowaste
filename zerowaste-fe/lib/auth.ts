import { apiFetch } from './api'
import { removeToken } from './auth-storage'

export type LoginResponse = {
  user_id: string
  token: string
  message: string
  role: "admin" | "teacher" | "sppg_staff"
  sppg_id?: string
  staff_id?: string
  teacher_id?: string
  school_id?: string
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

export async function logout() {
  await removeToken()
}
