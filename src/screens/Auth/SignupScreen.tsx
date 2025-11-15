import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { NavigationProps } from '../../types';
import { ROUTES } from '../../constants/routes';
import { theme } from '../../constants/theme';
import { Container, Button, Logo } from '../../components/common';
import { Input } from '../../components/forms';
import { isValidEmail, isValidPassword } from '../../utils';
import { useAppDispatch } from '../../store/hooks';
import { setLoading } from '../../store/slices/userSlice';
import Toast from 'react-native-toast-message';
import { authService, AuthServiceError } from '../../services/authService';

const SignupScreen: React.FC<NavigationProps<'Signup'>> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLocalLoading] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;

    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      isValid = false;
    } else if (fullName.trim().length < 2) {
      setFullNameError('Full name must be at least 2 characters');
      isValid = false;
    } else {
      setFullNameError('');
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!isValidPassword(password)) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (phoneNumber.trim() && phoneNumber.trim().length < 10) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    } else {
      setPhoneError('');
    }

    return isValid;
  };

  const handleSignup = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please check your input fields',
      });
      return;
    }

    setLocalLoading(true);
    // dispatch(setLoading(true));

    const nameParts = fullName.trim().split(' ');
    const firstNameValue = nameParts.shift() ?? '';
    const lastNameValue = nameParts.length ? nameParts.join(' ') : 'User';
    const usernameValue = email.includes('@') ? email.split('@')[0] : email;

    try {
      await authService.signup({
        username: usernameValue,
        email: email.trim(),
        password,
        firstName: firstNameValue,
        lastName: lastNameValue,
      });

      Toast.show({
        type: 'success',
        text1: 'Account created',
        text2: 'You can now sign in',
      });

      navigation.replace(ROUTES.LOGIN);
    } catch (error) {
      const apiError = error as AuthServiceError;
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: apiError.message,
      });
    } finally {
      setLocalLoading(false);
      // dispatch(setLoading(false));
    }
  };

  const navigateToLogin = () => {
    navigation.goBack();
  };

  return (
    <Container scrollable safeArea style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size="large" />
        </View>

        <Text style={styles.title}>Sign up!</Text>

        <View style={styles.form}>
          <Input
            label="Full name*"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (fullNameError) setFullNameError('');
            }}
            error={fullNameError}
            autoCapitalize="words"
            autoComplete="name"
          />

          <Input
            label="E-mail"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
            secureTextEntry
            showPasswordToggle
            autoCapitalize="none"
            autoComplete="password-new"
          />

          <Input
            label="Phone number"
            placeholder="Enter your number"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (phoneError) setPhoneError('');
            }}
            error={phoneError}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          <Button
            title="Create account"
            onPress={handleSignup}
            variant="primary"
            size="large"
            loading={loading}
            style={styles.button}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  loginText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  loginLink: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;

