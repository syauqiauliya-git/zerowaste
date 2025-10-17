import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'auth_token'
const ROLE_KEY = 'role_token'

export async function saveToken(token: string, role: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
  await SecureStore.setItemAsync(ROLE_KEY, role)
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY)
}

export async function getRole(): Promise<string | null> {
  return await SecureStore.getItemAsync(ROLE_KEY)
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
  await SecureStore.deleteItemAsync(ROLE_KEY)
}

export async function hasToken(): Promise<boolean> {
  const token = await getToken()
  console.log("Token: ", token);
  return token !== null
}