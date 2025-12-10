import { API_BASE_URL } from '@/constants/config'
import { getToken, removeToken } from '@/lib/auth-storage'
import { router } from 'expo-router'

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  // Add token if available
  const token = await getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Dev helper: log the request URL to diagnose networking issues (emulator vs device)
  if (__DEV__) {
    // Avoid logging sensitive headers/body
    console.log('[apiFetch] ->', url)
  }

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401 || res.status === 403) {
    console.log('[apiFetch] Token expired or unauthorized, redirecting to login...')
    await removeToken()
    router.replace('/')
    throw new Error('Session expired. Please login again.')
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : await res.text()
  if (!res.ok) {
    const msg = typeof data === 'string' ? data : data?.message || 'Request failed'
    throw new Error(msg)
  }
  return data as T
}
