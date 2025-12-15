import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, NotificationCard } from '../../components/common';
import { Notification } from '../../components/common/NotificationCard';
import { theme } from '../../constants/theme';

const NotificationsScreen: React.FC<NavigationProps<'Notifications'>> = ({ navigation }) => {
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'New Transaction',
      description: 'You received a payment of Rs.5,000',
      timestamp: 'Today | 8:25 AM',
      icon: '💰',
      iconColor: theme.colors.warning,
      isRead: false,
    },
    {
      id: '2',
      title: 'Bill Reminder',
      description: "Don't forget to pay your electricity bill by the end of the week",
      timestamp: 'Today | 14:25 PM',
      icon: '📅',
      iconColor: theme.colors.warning,
      isRead: false,
    },
    {
      id: '3',
      title: 'Budget Alert',
      description: "You've exceeded 90% of your monthly budget for 'Groceries'.",
      timestamp: '1 day ago | 14:25 PM',
      icon: '📊',
      iconColor: theme.colors.warning,
      isRead: true,
    },
    {
      id: '4',
      title: 'Expense Alert',
      description: 'Your recent grocery expense was higher than usual. Review your spending.',
      timestamp: '3 days ago | 14:25 PM',
      icon: '👁️',
      iconColor: theme.colors.warning,
      isRead: true,
    },
  ];

  const handleMarkAllAsRead = () => {
    // Implement mark all as read functionality
    console.log('Mark all as read');
  };

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title="Notifications"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => {
              // Navigate to notification details or handle action
              console.log('Notification pressed', item.id);
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  markAllText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default NotificationsScreen;

