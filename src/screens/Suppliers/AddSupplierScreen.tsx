import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {
  CaretLeftIcon,
  MicrophoneIcon,
  TruckIcon,
  UserPlusIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { Container } from '../../components/common';
import { useTheme } from '../../store/hooks';
import { suppliersApi, CreateSupplierPayload } from '../../services/api';

const AddSupplierScreen: React.FC<NavigationProps<'AddSupplier'>> = ({ navigation }) => {
  const theme = useTheme();
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [setCreditLimit, setSetCreditLimit] = useState(false);
  const [creditLimit, setCreditLimitInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [saving, setSaving] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    if (phone && !/^(03\d{9}|\+92\s?\d{10})$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Pakistani phone number';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (openingBalance && isNaN(parseFloat(openingBalance))) {
      newErrors.openingBalance = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle voice input
  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      Toast.show({
        type: 'info',
        text1: 'Voice Input',
        text2: 'Speak now... (Voice feature coming soon)',
      });
      // TODO: Implement voice recognition
      setTimeout(() => setIsListening(false), 3000);
    }
  };

  // Handle save supplier
  const handleSaveSupplier = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the errors in the form',
      });
      return;
    }

    try {
      setSaving(true);

      const payload: CreateSupplierPayload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        opening_balance: parseFloat(openingBalance) || 0,
      };

      const newSupplier = await suppliersApi.create(payload);

      Toast.show({
        type: 'success',
        text1: 'Supplier Added',
        text2: `${newSupplier.name} has been added successfully`,
      });

      // Navigate to supplier detail or go back
      navigation.replace('SupplierDetail', { supplierId: newSupplier.id });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create supplier',
      });
    } finally {
      setSaving(false);
    }
  };

  // Format phone number as user types
  const handlePhoneChange = (text: string) => {
    // Remove non-numeric characters except +
    let cleaned = text.replace(/[^\d+]/g, '');
    
    // Format for display
    if (cleaned.startsWith('03') && cleaned.length > 4) {
      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 11);
    } else if (cleaned.startsWith('+92') && cleaned.length > 5) {
      cleaned = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6, 13);
    }
    
    setPhone(cleaned);
  };

  return (
    <Container safeArea edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <CaretLeftIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Add New Supplier</Text>
        
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Supplier Details</Text>
            <Text style={styles.sectionSubtitle}>
              Naye supplier ki maloomat darj karein.
            </Text>
          </View>

          {/* Voice Input Card */}
          <TouchableOpacity 
            style={[styles.voiceCard, isListening && styles.voiceCardActive]}
            onPress={handleVoiceInput}
            activeOpacity={0.8}
          >
            <View style={[
              styles.voiceIconContainer,
              isListening && styles.voiceIconContainerActive
            ]}>
              <MicrophoneIcon 
                size={24} 
                color={isListening ? '#fff' : theme.colors.warning} 
                weight={isListening ? 'fill' : 'regular'}
              />
            </View>
            <View style={styles.voiceTextContainer}>
              <Text style={[styles.voiceTitle, isListening && styles.voiceTitleActive]}>
                Voice-Assisted Entry
              </Text>
              <Text style={[styles.voiceSubtitle, isListening && styles.voiceSubtitleActive]}>
                {isListening 
                  ? 'Listening... Speak now' 
                  : 'Tap microphone to speak details in Urdu or English'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Supplier Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Supplier Name <Text style={styles.urduHint}>(Company/Person)</Text>
              </Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Al-Rehman Traders"
                  placeholderTextColor={theme.colors.text.disabled}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
                <TruckIcon size={20} color={theme.colors.text.disabled} />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Phone Number <Text style={styles.urduHint}>(0300-1234567)</Text>
              </Text>
              <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="03xx xxxxxxx"
                  placeholderTextColor={theme.colors.text.disabled}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Business Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Business Category <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Electronics, General Store"
                  placeholderTextColor={theme.colors.text.disabled}
                  value={businessName}
                  onChangeText={setBusinessName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Opening Balance */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Opening Balance <Text style={styles.urduHint}>(Payable Rs.)</Text>
              </Text>
              <View style={[styles.inputContainer, styles.balanceInput, errors.openingBalance && styles.inputError]}>
                <View style={styles.currencyPrefix}>
                  <Text style={styles.currencyText}>Rs.</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.balanceInputField]}
                  placeholder="0"
                  placeholderTextColor={theme.colors.text.disabled}
                  value={openingBalance}
                  onChangeText={setOpeningBalance}
                  keyboardType="numeric"
                />
              </View>
              {errors.openingBalance && <Text style={styles.errorText}>{errors.openingBalance}</Text>}
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Address <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Shop #12, Market Area"
                  placeholderTextColor={theme.colors.text.disabled}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                City <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Karachi"
                  placeholderTextColor={theme.colors.text.disabled}
                  value={city}
                  onChangeText={setCity}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. supplier@example.com"
                  placeholderTextColor={theme.colors.text.disabled}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Credit Limit Toggle */}
            <View style={styles.toggleContainer}>
              <View style={styles.toggleIconContainer}>
                <View style={[styles.toggleIcon, { backgroundColor: `${theme.colors.warning}15` }]}>
                  <Text style={styles.toggleIconText}>💳</Text>
                </View>
              </View>
              <View style={styles.toggleContent}>
                <Text style={styles.toggleTitle}>Set Credit Limit?</Text>
                <Text style={styles.toggleSubtitle}>Maximum credit from this supplier</Text>
              </View>
              <Switch
                value={setCreditLimit}
                onValueChange={setSetCreditLimit}
                trackColor={{ 
                  false: theme.colors.border, 
                  true: `${theme.colors.warning}60` 
                }}
                thumbColor={setCreditLimit ? theme.colors.warning : '#f4f3f4'}
              />
            </View>

            {/* Credit Limit Input (conditional) */}
            {setCreditLimit && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Credit Limit (Rs.)</Text>
                <View style={[styles.inputContainer, styles.balanceInput]}>
                  <View style={styles.currencyPrefix}>
                    <Text style={styles.currencyText}>Rs.</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.balanceInputField]}
                    placeholder="100,000"
                    placeholderTextColor={theme.colors.text.disabled}
                    value={creditLimit}
                    onChangeText={setCreditLimitInput}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveSupplier}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <UserPlusIcon size={20} color="#fff" weight="bold" />
                <Text style={styles.saveButtonText}>Save Supplier</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.bottomHint}>
            Supplier save karein aur purchases record karein
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    helpButton: {
      paddingHorizontal: theme.spacing.sm,
    },
    helpText: {
      fontSize: 14,
      color: theme.colors.warning,
      fontWeight: '500',
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },
    sectionHeader: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    voiceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.md,
      backgroundColor: `${theme.colors.warning}10`,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: `${theme.colors.warning}30`,
    },
    voiceCardActive: {
      backgroundColor: theme.colors.warning,
      borderColor: theme.colors.warning,
    },
    voiceIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${theme.colors.warning}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    voiceIconContainerActive: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    voiceTextContainer: {
      flex: 1,
    },
    voiceTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.warning,
      marginBottom: 2,
    },
    voiceTitleActive: {
      color: '#fff',
    },
    voiceSubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    voiceSubtitleActive: {
      color: 'rgba(255,255,255,0.8)',
    },
    formContainer: {
      paddingHorizontal: theme.spacing.lg,
    },
    inputGroup: {
      marginBottom: theme.spacing.md,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    urduHint: {
      fontWeight: 'normal',
      color: theme.colors.text.secondary,
    },
    optionalText: {
      fontWeight: 'normal',
      color: theme.colors.text.disabled,
      fontSize: 12,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 52,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text.primary,
      paddingVertical: theme.spacing.sm,
    },
    balanceInput: {
      paddingLeft: 0,
    },
    currencyPrefix: {
      backgroundColor: `${theme.colors.text.disabled}20`,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderTopLeftRadius: theme.borderRadius.lg - 1,
      borderBottomLeftRadius: theme.borderRadius.lg - 1,
      marginLeft: -1,
      marginRight: theme.spacing.sm,
      height: '100%',
      justifyContent: 'center',
    },
    currencyText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
    balanceInputField: {
      paddingLeft: 0,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 4,
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    toggleIconContainer: {
      marginRight: theme.spacing.md,
    },
    toggleIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleIconText: {
      fontSize: 20,
    },
    toggleContent: {
      flex: 1,
    },
    toggleTitle: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    toggleSubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    bottomContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.warning,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.sm,
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    bottomHint: {
      textAlign: 'center',
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
    },
  });

export default AddSupplierScreen;
