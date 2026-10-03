import { apiFetch } from '@/lib/api'

export type UserInfo = {
  _id: string
  email: string
  username?: string
  role?: string
}

export type ProfileInfo = any

export type GetMeResponse = {
  status: 'success'
  data: {
    user_info: UserInfo
    profile_info: ProfileInfo
  }
}

export async function getMe() {
  return apiFetch<GetMeResponse>('/api/v1/users/me')
}

export async function updateMe(payload: { username?: string; number?: string; name?: string }) {
  return apiFetch<{ status: string; message?: string; data?: any }>(
    '/api/v1/users/update-me',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  )
}

export default { getMe, updateMe }
