import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Defs, ClipPath, Rect, G } from 'react-native-svg';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', style }) => {
  const sizeStyles = {
    small: { iconSize: 20, fontSize: 14, gap: 6 },
    medium: { iconSize: 30, fontSize: 18, gap: 8 },
    large: { iconSize: 40, fontSize: 24, gap: 10 },
  };

  const { iconSize, fontSize, gap } = sizeStyles[size];

  return (
    <View style={[styles.container, { gap }, style]}>
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 26 30"
        fill="none"
      >
        <G clipPath="url(#clip0_583_14160)">
          <G clipPath="url(#clip1_583_14160)">
            <Path
              d="M13 0L0 7.5V22.5L13 30L26 22.5V7.5L13 0ZM5.88379 10L13 1.50794L19.7584 10H5.88379ZM19.8777 10.7937L13 23.0952L5.76453 10.7937H19.8777ZM12.2446 23.3333L1.23242 21.5476L5.12844 11.2698L12.2446 23.3333ZM20.5138 11.3095L24.7676 21.5873L13.7554 23.373L20.5138 11.3095ZM20.633 9.88095L14.0336 1.50794L24.7676 7.69841L20.633 9.88095ZM4.96942 9.88095L1.23242 7.69841L11.8868 1.54762L4.96942 9.88095ZM4.57187 10.5556L0.795107 20.4762V8.37302L4.57187 10.5556ZM12.6024 24.2064V28.8492L1.43119 22.4206L12.6024 24.2064ZM13.3976 24.2064L24.5688 22.4206L13.3976 28.8492V24.2064ZM21.0703 10.5556L25.2446 8.33333V20.5952L21.0703 10.5556Z"
              fill="#B4F077"
            />
          </G>
        </G>
        <Defs>
          <ClipPath id="clip0_583_14160">
            <Rect width="26" height="30" fill="white" />
          </ClipPath>
          <ClipPath id="clip1_583_14160">
            <Rect width="26" height="30" fill="white" />
          </ClipPath>
        </Defs>
      </Svg>
      <Text style={[styles.text, { fontSize }]}>HisabKaro</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#B4F077',
    fontWeight: '600',
  },
});
