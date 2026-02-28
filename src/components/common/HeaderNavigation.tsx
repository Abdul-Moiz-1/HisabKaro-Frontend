import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CaretLeftIcon, DotsThreeVerticalIcon } from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';

interface HeaderNavigationProps {
  title: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  showBackButton?: boolean;
  onMorePress?: () => void;
  showMoreButton?: boolean;
  centerTitle?: boolean;
}

const HeaderNavigationComponent: React.FC<HeaderNavigationProps> = ({
  title,
  onBackPress,
  rightComponent,
  showBackButton = true,
  onMorePress,
  showMoreButton = false,
  centerTitle = false,
}) => {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.background,
          minHeight: 56,
        },
        leftContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: centerTitle ? 0 : 1,
        },
        backButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: theme.spacing.sm,
        },
        title: {
          ...theme.typography.h3,
          color: theme.colors.text.primary,
          flex: centerTitle ? 0 : 1,
        },
        titleCenter: {
          flex: 1,
          textAlign: 'center',
        },
        rightContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        moreButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
        },
        placeholder: {
          width: 40,
        },
      }),
    [theme, centerTitle]
  );

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <CaretLeftIcon size={24} color={theme.colors.text.primary} weight="regular" />
          </TouchableOpacity>
        ) : centerTitle ? (
          <View style={styles.placeholder} />
        ) : null}
        {!centerTitle && <Text style={styles.title}>{title}</Text>}
      </View>

      {centerTitle && (
        <Text style={[styles.title, styles.titleCenter]}>{title}</Text>
      )}

      <View style={styles.rightContainer}>
        {rightComponent}
        {showMoreButton && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={onMorePress}
            activeOpacity={0.7}
          >
            <DotsThreeVerticalIcon size={24} color={theme.colors.text.primary} weight="bold" />
          </TouchableOpacity>
        )}
        {!rightComponent && !showMoreButton && centerTitle && (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

export const HeaderNavigation = memo(HeaderNavigationComponent);
