import React, { useState, useCallback, memo, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { EyeIcon, EyeSlashIcon, WarningCircleIcon } from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  showPasswordToggle?: boolean;
  disabled?: boolean;
  required?: boolean;
}

const InputComponent: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  showPasswordToggle = false,
  secureTextEntry,
  disabled = false,
  required = false,
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

  const displaySecureTextEntry = showPasswordToggle 
    ? !isPasswordVisible && secureTextEntry 
    : secureTextEntry;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    required: {
      color: theme.colors.error,
      marginLeft: 4,
      fontSize: 14,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: error 
        ? theme.colors.error 
        : isFocused 
          ? theme.colors.primary 
          : theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: disabled 
        ? theme.colors.divider 
        : theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      minHeight: 52,
      ...(isFocused && !error && {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 2,
      }),
    },
    leftIconContainer: {
      marginRight: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
      paddingVertical: theme.spacing.sm,
      fontWeight: '400',
    },
    rightIconContainer: {
      marginLeft: theme.spacing.sm,
      padding: theme.spacing.xs,
    },
    passwordToggle: {
      padding: 8,
      marginLeft: 4,
      marginRight: -4,
    },
    helperContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
      paddingHorizontal: 4,
    },
    errorIcon: {
      marginRight: 4,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      flex: 1,
    },
    hintText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
  }), [theme, isFocused, error, disabled]);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}
      
      <View style={styles.inputWrapper}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[styles.input, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.colors.text.disabled}
          secureTextEntry={displaySecureTextEntry}
          editable={!disabled}
          {...textInputProps}
        />
        
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.passwordToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPasswordVisible ? (
              <EyeIcon size={22} color={theme.colors.text.secondary} weight="regular" />
            ) : (
              <EyeSlashIcon size={22} color={theme.colors.text.secondary} weight="regular" />
            )}
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
      
      {(error || hint) && (
        <View style={styles.helperContainer}>
          {error ? (
            <>
              <WarningCircleIcon 
                size={14} 
                color={theme.colors.error} 
                weight="fill" 
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{error}</Text>
            </>
          ) : (
            <Text style={styles.hintText}>{hint}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export const Input = memo(InputComponent);
