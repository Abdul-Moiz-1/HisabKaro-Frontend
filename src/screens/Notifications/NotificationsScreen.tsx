import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { BellSlashIcon, CheckCircleIcon } from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, NotificationCard } from '../../components/common';
import { Notification } from '../../components/common/NotificationCard';
import { useTheme } from '../../store/hooks';
import { notificationsApi, Notification as ApiNotification } from '../../services/api';

const NotificationsScreen: React.FC<NavigationProps<'Notifications'>> = ({ navigation }) => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Map API notification to component notification
  const mapNotification = (apiNotification: ApiNotification): Notification => {
    const iconMap: Record<string, string> = {
      payment: '💰',
      invoice: '📄',
      customer: '👤',
      supplier: '📦',
      reminder: '📅',
      system: '🔔',
    };

    const colorMap: Record<string, string> = {
      success: theme.colors.success,
      info: theme.colors.info,
      warning: theme.colors.warning,
      error: theme.colors.error,
    };

    // Format timestamp
    const date = new Date(apiNotification.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timestamp = '';
    if (diffDays === 0) {
      timestamp = `Today | ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (diffDays === 1) {
      timestamp = `Yesterday | ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      timestamp = `${diffDays} days ago`;
    }

    return {
      id: String(apiNotification.id),
      title: apiNotification.title,
      description: apiNotification.message,
      timestamp,
      icon: iconMap[apiNotification.category] || '🔔',
      iconColor: colorMap[apiNotification.type] || theme.colors.text.secondary,
      isRead: apiNotification.isRead,
    };
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await notificationsApi.getAll({ limit: 50 });
      const mappedNotifications = response.data.map(mapNotification);
      setNotifications(mappedNotifications);
      setUnreadCount(response.unreadCount);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch notifications',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [theme]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle mark as read
  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationsApi.markAsRead(Number(notification.id));
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Handle navigation based on notification type (could be extended)
    console.log('Notification pressed:', notification.id);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'All notifications marked as read',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to mark notifications as read',
      });
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationsApi.delete(Number(id));
      setNotifications(prev => prev.filter(n => n.id !== id));
      Toast.show({
        type: 'success',
        text1: 'Deleted',
        text2: 'Notification removed',
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <BellSlashIcon size={64} color={theme.colors.text.disabled} weight="light" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  // Render loading state
  if (loading) {
    return (
      <Container safeArea edges={['top']}>
        <HeaderNavigation
          title="Notifications"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.markAllButton}
              activeOpacity={0.7}
            >
              <CheckCircleIcon size={16} color={theme.colors.primary} />
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchNotifications(true)}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />
    </Container>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xl,
    },
    emptyListContent: {
      flex: 1,
    },
    markAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: `${theme.colors.primary}15`,
      borderRadius: theme.borderRadius.md,
    },
    markAllText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });

export default NotificationsScreen;
