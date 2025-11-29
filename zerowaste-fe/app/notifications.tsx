import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import Header from '@/components/ui/header'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function NotificationsScreen() {


  const notifications = [
    {
      id: '1',
      title: 'Class 1A Food Waste Update',
      body: 'Your class reduced waste by 12% this week!',
      time: '1h ago',
      variant: 'success',
    },
    {
      id: '2',
      title: 'Leaderboard Update',
      body: "Your class moved up to rank 5 in the leaderboard",
      time: '2h ago',
      variant: 'info',
    },
    {
      id: '3',
      title: 'System Maintenance',
      body: 'Server maintenance scheduled for tonight at 10 PM',
      time: '1d ago',
      variant: 'warning',
    },
  ]

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header title="Notifications" icon="notifications" />
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.subtitle}>2 unread</Text>
        </View>

        {notifications.map((n) => (
          <View key={n.id} style={[styles.card, n.variant === 'success' && styles.cardSuccess, n.variant === 'info' && styles.cardInfo]}>
            <View style={styles.cardLeft}>
              {n.variant === 'success' && <MaterialIcons name="check-circle" size={20} color="#065F46" />}
              {n.variant === 'info' && <Ionicons name="information-circle" size={20} color="#0ea5a4" />}
              {n.variant === 'warning' && <MaterialIcons name="warning" size={20} color="#b45309" />}
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{n.title}</Text>
              <Text style={styles.cardText}>{n.body}</Text>
              <Text style={styles.cardTime}>
                <Ionicons name="time" size={12} color="#6B7280" /> {" "}{n.time}
              </Text>
            </View>
            <View style={styles.cardDot} />
          </View>
        ))}

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  backButton: { padding: 8, borderRadius: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#064E3B' },
  subtitle: { color: '#6B7280', fontSize: 13 },
  card: { backgroundColor: '#F8FFF7', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E6F9F0' },
  cardSuccess: { backgroundColor: '#ECFDF5' },
  cardInfo: { backgroundColor: '#EEF2FF' },
  cardLeft: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#064E3B', marginBottom: 6 },
  cardText: { color: '#4B5563', marginBottom: 8 },
  cardTime: { color: '#6B7280', fontSize: 12 },
  cardDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' },
})
