import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Microphone,
  Lightning,
  ShieldCheck,
  ArrowRight,
} from 'phosphor-react-native';
import { NavigationProps } from '../../types';
import { ROUTES } from '../../constants/routes';
import { useTheme } from '../../store/hooks';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<NavigationProps<'Splash'>> = ({ navigation }) => {
  const theme = useTheme();
  const [language, setLanguage] = useState<'ENG' | 'UR'>('ENG');

  const handleStartFree = () => {
    navigation.replace(ROUTES.SIGNUP);
  };

  const handleLogin = () => {
    navigation.replace(ROUTES.LOGIN);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        gradient: {
          flex: 1,
          paddingTop: 60,
        },
        languageToggle: {
          alignSelf: 'flex-end',
          marginRight: theme.spacing.lg,
          flexDirection: 'row',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: theme.borderRadius.full,
          padding: 4,
        },
        languageButton: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.borderRadius.full,
        },
        languageButtonActive: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        languageText: {
          fontSize: 14,
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.7)',
        },
        languageTextActive: {
          color: '#00897B',
        },
        imageContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.xl,
        },
        placeholderImage: {
          width: width * 0.75,
          height: width * 0.75,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: theme.borderRadius.xl,
          alignItems: 'center',
          justifyContent: 'center',
        },
        chartIcon: {
          width: 120,
          height: 120,
          opacity: 0.6,
        },
        bottomSection: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          paddingTop: theme.spacing.xl,
          paddingBottom: 40,
          paddingHorizontal: theme.spacing.lg,
        },
        titleContainer: {
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        mainTitle: {
          fontSize: 32,
          fontWeight: 'bold',
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeight: 40,
        },
        subtitle: {
          fontSize: 16,
          color: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          marginTop: theme.spacing.sm,
        },
        descriptionText: {
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
          marginTop: theme.spacing.xs,
        },
        featuresRow: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginVertical: theme.spacing.xl,
        },
        featureItem: {
          alignItems: 'center',
          width: 80,
        },
        featureIconContainer: {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        },
        featureText: {
          fontSize: 12,
          color: '#FFFFFF',
          textAlign: 'center',
          fontWeight: '500',
        },
        featureSubtext: {
          fontSize: 11,
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
        },
        startButton: {
          backgroundColor: '#FFFFFF',
          borderRadius: theme.borderRadius.full,
          paddingVertical: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.md,
        },
        startButtonText: {
          fontSize: 18,
          fontWeight: '600',
          color: '#00897B',
          marginRight: theme.spacing.sm,
        },
        loginRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        loginText: {
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.7)',
        },
        loginLink: {
          fontSize: 14,
          fontWeight: '600',
          color: '#FFFFFF',
          marginLeft: 4,
        },
      }),
    [theme]
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00897B', '#00A86B', '#008B72']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        {/* Language Toggle */}
        <View style={styles.languageToggle}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'ENG' && styles.languageButtonActive,
            ]}
            onPress={() => setLanguage('ENG')}
          >
            <Text
              style={[
                styles.languageText,
                language === 'ENG' && styles.languageTextActive,
              ]}
            >
              ENG
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'UR' && styles.languageButtonActive,
            ]}
            onPress={() => setLanguage('UR')}
          >
            <Text
              style={[
                styles.languageText,
                language === 'UR' && styles.languageTextActive,
              ]}
            >
              UR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image/Illustration Placeholder */}
        <View style={styles.imageContainer}>
          <View style={styles.placeholderImage}>
            {/* This would be replaced with an actual illustration */}
            <Lightning size={80} color="rgba(255,255,255,0.5)" weight="fill" />
          </View>
        </View>

        {/* Bottom Content Section */}
        <View style={styles.bottomSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>
              Manage Your{'\n'}Business{'\n'}with AI
            </Text>
            <Text style={styles.subtitle}>
              Apna Karobar AI ke saath chalayein.
            </Text>
            <Text style={styles.descriptionText}>
              Zero friction finance for growing businesses.
            </Text>
          </View>

          {/* Feature Icons */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Microphone size={26} color="#FFFFFF" weight="fill" />
              </View>
              <Text style={styles.featureText}>Talk to</Text>
              <Text style={styles.featureSubtext}>Track</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Lightning size={26} color="#FFFFFF" weight="fill" />
              </View>
              <Text style={styles.featureText}>Instant</Text>
              <Text style={styles.featureSubtext}>Reports</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <ShieldCheck size={26} color="#FFFFFF" weight="fill" />
              </View>
              <Text style={styles.featureText}>Secure</Text>
              <Text style={styles.featureSubtext}>& Safe</Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartFree}
            activeOpacity={0.9}
          >
            <Text style={styles.startButtonText}>Start Free</Text>
            <ArrowRight size={20} color="#00897B" weight="bold" />
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default SplashScreen;
