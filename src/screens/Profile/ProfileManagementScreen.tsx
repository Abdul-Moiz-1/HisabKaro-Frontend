import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Formik } from 'formik';
import { z } from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NavigationProps } from '../../types';
import { ROUTES } from '../../constants/routes';
import { theme } from '../../constants/theme';
import { Container, Button, Avatar, HeaderNavigation } from '../../components/common';
import { Input } from '../../components/forms';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateProfile } from '../../store/slices/userSlice';
import Toast from 'react-native-toast-message';

// Zod validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  birthday: z.string().min(1, 'Birthday is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\+?[0-9]+$/, 'Invalid phone number'),
  password: z.string().optional().refine(
    (val) => !val || val.length === 0 || val.length >= 6,
    { message: 'Password must be at least 6 characters if provided' }
  ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileManagementScreen: React.FC<NavigationProps<'Profile'>> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  // Dummy data for now - later will come from Redux
  const dummyUser = {
    firstName: 'Farida',
    lastName: 'Orujova',
    birthday: '1999-05-23',
    email: 'f.orujova@gmail.com',
    phone: '+994550000000',
    password: '',
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialValues: ProfileFormValues = {
    firstName: user?.firstName || dummyUser.firstName,
    lastName: user?.lastName || dummyUser.lastName,
    birthday: user?.birthday || dummyUser.birthday,
    email: user?.email || dummyUser.email,
    phone: user?.phone || dummyUser.phone,
    password: '',
  };

  const validateForm = (values: ProfileFormValues): Partial<Record<keyof ProfileFormValues, string>> => {
    try {
      profileSchema.parse(values);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof ProfileFormValues, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof ProfileFormValues] = err.message;
          }
        });
        return errors;
      }
      return {};
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    return new Date(dateString);
  };

  const handleSave = async (values: ProfileFormValues) => {
    setLoading(true);
    try {
      // Validate form
      const errors = validateForm(values);
      if (Object.keys(errors).length > 0) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please check your input fields',
        });
        setLoading(false);
        return;
      }

      // Update Redux store
      dispatch(updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        birthday: values.birthday,
        email: values.email,
        phone: values.phone,
      }));

      // TODO: Make API call to update profile
      // If password is provided, update it separately
      if (values.password && values.password.trim().length > 0) {
        // TODO: Call API to update password
        console.log('Password update would be handled here');
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
      });

      // Optionally navigate back
      // navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error?.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Toast.show({
              type: 'info',
              text1: 'Account Deletion',
              text2: 'Account deletion feature will be implemented soon',
            });
          },
        },
      ]
    );
  };

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      <HeaderNavigation
        title="Profile"
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Formik
          initialValues={initialValues}
          validate={validateForm}
          onSubmit={handleSave}
          enableReinitialize
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <View style={styles.content}>
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                <Avatar
                  firstName={values.firstName}
                  lastName={values.lastName}
                  size={100}
                />
                <TouchableOpacity style={styles.editPhotoButton}>
                  <Text style={styles.editPhotoText}>Edit Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={styles.form}>
                <Input
                  label="Full name*"
                  value={`${values.firstName} ${values.lastName}`}
                  editable={false}
                  style={styles.readOnlyInput}
                />

                <View style={styles.nameRow}>
                  <View style={styles.nameField}>
                    <Input
                      label="First name*"
                      placeholder="Enter first name"
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      error={touched.firstName && errors.firstName ? errors.firstName : undefined}
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.nameField}>
                    <Input
                      label="Last name*"
                      placeholder="Enter last name"
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      error={touched.lastName && errors.lastName ? errors.lastName : undefined}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Input
                    label="Birthday"
                    value={formatDate(values.birthday)}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={parseDate(values.birthday)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }
                      if (selectedDate && event.type !== 'dismissed') {
                        const formattedDate = selectedDate.toISOString().split('T')[0];
                        setFieldValue('birthday', formattedDate);
                        if (Platform.OS === 'ios') {
                          setShowDatePicker(false);
                        }
                      } else if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}

                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email ? errors.email : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                <Input
                  label="Phone number"
                  placeholder="Enter phone number"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  error={touched.phone && errors.phone ? errors.phone : undefined}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />

                <Input
                  label="Password"
                  placeholder="Enter new password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password && errors.password ? errors.password : undefined}
                  secureTextEntry
                  showPasswordToggle
                  autoCapitalize="none"
                />

                {/* Save Button */}
                <Button
                  title="Save changes"
                  onPress={() => handleSubmit()}
                  variant="primary"
                  size="large"
                  loading={loading}
                  style={styles.saveButton}
                />

                {/* Delete Account */}
                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete account</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  editPhotoButton: {
    marginTop: theme.spacing.md,
  },
  editPhotoText: {
    ...theme.typography.body,
    color: theme.colors.success,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  nameField: {
    flex: 1,
  },
  dateInputContainer: {
    marginBottom: theme.spacing.md,
  },
  readOnlyInput: {
    opacity: 0.7,
  },
  saveButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  deleteButtonText: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontWeight: '500',
  },
});

export default ProfileManagementScreen;

