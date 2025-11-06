import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface AILogoProps {
  size?: 'small' | 'medium' | 'large';
}

export const AILogo: React.FC<AILogoProps> = ({ size = 'medium' }) => {
  const logoSize = {
    small: 40,
    medium: 80,
    large: 120,
  }[size];

  const strokeWidth = {
    small: 2,
    medium: 3,
    large: 4,
  }[size];

  return (
    <View style={[styles.container, { width: logoSize, height: logoSize }]}>
      {/* Outer ring */}
      <View 
        style={[
          styles.ring,
          {
            width: logoSize,
            height: logoSize,
            borderRadius: logoSize / 2,
            borderWidth: strokeWidth,
          }
        ]} 
      />
      
      {/* Inner interlocked design */}
      <View style={styles.innerDesign}>
        {/* Create interlocked circular pattern */}
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.innerRing,
              {
                width: logoSize * 0.3,
                height: logoSize * 0.3,
                borderRadius: (logoSize * 0.3) / 2,
                borderWidth: strokeWidth * 0.8,
                transform: [
                  { rotate: `${index * 60}deg` },
                  { translateX: logoSize * 0.15 },
                ],
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    borderColor: theme.colors.primary,
    position: 'absolute',
  },
  innerDesign: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    borderColor: theme.colors.primary,
    position: 'absolute',
    opacity: 0.7,
  },
});
