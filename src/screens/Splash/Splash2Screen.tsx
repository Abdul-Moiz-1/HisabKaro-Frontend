import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationProps } from '../../types';
import { ROUTES } from '../../constants/routes';
import { theme } from '../../constants/theme';
import { Container, Logo, GradientCircle, Button } from '../../components/common';

const Splash2Screen: React.FC<NavigationProps<'Splash2'>> = ({ navigation }) => {
  const handleNext = () => {
    navigation.replace(ROUTES.SPLASH3);
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

        <View style={styles.circleContainer}>
          <GradientCircle size={200} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Budget Smarter</Text>
          <Text style={styles.description}>
            Set your monthly budget, track expenses, and save more effectively
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
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  circleContainer: {
    marginVertical: theme.spacing.xl,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
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

export default Splash2Screen;


