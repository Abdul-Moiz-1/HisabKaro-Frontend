// screens/AddCustomerScreen.tsx
import React from 'react';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Theme, useThemedStyles } from '../../theme';
import DynamicForm from '../../components/DynamicForm/DynamicForm';
import { addCustomerFormConfig } from '../../config/forms/addCustomer';

const AddCustomerScreen: React.FC = () => {
  const navigation = useNavigation();
  const styles = useThemedStyles(createStyles);

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Replace with actual API call
      console.log('Customer data:', data);

      // Simulate API call
      //   await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate back with the new customer
      // @ts-ignore
      navigation.navigate('CustomerSelection', {
        newCustomer: {
          id: Date.now().toString(),
          ...data,
        },
      });
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Customer</Text>
        <View style={styles.headerSpacer} />
      </View>

      <DynamicForm
        config={addCustomerFormConfig}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
});

export default AddCustomerScreen;
