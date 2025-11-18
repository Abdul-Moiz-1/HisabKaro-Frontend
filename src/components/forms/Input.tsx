import React, { useState, useCallback, memo, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../store/hooks';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  showPasswordToggle?: boolean;
}

const InputComponent: React.FC<InputProps> = ({
  label,
  error,
  rightIcon,
  onRightIconPress,
  showPasswordToggle = false,
  secureTextEntry,
  style,
  ...textInputProps
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const displaySecureTextEntry = showPasswordToggle ? !isPasswordVisible && secureTextEntry : secureTextEntry;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      fontWeight: '500',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      minHeight: 48,
    },
    inputContainerFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    inputContainerError: {
      borderColor: theme.colors.error,
    },
    input: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.text.primary,
      paddingVertical: theme.spacing.sm,
    },
    rightIconContainer: {
      marginLeft: theme.spacing.sm,
      padding: theme.spacing.xs,
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    eyeIcon: {
      fontSize: 20,
    },
  }), [theme]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.colors.text.disabled}
          secureTextEntry={displaySecureTextEntry}
          {...textInputProps}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIconContainer}
          >
            <Text style={styles.eyeIcon}>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && !showPasswordToggle && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export const Input = memo(InputComponent);


