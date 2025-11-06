import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { NavigationProps } from '../../types';
import { ROUTES } from '../../constants/routes';
import { theme } from '../../constants/theme';
import { Container, Button, Logo, Checkbox, Divider, SocialLoginButton } from '../../components/common';
import { Input } from '../../components/forms';
import { isValidEmail } from '../../utils';
import { useAppDispatch } from '../../store/hooks';
import { setUser, setToken, setLoading } from '../../store/slices/userSlice';
import Toast from 'react-native-toast-message';

const LoginScreen: React.FC<NavigationProps<'Login'>> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;

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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  // const handleLogin = async () => {
  //   Keyboard.dismiss();

  //   if (!validateForm()) {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Validation Error',
  //       text2: 'Please check your input fields',
  //     });
  //     return;
  //   }

  //   setLoading(true);
  //   dispatch(setLoading(true));

  //   try {
  //     // TODO: Replace with actual API call
  //     await new Promise((resolve) => setTimeout(resolve, 1500));

  //     // Mock successful login
  //     const mockUser = {
  //       id: '1',
  //       email: email,
  //       name: email.split('@')[0],
  //     };
  //     const mockToken = 'mock_jwt_token_12345';

  //     dispatch(setUser(mockUser));
  //     dispatch(setToken(mockToken));

  //     Toast.show({
  //       type: 'success',
  //       text1: 'Welcome back!',
  //       text2: 'Login successful',
  //     });

  //     // Navigate to home after a short delay
  //     setTimeout(() => {
  //       navigation.replace(ROUTES.HOME);
  //     }, 500);
  //   } catch (error: any) {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Login Failed',
  //       text2: error?.message || 'Please check your credentials and try again',
  //     });
  //   } finally {
  //     setLoading(false);
  //     dispatch(setLoading(false));
  //   }
  // };

// ------------------------------------------------- TEMPORARY LOGIN FUNCTION JUST TO NAVIGATE TO HOME SCREEN---------------------------------------------
  const handleLogin = async () => {
  Keyboard.dismiss();

  // Basic front-end validation
  if (!email.trim() || !password.trim()) {
    Toast.show({
      type: 'error',
      text1: 'Missing Fields',
      text2: 'Please enter both email and password',
    });
    return;
  }

  // ✅ Hardcoded mock credentials
  const MOCK_EMAIL = 'test@example.com';
  const MOCK_PASSWORD = '123456';

  setLoading(true);

  // Simulate a short API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
    const mockUser = {
      id: '1',
      email: MOCK_EMAIL,
      name: 'Test User',
    };
    const mockToken = 'mock_jwt_token_12345';

    dispatch(setUser(mockUser));
    dispatch(setToken(mockToken));

    Toast.show({
      type: 'success',
      text1: 'Login Successful',
      text2: 'Welcome back, Test User!',
    });

    // ✅ Navigate to Home screen
    navigation.replace(ROUTES.HOME);
  } else {
    Toast.show({
      type: 'error',
      text1: 'Login Failed',
      text2: 'Invalid email or password',
    });
  }

  setLoading(false);
};


  const handleSocialLogin = (provider: 'facebook' | 'google' | 'linkedin') => {
    Toast.show({
      type: 'info',
      text1: 'Social Login',
      text2: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon`,
    });
  };

  const navigateToSignup = () => {
    navigation.navigate(ROUTES.SIGNUP);
  };

  return (
    <Container scrollable safeArea style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size="large" />
        </View>

        <Text style={styles.welcomeText}>Welcome back!</Text>

        <View style={styles.form}>
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
            autoComplete="password"
          />

          <View style={styles.optionsRow}>
            <Checkbox checked={rememberMe} onPress={() => setRememberMe(!rememberMe)} label="Remember Me" />
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign in"
            onPress={handleLogin}
            variant="primary"
            size="large"
            loading={loading}
            style={styles.button}
          />

          <Divider text="or continue with" />

          <View style={styles.socialContainer}>
            <SocialLoginButton provider="facebook" onPress={() => handleSocialLogin('facebook')} />
            <SocialLoginButton provider="google" onPress={() => handleSocialLogin('google')} />
            <SocialLoginButton provider="linkedin" onPress={() => handleSocialLogin('linkedin')} />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>or </Text>
            <TouchableOpacity onPress={navigateToSignup}>
              <Text style={styles.signupLink}>Create account</Text>
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
  welcomeText: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  form: {
    width: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  forgotPassword: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  button: {
    marginBottom: theme.spacing.lg,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  signupText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  signupLink: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
