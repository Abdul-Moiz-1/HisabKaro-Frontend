import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { Container, Button } from '../../components/common';
import { Input } from '../../components/forms';
import { theme } from '../../constants/theme';
import { authService, AuthServiceError } from '../../services/authService';
import { isValidEmail, isValidPassword } from '../../utils';
import { ROUTES } from '../../constants/routes';

type Step = 'request' | 'verify' | 'reset';

const ForgotPasswordScreen: React.FC<NavigationProps<'ForgotPassword'>> = ({ navigation }) => {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async () => {
    if (!isValidEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid email',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword({ email: email.trim() });
      Toast.show({
        type: 'success',
        text1: 'Reset link sent',
        text2: 'Check your email for the verification code',
      });
      setStep('verify');
    } catch (error) {
      const apiError = error as AuthServiceError;
      Toast.show({
        type: 'error',
        text1: 'Request failed',
        text2: apiError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!code.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing code',
        text2: 'Enter the verification code from your email',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyResetToken({ code: code.trim() });

      if (response.data?.valid) {
        if (response.data.email) {
          setEmail(response.data.email);
        }
        Toast.show({
          type: 'success',
          text1: 'Code verified',
          text2: 'You can now set a new password',
        });
        setStep('reset');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid code',
          text2: 'The code is invalid or expired',
        });
      }
    } catch (error) {
      const apiError = error as AuthServiceError;
      Toast.show({
        type: 'error',
        text1: 'Verification failed',
        text2: apiError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isValidPassword(newPassword)) {
      Toast.show({
        type: 'error',
        text1: 'Weak password',
        text2: 'Password must be at least 8 characters',
      });
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({ code: code.trim(), newPassword });

      Toast.show({
        type: 'success',
        text1: 'Password updated',
        text2: 'You can now sign in with your new password',
      });

      navigation.replace(ROUTES.LOGIN);
    } catch (error) {
      const apiError = error as AuthServiceError;
      Toast.show({
        type: 'error',
        text1: 'Reset failed',
        text2: apiError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'request':
        return (
          <>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter the email associated with your account and we will send a verification code.
            </Text>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Button title="Send reset link" onPress={handleRequestReset} loading={loading} style={styles.button} />
          </>
        );
      case 'verify':
        return (
          <>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We sent a one-time code to {email || 'your email'}. Enter it below to continue.
            </Text>
            <Input
              label="Verification code"
              value={code}
              onChangeText={setCode}
              placeholder="Enter code"
              autoCapitalize="none"
            />
            <Button title="Verify code" onPress={handleVerifyToken} loading={loading} style={styles.button} />
          </>
        );
      case 'reset':
        return (
          <>
            <Text style={styles.title}>Set a New Password</Text>
            <Text style={styles.subtitle}>Choose a strong password that you have not used before.</Text>
            <Input
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
              showPasswordToggle
            />
            <Button title="Update password" onPress={handleResetPassword} loading={loading} style={styles.button} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container scrollable>
      <View style={styles.content}>
        {renderContent()}
        <Button
          title="Back to Login"
          variant="secondary"
          onPress={() => navigation.replace(ROUTES.LOGIN)}
          style={styles.secondaryButton}
        />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
  secondaryButton: {
    marginTop: theme.spacing.sm,
  },
});

export default ForgotPasswordScreen;


