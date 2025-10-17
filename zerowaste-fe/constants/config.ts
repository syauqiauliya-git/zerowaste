import { Platform } from 'react-native'

// Prefer setting EXPO_PUBLIC_API_BASE_URL in your env for flexibility.
// Fallbacks for common dev scenarios (adjust to your LAN IP if testing on device)
const DEFAULTS = {
  // Match backend runtime PORT (currently 5010 per server logs)
  androidEmu: 'http://192.168.0.5:5010', // Android emulator maps host localhost
  iosSim: 'http://localhost:5010',
  deviceLAN: 'http://192.168.0.100:5010', // <- change this to your PC LAN IP
}

// Build a sensible default for web so that when you open Expo Web from another device,
// it targets the dev machine IP instead of that device's localhost.
const WEB_DEFAULT =
  typeof window !== 'undefined' && window.location?.hostname
    ? `http://${window.location.hostname}:5010`
    : DEFAULTS.iosSim

function resolveApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL
  if (Platform.OS === 'android') return DEFAULTS.androidEmu
  if (Platform.OS === 'web') return WEB_DEFAULT
  return DEFAULTS.iosSim
}

export const API_BASE_URL = resolveApiBaseUrl()

// Note: For physical devices, set EXPO_PUBLIC_API_BASE_URL to your PC LAN IP, e.g.:
//   EXPO_PUBLIC_API_BASE_URL=http://<your-lan-ip>:5000
