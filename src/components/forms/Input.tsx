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
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  }, [onBlur]);

  const displaySecureTextEntry = useMemo(() => {
    if (showPasswordToggle) {
      return !isPasswordVisible && secureTextEntry;
    }
    return secureTextEntry;
  }, [showPasswordToggle, isPasswordVisible, secureTextEntry]);

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
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      minHeight: 52,
    },
    leftIconContainer: {
      marginRight: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: 16,
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
  }), [theme]);

  // Dynamic wrapper style (simplified, no elevation/shadow)
  const inputWrapperStyle = {
    borderColor: error 
      ? theme.colors.error 
      : isFocused 
        ? theme.colors.primary 
        : theme.colors.border,
    backgroundColor: disabled 
      ? theme.colors.divider 
      : theme.colors.surface,
  };

  const inputTextStyle = {
    color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}
      
      <View style={[styles.inputWrapper, inputWrapperStyle]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          placeholderTextColor={theme.colors.text.disabled}
          editable={!disabled}
          {...textInputProps}
          secureTextEntry={displaySecureTextEntry}
          style={[styles.input, inputTextStyle, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
