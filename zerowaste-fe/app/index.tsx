import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { WelcomeScreen } from '@/components/welcome-screen'
import { RegisterForm } from '@/components/auth/register-form'
import { LoginForm } from '@/components/auth/login-form'
import { hasToken } from '@/lib/auth-storage'

export default function Index() {
  const [screen, setScreen] = useState<'welcome' | 'register' | 'login'>('welcome')

  useEffect(() => {
    // Check if user is already logged in
    hasToken().then(isLoggedIn => {
      console.log('Is user logged in?', isLoggedIn);
      if (isLoggedIn) {
        router.replace('/(tabs)/home')
      }
    })
  }, [])

  return (
    <View style={{ flex: 1 }}>
      {screen === 'welcome' && (
        <WelcomeScreen onDone={() => setScreen('register')} />
      )}
      {screen === 'register' && (
        <RegisterForm onSignIn={() => setScreen('login')} />
      )}
      {screen === 'login' && (
        <LoginForm onSignUp={() => setScreen('register')} />
      )}
    </View>
  )
}
