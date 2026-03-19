import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../store/hooks';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  safeArea?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const Container: React.FC<ContainerProps> = ({
  children,
  style,
  scrollable = false,
  safeArea = true,
  edges = ['top', 'bottom'],
}) => {
  const theme = useTheme();
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  const content = (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, style]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          overScrollMode="always"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, style]}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );

  if (safeArea) {
    return <SafeAreaView style={dynamicStyles.container} edges={edges}>{content}</SafeAreaView>;
  }

  return <View style={dynamicStyles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});


