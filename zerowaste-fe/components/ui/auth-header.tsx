import React from 'react'
import { StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Logo } from '@/components/ui/logo'
import { Colors } from '@/constants/theme'

interface AuthHeaderProps {
    size?: number
    topColor?: string
    bottomColor?: string
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ size = 200, topColor, bottomColor }) => {
    const top = topColor ?? Colors.light.primary 
    const bottom = bottomColor ?? Colors.light.secondary 

    return (
        <LinearGradient colors={[top, bottom]} style={styles.headerBox}>
            <Logo size={size} />
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    headerBox: {
        paddingTop: 40,
        paddingBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default AuthHeader
