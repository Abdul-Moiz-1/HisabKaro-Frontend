// components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Permission, Role } from '../types/rbac.types';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../theme/types';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission | Permission[];
  requiredRole?: Role | Role[];
  fallback?: ReactNode;
  showUnauthorized?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback,
  showUnauthorized = true,
}) => {
  const { hasPermission, hasRole } = useAuth();
  const styles = useThemedStyles(createStyles);

  const isAuthorized = () => {
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return false;
    }
    if (requiredRole && !hasRole(requiredRole)) {
      return false;
    }
    return true;
  };

  if (!isAuthorized()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUnauthorized) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.title}>Access Denied</Text>
          <Text style={styles.message}>
            You don't have permission to access this feature.
          </Text>
        </View>
      );
    }

    return null;
  }

  return <>{children}</>;
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center' as const,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
  },
});
