import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'
import Header from '@/components/ui/header'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification
} from '@/lib/notification'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetchNotifications()
      setNotifications(response.data.notifications)
      setUnreadCount(response.unreadCount)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      Alert.alert('Error', 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadNotifications()
    setRefreshing(false)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      Alert.alert('Success', 'All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      Alert.alert('Error', 'Failed to mark all as read')
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
      Alert.alert('Error', 'Failed to delete notification')
    }
  }

  const renderRightActions = (notificationId: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(notificationId)}
      >
        <MaterialIcons name="delete" size={24} color="#FFF" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    )
  }

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  return (
    <GestureHandlerRootView style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Header title="Notifications" icon="notifications" />

        <View style={styles.headerRow}>
          <Text style={styles.subtitle}>
            {unreadCount} unread
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text style={styles.markAllBtn}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading notifications...</Text>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          notifications.map((n) => (
            <Swipeable
              key={n._id}
              renderRightActions={() => renderRightActions(n._id)}
              overshootRight={false}
            >
              <TouchableOpacity
                style={[
                  styles.card,
                  n.type === 'success' && styles.cardSuccess,
                  n.type === 'info' && styles.cardInfo,
                  n.type === 'warning' && styles.cardWarning,
                  n.type === 'error' && styles.cardError,
                  !n.is_read && styles.cardUnread
                ]}
                onPress={() => !n.is_read && handleMarkAsRead(n._id)}
              >
                <View style={styles.cardLeft}>
                  {n.type === 'success' && <MaterialIcons name="check-circle" size={20} color="#065F46" />}
                  {n.type === 'info' && <Ionicons name="information-circle" size={20} color="#0ea5a4" />}
                  {n.type === 'warning' && <MaterialIcons name="warning" size={20} color="#b45309" />}
                  {n.type === 'error' && <MaterialIcons name="error" size={20} color="#991b1b" />}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{n.title}</Text>
                  <Text style={styles.cardText}>{n.body}</Text>
                  <Text style={styles.cardTime}>
                    <Ionicons name="time" size={12} color="#6B7280" /> {" "}{getTimeAgo(n.createdAt)}
                  </Text>
                </View>
                {!n.is_read && <View style={styles.cardDot} />}
              </TouchableOpacity>
            </Swipeable>
          ))
        )}

      </ScrollView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  backButton: { padding: 8, borderRadius: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#064E3B' },
  subtitle: { color: '#6B7280', fontSize: 13 },
  markAllBtn: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '600'
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 32
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12
  },
  card: {
    backgroundColor: '#F8FFF7',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6F9F0'
  },
  cardSuccess: { backgroundColor: '#F8FFF7', borderColor: '#E6F9F0' },
  cardInfo: { backgroundColor: '#F8FFF7', borderColor: '#E6F9F0' },
  cardWarning: { backgroundColor: '#F8FFF7', borderColor: '#E6F9F0' },
  cardError: { backgroundColor: '#F8FFF7', borderColor: '#E6F9F0' },
  cardUnread: {
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  cardLeft: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#064E3B', marginBottom: 6 },
  cardText: { color: '#4B5563', marginBottom: 8 },
  cardTime: { color: '#6B7280', fontSize: 12 },
  cardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981'
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginBottom: 12,
  },
  deleteText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
})
