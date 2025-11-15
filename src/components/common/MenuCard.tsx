import React, { useRef, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableOpacityProps, Animated } from 'react-native';
import { theme } from '../../constants/theme';

interface MenuCardProps extends TouchableOpacityProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const MenuCardComponent: React.FC<MenuCardProps> = ({
  icon,
  title,
  description,
  onPress,
  style,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
    onPress?.();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        {...props}
      >
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    minHeight: 140,
    justifyContent: 'flex-start',
    ...theme.shadows.md,
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  description: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
});

export const MenuCard = memo(MenuCardComponent);

