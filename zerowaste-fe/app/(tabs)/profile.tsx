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
import { getMyTeacherAssignments, TeacherClassAssignment } from '@/lib/assignments';
import { useTranslation } from '@/hooks/useTranslation';
import { setLanguage } from '@/store/slices/languageSlice';
import type { Language } from '@/store/slices/languageSlice';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [profileInfo, setProfileInfo] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ username: '', number: '', name: '' })
  const [classAssignments, setClassAssignments] = useState<TeacherClassAssignment[]>([])
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { t, language } = useTranslation()

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

        if (res.data.user_info.role === 'teacher') {
          try {
            const assignmentsRes = await getMyTeacherAssignments()
            const myAssignments = assignmentsRes.data.assignments.filter(
              (a: TeacherClassAssignment) => a.teacher_id._id === (res.data.user_info as any).teacher_id && a.is_active
            )
            setClassAssignments(myAssignments)
          } catch (err) {
            console.error('Failed to load class assignments', err)
          }
        }
      } catch (err: any) {
        console.error('Failed to load profile', err)
        Alert.alert(t('common.error'), err.message || t('profile.updateFailed'))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [t])

  let content: any = null
  if (loading) {
    content = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    )
  } else {
    content = (
      <View>
        <View style={styles.sppgHeader}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{(profileInfo?.name || userInfo?.username || '').slice(0,1).toUpperCase() || ''}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <MaterialIcons name="verified" size={16} color="#10B981" />
            </View>
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.sppgName}>{profileInfo?.name || userInfo?.username || ''}</Text>
            {userInfo?.role === 'teacher' && (
              <View style={styles.roleContainer}>
                <MaterialIcons name="school" size={14} color="#E6F9F0" />
                <Text style={styles.sppgPosition}>{t('profile.classTeacher')} {classAssignments.map(a => `${a.class_id.grade_level} - ${a.class_id.class_name}`).join(', ')}</Text>
              </View>
            )}
            {userInfo?.role === 'sppg_staff' && (
              <View style={styles.roleContainer}>
                <MaterialIcons name="business" size={14} color="#E6F9F0" />
                <Text style={styles.sppgPosition}>{t('profile.sppg')}</Text>
              </View>
            )}
            {userInfo?.role === 'admin' && (
              <View style={styles.roleContainer}>
                <MaterialIcons name="admin-panel-settings" size={14} color="#E6F9F0" />
                <Text style={styles.sppgPosition}>Administrator</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoHeaderLeft}>
                <MaterialIcons name="person" size={20} color="#10B981" />
                <Text style={styles.infoTitle}>{t('profile.personalInfo')}</Text>
              </View>
              <Pressable 
                onPress={() => setIsEditing(!isEditing)} 
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed
                ]}
              >
                <MaterialIcons name={isEditing ? 'close' : 'edit'} size={20} color={isEditing ? "#EF4444" : "#10B981"} />
              </Pressable>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="person" size={18} color="#10B981" /></View>
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>{t('profile.fullName')}</Text>
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
                <Text style={styles.infoLabel}>{t('profile.phoneNumber')}</Text>
                {isEditing ? (
                  <TextInput value={formData.number} onChangeText={(v) => setFormData({ ...formData, number: v })} style={styles.infoInput} keyboardType="phone-pad" />
                ) : (
                  <Text style={styles.infoValue}>{userInfo?.number || '-'}</Text>
                )}
              </View>
            </View>

            <View style={userInfo?.role === 'teacher' || userInfo?.role === 'sppg_staff' ? styles.infoRow : styles.infoRowLast}>
              <View style={styles.infoIcon}><MaterialIcons name="mail" size={18} color="#10B981" /></View>
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>{t('profile.email')}</Text>
                <Text style={styles.infoValue}>{userInfo?.email || ''}</Text>
              </View>
            </View>

            {userInfo?.role === 'teacher' && (
              <View style={styles.infoRowLast}>
                <View style={styles.infoIcon}><MaterialIcons name="school" size={18} color="#10B981" /></View>
                <View style={styles.infoBody}>
                  <Text style={styles.infoLabel}>{t('profile.school')}</Text>
                  <Text style={styles.infoValue}>{profileInfo?.school_id?.school_name || '-'}</Text>
                </View>
              </View>
            )}

            {userInfo?.role === 'sppg_staff' && (
              <View style={styles.infoRowLast}>
                <View style={styles.infoIcon}><MaterialIcons name="business" size={18} color="#10B981" /></View>
                <View style={styles.infoBody}>
                  <Text style={styles.infoLabel}>{t('profile.sppg')}</Text>
                  <Text style={styles.infoValue}>{profileInfo?.sppg_id?.name || '-'}</Text>
                </View>
              </View>
            )}
          </View>



          {isEditing && (
            <Pressable 
              style={({ pressed }) => [
                styles.button, 
                saving && styles.buttonDisabled,
                pressed && styles.buttonPressed
              ]} 
              onPress={async () => {
                try {
                  setSaving(true)
                  const payload: any = {}
                  if (formData.username) payload.username = formData.username
                  if (formData.number) payload.number = formData.number
                  if (profileInfo && formData.name) payload.name = formData.name
                  await updateMe(payload)
                  Alert.alert(t('common.success'), t('profile.profileUpdated'))
                  setIsEditing(false)
                  const res = await getMe()
                  setUserInfo(res.data.user_info)
                  setProfileInfo(res.data.profile_info)
                  setFormData({ username: (res.data.user_info as any).username ?? '', number: (res.data.user_info as any).number ?? '', name: res.data.profile_info?.name ?? '' })
                } catch (err: any) {
                  console.error('Update failed', err)
                  Alert.alert(t('common.error'), err.message || t('profile.updateFailed'))
                } finally {
                  setSaving(false)
                }
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="save" size={18} color="#fff" />
                  <Text style={styles.buttonText}>{t('profile.saveChanges')}</Text>
                </>
              )}
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
        
        {/* Language Switcher */}
        <View style={styles.sectionContainer}>
          <View style={styles.languageCard}>
            <View style={styles.languageHeader}>
              <MaterialIcons name="language" size={20} color="#10B981" />
              <Text style={styles.languageTitle}>{t('language.title')}</Text>
            </View>
            <View>
              <Pressable
                style={styles.languageDropdownButton}
                onPress={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              >
                <Text style={styles.languageDropdownButtonText}>
                  {language === 'id' ? t('language.indonesian') : t('language.english')}
                </Text>
                <MaterialIcons
                  name={languageDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={24}
                  color="#6b7280"
                />
              </Pressable>
              {languageDropdownOpen && (
                <View style={styles.languageDropdown}>
                  <Pressable
                    onPress={() => {
                      dispatch(setLanguage('id'));
                      setLanguageDropdownOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.languageDropdownItem,
                      language === 'id' && styles.languageDropdownItemActive,
                      pressed && { backgroundColor: "#f3f4f6" },
                    ]}
                  >
                    <Text style={[
                      styles.languageDropdownItemText,
                      language === 'id' && styles.languageDropdownItemTextActive
                    ]}>
                      {t('language.indonesian')}
                    </Text>
                    {language === 'id' && <MaterialIcons name="check" size={20} color="#10B981" />}
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      dispatch(setLanguage('en'));
                      setLanguageDropdownOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.languageDropdownItem,
                      language === 'en' && styles.languageDropdownItemActive,
                      pressed && { backgroundColor: "#f3f4f6" },
                    ]}
                  >
                    <Text style={[
                      styles.languageDropdownItemText,
                      language === 'en' && styles.languageDropdownItemTextActive
                    ]}>
                      {t('language.english')}
                    </Text>
                    {language === 'en' && <MaterialIcons name="check" size={20} color="#10B981" />}
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Logout button at bottom of Profile tab */}
        <View style={styles.sectionContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed
            ]}
            onPress={() => {
              Alert.alert(
                t('profile.logoutConfirm'),
                t('profile.logoutMessage'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('profile.logoutButton'),
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
            <MaterialIcons name="logout" size={18} color="#EF4444" />
            <Text style={styles.logoutButtonText}>{t('profile.logoutButton')}</Text>
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
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
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
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sppgHeader: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#A7F3D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  sppgPosition: {
    color: '#E6F9F0',
    fontSize: 13,
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  sectionContainer: {
    marginTop: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111827',
    letterSpacing: 0.2,
  },
  iconButton: { 
    padding: 8, 
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  iconButtonPressed: {
    backgroundColor: '#E5E7EB',
    transform: [{ scale: 0.95 }],
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  infoRow: { 
    flexDirection: 'row', 
    gap: 14, 
    alignItems: 'center', 
    paddingBottom: 12, 
    marginBottom: 12,
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  infoRowLast: { 
    flexDirection: 'row', 
    gap: 14, 
    alignItems: 'center' 
  },
  infoIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: '#ECFDF5', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoBody: { flex: 1 },
  infoLabel: { 
    fontSize: 11, 
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#111827', 
    marginTop: 1 
  },
  infoInput: { 
    marginTop: 4, 
    borderWidth: 1.5, 
    borderColor: '#10B981', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    backgroundColor: '#F9FAFB',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutButtonPressed: {
    backgroundColor: '#FEF2F2',
    transform: [{ scale: 0.98 }],
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  languageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.2,
  },
  languageDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginTop: 6,
  },
  languageDropdownButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 0.2,
  },
  languageDropdown: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  languageDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageDropdownItemActive: {
    backgroundColor: '#ECFDF5',
  },
  languageDropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  languageDropdownItemTextActive: {
    color: '#10B981',
  },
})
