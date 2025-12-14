import React from 'react';
import Svg, { Path, Circle, Rect, Polyline, Line, Polygon } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
  const getIconPath = () => {
    switch (name) {
      case 'search':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
            <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'close-circle':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
            <Line x1="15" y1="9" x2="9" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="9" y1="9" x2="15" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'trending-up':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Polyline points="17 6 23 6 23 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'trending-down':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polyline points="23 18 13.5 8.5 8.5 13.5 1 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Polyline points="17 18 23 18 23 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'arrow-up':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Line x1="12" y1="19" x2="12" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Polyline points="5 12 12 5 19 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'arrow-down':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Polyline points="19 12 12 19 5 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'arrow-forward':
      case 'chevron-forward':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'time-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
            <Polyline points="12 6 12 12 16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'funnel':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'document-text-outline':
      case 'document-text':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="10" y1="9" x2="8" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'document':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'share-social':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" />
            <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" />
            <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" />
            <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth="2" />
            <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color} strokeWidth="2" />
          </Svg>
        );

      case 'print':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polyline points="6 9 6 2 18 2 18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M6 18H4C2.9 18 2 17.1 2 16V11C2 9.9 2.9 9 4 9H20C21.1 9 22 9.9 22 11V16C22 17.1 21.1 18 20 18H18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Rect x="6" y="14" width="12" height="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'create':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M11 4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H18C19.1 22 20 21.1 20 20V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'trash':
      case 'trash-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'checkmark-circle':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
            <Polyline points="9 12 11 14 15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'notifications':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'person':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
          </Svg>
        );

      case 'cart-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="9" cy="21" r="1" stroke={color} strokeWidth="2" />
            <Circle cx="20" cy="21" r="1" stroke={color} strokeWidth="2" />
            <Path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'add-circle-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
            <Line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'remove':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'add':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      // Category icons
      case 'cash-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="18" y1="9" x2="18" y2="9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="6" y1="15" x2="6" y2="15" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          </Svg>
        );

      case 'card-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="1" y="4" width="22" height="16" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="1" y1="10" x2="23" y2="10" stroke={color} strokeWidth="2" />
          </Svg>
        );

      case 'restaurant-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M3 2V12C3 13.66 4.34 15 6 15V22H8V15C9.66 15 11 13.66 11 12V2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="3" y1="7" x2="11" y2="7" stroke={color} strokeWidth="2" />
            <Line x1="18" y1="2" x2="18" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M18 2C15.79 2 14 3.79 14 6V10H18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'home-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'car-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M5 11L7 5H17L19 11M5 11H19M5 11V17H19V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Circle cx="7.5" cy="14.5" r="1.5" fill={color} />
            <Circle cx="16.5" cy="14.5" r="1.5" fill={color} />
            <Line x1="5" y1="17" x2="5" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="19" y1="17" x2="19" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'fitness-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M6.5 6.5L3 10L6.5 13.5M17.5 6.5L21 10L17.5 13.5M6.5 10H17.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="4" y1="20" x2="20" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="8" cy="20" r="1.5" fill={color} />
            <Circle cx="16" cy="20" r="1.5" fill={color} />
          </Svg>
        );

      case 'gift-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="8" width="18" height="4" stroke={color} strokeWidth="2" fill="none" />
            <Rect x="3" y="12" width="18" height="9" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="12" y1="8" x2="12" y2="21" stroke={color} strokeWidth="2" />
            <Path d="M8.5 8C7.5 8 7 7 7 6C7 4.5 8 3 9.5 3C11 3 12 4.5 12 6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
            <Path d="M15.5 8C16.5 8 17 7 17 6C17 4.5 16 3 14.5 3C13 3 12 4.5 12 6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          </Svg>
        );

      case 'cart':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="9" cy="21" r="1" fill={color} />
            <Circle cx="20" cy="21" r="1" fill={color} />
            <Path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'medical-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'school-outline':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M2 17L12 22L22 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M2 12L12 17L22 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );



      case 'backspace':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M9 3H21C21.5304 3 22.0391 3.21071 22.4142 3.58579C22.7893 3.96086 23 4.46957 23 5V19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H9L1 12L9 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="13" y1="9" x2="19" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="19" y1="9" x2="13" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'arrow-down-circle':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
            <Line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Polyline points="15 13 12 16 9 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'basket':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M17 10L12 3L7 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M2 10L4 20H20L22 10H2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Circle cx="12" cy="17" r="1.5" fill={color} />
          </Svg>
        );

      case 'receipt':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M4 2V22L6 20L8 22L10 20L12 22L14 20L16 22L18 20L20 22V2L18 4L16 2L14 4L12 2L10 4L8 2L6 4L4 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="8" y1="8" x2="16" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="8" y1="16" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'swap-horizontal':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polyline points="17 3 21 7 17 11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="3" y1="7" x2="21" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Polyline points="7 21 3 17 7 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="21" y1="17" x2="3" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'cash':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="5" y1="8" x2="5" y2="8.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="19" y1="15.5" x2="19" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case 'ellipsis-horizontal':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="1.5" fill={color} />
            <Circle cx="19" cy="12" r="1.5" fill={color} />
            <Circle cx="5" cy="12" r="1.5" fill={color} />
          </Svg>
        );

      default:
        // Fallback to a default icon (question mark)
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
            <Path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Circle cx="12" cy="17" r="0.5" fill={color} />
          </Svg>
        );
    }
  };

  return <>{getIconPath()}</>;
};

export default Icon;
