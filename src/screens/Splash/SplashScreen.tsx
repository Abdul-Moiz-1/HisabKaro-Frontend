import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationProps } from '../../types';
import { ROUTES } from '../../constants/routes';
import { theme } from '../../constants/theme';
import { Container, Logo, Button } from '../../components/common';

const SplashScreen: React.FC<NavigationProps<'Splash'>> = ({ navigation }) => {
  const handleNext = () => {
    navigation.replace(ROUTES.SPLASH2);
  };

  const handleSkip = () => {
    navigation.replace(ROUTES.LOGIN);
  };

  return (
    <Container style={styles.container} safeArea>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size="large" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Take Control of Your Finances</Text>
          <Text style={styles.description}>
            Welcome to Fintrack! Your personal financial companion. Take control of your money
            effortlessly and plus, our AI-powered chat is here to assist you along the way
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Next" onPress={handleNext} variant="primary" size="large" />
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  skipButton: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  skipText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});

export default SplashScreen;


