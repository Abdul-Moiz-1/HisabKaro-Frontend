import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { theme } from '../../constants/theme';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  size?: number;
  imageUri?: string;
  style?: object;
}

const AvatarComponent: React.FC<AvatarProps> = ({
  firstName = '',
  lastName = '',
  size = 80,
  imageUri,
  style,
}) => {
  const initials = useMemo(() => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}` || '?';
  }, [firstName, lastName]);

  const backgroundColor = useMemo(() => {
    const name = `${firstName}${lastName}`;
    if (!name) return theme.colors.primary;

    // Generate a consistent color based on the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate a color in the green spectrum (matching theme)
    const hue = Math.abs(hash % 60) + 60; // Green hues (60-120)
    const saturation = 60 + (Math.abs(hash) % 20); // 60-80%
    const lightness = 50 + (Math.abs(hash) % 20); // 50-70%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }, [firstName, lastName]);

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor,
    },
    style,
  ];

  const textStyle = useMemo(() => [
    styles.text,
    {
      fontSize: size * 0.4,
    },
  ], [size]);

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri } as ImageSourcePropType}
        style={containerStyle}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  text: {
    ...theme.typography.h2,
    color: theme.colors.text.inverse,
    fontWeight: 'bold',
  },
});

export const Avatar = memo(AvatarComponent);

