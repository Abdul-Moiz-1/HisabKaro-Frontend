// components/DynamicForm/fields/FileUploadField.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { FormField } from '../../../types/forms';

import { Theme } from '../../../theme/types';
import { useThemedStyles } from '../../../theme';

interface FileUploadFieldProps {
  field: FormField;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onBlur: () => void;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
}) => {
  const styles = useThemedStyles(createStyles);
  const [uploading, setUploading] = useState(false);

  const handleUploadPress = () => {
    Alert.alert('Upload Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: handleCamera,
      },
      {
        text: 'Choose from Gallery',
        onPress: handleGallery,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (result.assets && result.assets[0]) {
        onChange({
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          name: result.assets[0].fileName,
        });
        onBlur();
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const handleGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (result.assets && result.assets[0]) {
        onChange({
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          name: result.assets[0].fileName,
        });
        onBlur();
      }
    } catch (error) {
      console.error('Gallery error:', error);
    }
  };

  const handleRemove = () => {
    onChange(null);
    onBlur();
  };

  return (
    <View style={styles.container}>
      {field.label && (
        <Text style={styles.label}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {!value ? (
        <TouchableOpacity
          style={[styles.uploadButton, error && styles.uploadButtonError]}
          onPress={handleUploadPress}
          disabled={uploading}
          activeOpacity={0.7}
        >
          <Text style={styles.uploadIcon}>📸</Text>
          <Text style={styles.uploadText}>
            {field.placeholder || 'Attach photo'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: value.uri }}
            style={styles.preview}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemove}
            activeOpacity={0.7}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {field.hint && !error && <Text style={styles.hint}>{field.hint}</Text>}
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: '500' as const,
  },
  required: {
    color: theme.colors.error,
  },
  uploadButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed' as const,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  uploadButtonError: {
    borderColor: theme.colors.error,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  uploadText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  previewContainer: {
    position: 'relative' as const,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden' as const,
  },
  preview: {
    width: '100%' as const,
    height: 200,
    borderRadius: theme.borderRadius.md,
  },
  removeButton: {
    position: 'absolute' as const,
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.error,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...theme.shadows.md,
  },
  removeButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

export default FileUploadField;
