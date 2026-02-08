import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MicrophoneIcon, SparkleIcon } from 'phosphor-react-native';
import { useTheme } from '../../../../../store/hooks';

interface VoiceEntryBannerProps {
  onPress: () => void;
}

const VoiceEntryBanner: React.FC<VoiceEntryBannerProps> = ({ onPress }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <SparkleIcon size={20} color={theme.colors.primary} weight="fill" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Try Voice Entry / Bol kar likhein</Text>
        <Text style={styles.subtitle}>
          "Paid 500 for office rent" ya "Bijli ka bill bhara 2000"
        </Text>
      </View>
      <View style={styles.micButton}>
        <MicrophoneIcon size={24} color={theme.colors.primary} weight="fill" />
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.primary}10`,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}20`,
    },
    iconContainer: {
      marginRight: theme.spacing.sm,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    subtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    micButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: theme.spacing.sm,
      ...theme.shadows.sm,
    },
  });

export default VoiceEntryBanner;
