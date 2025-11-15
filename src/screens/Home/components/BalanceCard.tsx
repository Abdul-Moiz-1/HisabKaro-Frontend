import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';

interface BalanceCardProps {
  userName: string;
  balance: number;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  onBalancePress?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ 
  userName, 
  balance, 
  onAvatarPress,
  onNotificationPress,
  onBalancePress
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo} 
          onPress={onAvatarPress}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
          <View style={styles.notificationBadge}>
            <View style={styles.notificationDot} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>🌙</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.balanceSection}
        onPress={onBalancePress || onAvatarPress}
        activeOpacity={0.7}
      >
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  userInfo: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...theme.typography.body,
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.text.primary,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  balanceSection: {
    alignItems: 'flex-start',
  },
  balanceLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  balanceAmount: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
});
