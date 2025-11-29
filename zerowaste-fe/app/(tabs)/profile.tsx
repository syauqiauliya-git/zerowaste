import { StyleSheet, Text, View, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { getMe, updateMe } from '@/lib/user';
import { Ionicons } from '@expo/vector-icons'
import { useAppDispatch } from '@/store/hooks';
import { clearRole } from '@/store/slices/authSlice';
import { removeToken } from '@/lib/auth-storage';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [profileInfo, setProfileInfo] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ username: '', number: '', name: '' })
  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await getMe()
        // console.log('Profile data', res.data)
        setUserInfo(res.data.user_info)
        setProfileInfo(res.data.profile_info)

        setFormData({
          username: (res.data.user_info as any).username ?? '',
          number: (res.data.user_info as any).number ?? '',
          name: res.data.profile_info?.name ?? '',
        })
      } catch (err: any) {
        console.error('Failed to load profile', err)
        Alert.alert('Error', err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  let content: any = null
  if (loading) {
    content = <ActivityIndicator size="large" color="#10B981" />
  } else {
    content = (
      <View>
        <View style={styles.sppgHeader}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={{ fontSize: 28 }}>{(profileInfo?.name || userInfo?.username || '').slice(0,1).toUpperCase() || ''}</Text>
            </View>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={styles.sppgName}>{profileInfo?.name || userInfo?.username || ''}</Text>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Informasi Personal</Text>
            <Pressable onPress={() => setIsEditing(!isEditing)} style={styles.iconButton}>
              <MaterialIcons name={isEditing ? 'close' : 'edit'} size={20} color="#065F46" />
            </Pressable>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="person" size={18} color="#10B981" /></View>
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>Nama Lengkap</Text>
                {isEditing ? (
                  <TextInput value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} style={styles.infoInput} />
                ) : (
                  <Text style={styles.infoValue}>{profileInfo?.name || userInfo?.username || ''}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="call" size={18} color="#10B981" /></View>
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>Nomor Telepon</Text>
                {isEditing ? (
                  <TextInput value={formData.number} onChangeText={(v) => setFormData({ ...formData, number: v })} style={styles.infoInput} keyboardType="phone-pad" />
                ) : (
                  <Text style={styles.infoValue}>{userInfo?.number || ''}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRowLast}>
              <View style={styles.infoIcon}><MaterialIcons name="mail" size={18} color="#10B981" /></View>
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userInfo?.email || ''}</Text>
              </View>
            </View>
          </View>

          {isEditing && (
            <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={async () => {
              try {
                setSaving(true)
                const payload: any = {}
                if (formData.username) payload.username = formData.username
                if (formData.number) payload.number = formData.number
                if (profileInfo && formData.name) payload.name = formData.name
                await updateMe(payload)
                Alert.alert('Success', 'Profile updated')
                setIsEditing(false)
                const res = await getMe()
                setUserInfo(res.data.user_info)
                setProfileInfo(res.data.profile_info)
                setFormData({ username: (res.data.user_info as any).username ?? '', number: (res.data.user_info as any).number ?? '', name: res.data.profile_info?.name ?? '' })
              } catch (err: any) {
                console.error('Update failed', err)
                Alert.alert('Error', err.message || 'Failed to update profile')
              } finally {
                setSaving(false)
              }
            }}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Simpan Perubahan</Text>}
            </Pressable>
          )}
        </View>
      </View>
    )
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<MaterialIcons name="home" size={28} color="#808080" />}
      headerHeight={0}
      contentStyle={{ padding: 0 }}
    >
      <View style={styles.container}>
        {content}
        {/* Logout button at bottom of Profile tab */}
        <View style={{ marginTop: 18 }}>
          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await removeToken();
                      } catch (err) {
                        console.error('Failed to remove token', err);
                      }
                      dispatch(clearRole());
                      router.replace('/');
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <MaterialIcons name="logout" size={18} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  value: {
    fontSize: 15,
    color: '#111827',
    marginTop: 6,
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sppgHeader: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#C7F9E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#A7F3D0',
  },
  avatarDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  sppgName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  sppgPosition: {
    color: '#E6F9F0',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  iconButton: { padding: 6, borderRadius: 8 },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // subtle shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    // elevation for Android
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoRowLast: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  infoIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  infoBody: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#6B7280' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 4 },
  infoInput: { marginTop: 6, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FFFFFF',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
})
