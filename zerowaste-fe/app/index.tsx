import React, { useState } from 'react'
import { View } from 'react-native'
import { WelcomeScreen } from '@/components/welcome-screen'
import { RegisterForm } from '@/components/auth/register-form'
import { LoginForm } from '@/components/auth/login-form'

export default function Index() {
  const [screen, setScreen] = useState<'welcome' | 'register' | 'login'>('welcome')

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
