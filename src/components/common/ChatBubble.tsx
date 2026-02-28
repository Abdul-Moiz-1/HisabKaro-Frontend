import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { useTheme } from '../../store/hooks';

interface ChatBubbleProps {
  message: string;
  secondaryMessage?: string;
  isBot?: boolean;
  timestamp?: string;
  botName?: string;
  botAvatar?: string;
  style?: ViewStyle;
}

const ChatBubbleComponent: React.FC<ChatBubbleProps> = ({
  message,
  secondaryMessage,
  isBot = false,
  timestamp,
  botName = 'FinBot Assistant',
  botAvatar,
  style,
}) => {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          marginBottom: theme.spacing.md,
          alignItems: 'flex-end',
        },
        containerBot: {
          justifyContent: 'flex-start',
        },
        containerUser: {
          justifyContent: 'flex-end',
        },
        avatarContainer: {
          marginRight: theme.spacing.sm,
        },
        avatar: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: theme.colors.primary,
        },
        avatarImage: {
          width: 36,
          height: 36,
          borderRadius: 18,
        },
        onlineIndicator: {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.colors.success,
          position: 'absolute',
          bottom: 0,
          right: 0,
          borderWidth: 2,
          borderColor: theme.colors.background,
        },
        bubbleWrapper: {
          maxWidth: '80%',
        },
        botName: {
          ...theme.typography.caption,
          color: theme.colors.primary,
          fontWeight: '600',
          marginBottom: theme.spacing.xs,
        },
        bubble: {
          borderRadius: theme.borderRadius.xl,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
        },
        bubbleBot: {
          backgroundColor: theme.colors.palette?.green50 || '#E8F5E9',
          borderBottomLeftRadius: theme.borderRadius.xs,
        },
        bubbleUser: {
          backgroundColor: theme.colors.primary,
          borderBottomRightRadius: theme.borderRadius.xs,
        },
        message: {
          ...theme.typography.body,
          lineHeight: 22,
        },
        messageBot: {
          color: theme.colors.text.primary,
        },
        messageUser: {
          color: theme.colors.text.inverse,
        },
        secondaryMessage: {
          ...theme.typography.bodySmall,
          marginTop: theme.spacing.xs,
          fontStyle: 'italic',
        },
        secondaryMessageBot: {
          color: theme.colors.primary,
        },
        secondaryMessageUser: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
        timestamp: {
          ...theme.typography.caption,
          color: theme.colors.text.tertiary,
          marginTop: theme.spacing.xs,
          fontSize: 10,
        },
        timestampBot: {
          textAlign: 'left',
        },
        timestampUser: {
          textAlign: 'right',
        },
      }),
    [theme]
  );

  return (
    <View style={[styles.container, isBot ? styles.containerBot : styles.containerUser, style]}>
      {isBot && (
        <View style={styles.avatarContainer}>
          {botAvatar ? (
            <Image source={{ uri: botAvatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar} />
          )}
          <View style={styles.onlineIndicator} />
        </View>
      )}
      <View style={styles.bubbleWrapper}>
        {isBot && <Text style={styles.botName}>{botName}</Text>}
        <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
          <Text style={[styles.message, isBot ? styles.messageBot : styles.messageUser]}>
            {message}
          </Text>
          {secondaryMessage && (
            <Text
              style={[
                styles.secondaryMessage,
                isBot ? styles.secondaryMessageBot : styles.secondaryMessageUser,
              ]}
            >
              {secondaryMessage}
            </Text>
          )}
        </View>
        {timestamp && (
          <Text style={[styles.timestamp, isBot ? styles.timestampBot : styles.timestampUser]}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
};

export const ChatBubble = memo(ChatBubbleComponent);
