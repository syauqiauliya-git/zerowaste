import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Logo } from '@/components/ui/logo'
import { Colors } from '@/constants/theme'

type WelcomeScreenProps = {
	onDone: () => void
	delayMs?: number
}


export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onDone, delayMs = 10000 }) => {
	useEffect(() => {
		const t = setTimeout(onDone, delayMs)
		return () => clearTimeout(t)
	}, [onDone, delayMs])

	return (
		<View style={styles.root}>
			<Pressable style={{ flex: 1 }} onPress={onDone} android_ripple={{ color: 'rgba(255,255,255,0.1)' }}>
				<LinearGradient colors={[Colors.light.primary, Colors.light.secondary]} style={styles.card}>
								<View style={styles.header}>
									<Logo size={250} />
								</View>

						<View style={styles.centerImageWrap}>
							<Image
								source={require('../assets/images/splash-icon.png')}
								style={styles.centerImage}
								resizeMode="contain"
							/>
						</View>

					<View style={styles.footer}>
						<Text style={styles.tagline}>TRACK, ANALYZE,{"\n"}AND REDUCE{"\n"}FOOD WASTE</Text>
					</View>
				</LinearGradient>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	card: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 28,
		paddingBottom: 24,
		justifyContent: 'space-between',
	},
		header: {
			alignItems: 'center',
			marginTop: 8,
		},
		logo: {
			width: 250,
			height: 250,
		},
	centerImageWrap: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	centerImage: {
		width: 250,
		height: 250,
	},
	footer: {
		alignItems: 'center',
		marginBottom: 8,
	},
	tagline: {
		color: '#ffffff',
		opacity: 0.95,
		textAlign: 'center',
		fontWeight: '800',
		letterSpacing: 0.5,
	},
})

export default WelcomeScreen
