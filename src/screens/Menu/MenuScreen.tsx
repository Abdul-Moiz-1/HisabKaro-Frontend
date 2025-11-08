import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationProps } from '../../types';
import { theme } from '../../constants/theme';
import { Container } from '../../components/common';

const MenuScreen: React.FC<NavigationProps<'Menu'>> = ({ navigation }) => {
  return (
    <Container safeArea style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Menu</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Text style={styles.description}>
          This screen will contain app settings, profile management, and other menu options.
        </Text>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MenuScreen;
