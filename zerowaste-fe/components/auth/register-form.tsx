import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
	KeyboardAvoidingView,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { AuthHeader } from '@/components/ui/auth-header'
import { Colors } from '@/constants/theme'
import { registerApi } from '@/lib/auth'
import { saveToken } from '@/lib/auth-storage'

type RegisterFormProps = {
	onSignIn?: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSignIn }) => {
	const [fullName, setFullName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [role, setRole] = useState('')
	const [roleOpen, setRoleOpen] = useState(false)
	const [rememberMe, setRememberMe] = useState(false)
	const [sekolahId, setSekolahId] = useState('')
	const [sppgId, setSppgId] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const roles = ['Teacher', 'SPPG', 'Admin']

	// Map visible role labels to backend-accepted values
	// Backend expects: 'teacher' | 'sppg_staff' | 'admin'
	const roleMap: Record<string, string> = {
		Teacher: 'teacher',
		SPPG: 'sppg_staff',
		Admin: 'admin',
	}
	const selectedBackendRole = role ? (roleMap[role] || 'teacher') : 'teacher'

	const handleSubmit = async () => {
		try {
			setLoading(true)
			setError(null)

			// Validate IDs depending on role
			const trimmedSekolah = sekolahId.trim()
			const trimmedSppg = sppgId.trim()

			if (selectedBackendRole === 'teacher') {
				const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(trimmedSekolah)
				if (!isValidObjectId) {
					setError('Sekolah ID harus berupa ObjectId 24 karakter hexadecimal (mis. 6522a4ab0b83f5a8ab123456)')
					return
				}
			}

			if (selectedBackendRole === 'sppg_staff') {
				const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(trimmedSppg)
				if (!isValidObjectId) {
					setError('SPPG ID harus berupa ObjectId 24 karakter hexadecimal')
					return
				}
			}

			const backendRole = selectedBackendRole
			const payload: any = {
				name: fullName,
				email: email.trim(),
				password,
				role: backendRole,
			}
			if (backendRole === 'teacher') {
				payload.school_id = trimmedSekolah
			}
			if (backendRole === 'sppg_staff') {
				payload.sppg_id = trimmedSppg
			}
			const response = await registerApi(payload)
			// save token and role (saveToken expects token and role)
			await saveToken(response.token, backendRole)
			onSignIn?.()
		} catch (e: any) {
			setError(e?.message || 'Register failed')
		} finally {
			setLoading(false)
		}
	}

	const toggleRole = (value: string) => {
		setRole(value)
		setRoleOpen(false)
	}

	return (
		<KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={50}>
			<ScrollView contentContainerStyle={styles.scroll}>
					<AuthHeader size={200} />

					<View style={styles.formBox}>
						<Text style={styles.title}>Create your Account</Text>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

						<View style={styles.fieldGroup}>
							<Text style={styles.label}>Full name</Text>
							<View style={styles.inputWrapper}>
								<Ionicons name="person-outline" size={20} color="#6b7280" style={styles.icon} />
								<TextInput
									value={fullName}
									onChangeText={setFullName}
									placeholder="Full name"
									placeholderTextColor="#9ca3af"
									style={styles.input}
									autoCapitalize="words"
								/>
							</View>
						</View>

						{/* School ID (only for Teacher) */}
						{selectedBackendRole === 'teacher' && (
							<View style={styles.fieldGroup}>
								<Text style={styles.label}>School ID</Text>
								<View style={styles.inputWrapper}>
									<Ionicons name="school-outline" size={20} color="#6b7280" style={styles.icon} />
									<TextInput
										value={sekolahId}
										onChangeText={setSekolahId}
										placeholder="Mongo ObjectId (24 hex)"
										placeholderTextColor="#9ca3af"
										style={styles.input}
										autoCapitalize="none"
									/>
								</View>
							</View>
						)}

						{/* SPPG ID (only for SPPG staff) */}
						{selectedBackendRole === 'sppg_staff' && (
							<View style={styles.fieldGroup}>
								<Text style={styles.label}>SPPG ID</Text>
								<View style={styles.inputWrapper}>
									<Ionicons name="business-outline" size={20} color="#6b7280" style={styles.icon} />
									<TextInput
										value={sppgId}
										onChangeText={setSppgId}
										placeholder="SPPG ObjectId (24 hex)"
										placeholderTextColor="#9ca3af"
										style={styles.input}
										autoCapitalize="none"
									/>
								</View>
							</View>
						)}

						<View style={styles.fieldGroup}>
							<Text style={styles.label}>Email</Text>
							<View style={styles.inputWrapper}>
								<Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.icon} />
								<TextInput
									value={email}
									onChangeText={setEmail}
									placeholder="Email"
									placeholderTextColor="#9ca3af"
									style={styles.input}
									autoCapitalize="none"
									keyboardType="email-address"
								/>
							</View>
						</View>

						<View style={styles.fieldGroup}>
							<Text style={styles.label}>Password</Text>
							<View style={styles.inputWrapper}>
								<Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.icon} />
								<TextInput
									value={password}
									onChangeText={setPassword}
									placeholder="Password"
									placeholderTextColor="#9ca3af"
									style={styles.input}
									secureTextEntry
								/>
							</View>
						</View>

						<View style={styles.fieldGroup}>
							<Text style={styles.label}>Role</Text>
							<View>
								<Pressable style={styles.inputWrapper} onPress={() => setRoleOpen(o => !o)}>
									<Ionicons name="people-outline" size={20} color="#6b7280" style={styles.icon} />
									<Text style={[styles.input, { paddingVertical: 12, color: role ? '#111827' : '#9ca3af' }]}> 
										{role || 'Role'}
									</Text>
									<Ionicons
										name={roleOpen ? 'chevron-up' : 'chevron-down'}
										size={18}
										color="#6b7280"
										style={{ position: 'absolute', right: 14, top: 14 }}
									/>
								</Pressable>
								{roleOpen && (
									<View style={styles.dropdown}>
										{roles.map(r => (
											<Pressable
												key={r}
												onPress={() => toggleRole(r)}
												style={({ pressed }) => [styles.dropdownItem, pressed && { backgroundColor: '#f3f4f6' }]}
											>
												<Text style={styles.dropdownText}>{r}</Text>
											</Pressable>
										))}
									</View>
								)}
							</View>
						</View>

						<Pressable style={styles.rememberRow} onPress={() => setRememberMe(v => !v)}>
							<View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
								{rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
							</View>
							<Text style={styles.rememberText}>Remember me</Text>
						</Pressable>

						<TouchableOpacity activeOpacity={0.85} style={[styles.submitButton, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
							<Text style={styles.submitText}>{loading ? 'SIGNING UP...' : 'SIGN UP'}</Text>
						</TouchableOpacity>

						<View style={styles.signInRow}>
							<Text style={styles.signInHint}>Already have an account? </Text>
							<Pressable onPress={onSignIn}>
								<Text style={styles.signInLink}>Sign In</Text>
							</Pressable>
						</View>
					</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}


const styles = StyleSheet.create({
	scroll: {
		flexGrow: 1,
		paddingBottom: 32,
	},
	formBox: {
		paddingHorizontal: 24,
		paddingTop: 32,
		paddingBottom: 40,
	},
	title: {
		fontSize: 22,
		fontWeight: '700',
		textAlign: 'center',
		marginBottom: 28,
		color: '#111827',
	},
	errorText: {
		color: '#b91c1c',
		marginBottom: 8,
		fontSize: 13,
		fontWeight: '600',
		textAlign: 'center',
	},
	fieldGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 13,
		fontWeight: '600',
		color: '#6b7280',
		marginBottom: 6,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f3f4f6',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		paddingLeft: 40,
		paddingRight: 14,
		minHeight: 52,
	},
	icon: {
		position: 'absolute',
		left: 12,
	},
	input: {
		flex: 1,
		fontSize: 15,
		color: '#111827',
		paddingVertical: 8,
	},
	dropdown: {
		marginTop: 6,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		borderRadius: 10,
		backgroundColor: '#fff',
		overflow: 'hidden',
	},
	dropdownItem: {
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	dropdownText: {
		fontSize: 15,
		color: '#111827',
	},
	rememberRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 24,
	},
	checkbox: {
		width: 22,
		height: 22,
		borderRadius: 6,
		borderWidth: 2,
		borderColor: '#10b981',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
	},
	checkboxChecked: {
		backgroundColor: '#10b981',
	},
	rememberText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#111827',
	},
	submitButton: {
		backgroundColor: Colors.light.secondary,
		borderRadius: 10,
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 3 },
		elevation: 3,
	},
	submitText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 15,
		letterSpacing: 0.5,
	},
	signInRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 28,
	},
	signInHint: {
		color: '#6b7280',
		fontSize: 13,
	},
	signInLink: {
		color: Colors.light.secondary,
		fontWeight: '600',
		fontSize: 13,
	},
})

export default RegisterForm
