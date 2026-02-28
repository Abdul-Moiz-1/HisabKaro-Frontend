import React, { useRef, useEffect, useMemo, memo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Text,
} from 'react-native';
import {
  HouseIcon,
  ChartBarIcon,
  PlusIcon,
  FolderIcon,
  GearIcon,
} from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';
import {
  NavigationHelpers,
  NavigationState,
  ParamListBase,
} from '@react-navigation/native';
import {
  BottomTabNavigationEventMap,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/MainTabNavigator';
import { ROUTES } from '../../constants/routes';

interface TabItem {
  id: string;
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  state: NavigationState;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}

interface AnimatedTabIconProps {
  tab: TabItem;
  children: React.ReactNode;
}

const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({ tab, children }) => {
  const scaleAnim = useRef(new Animated.Value(tab.isActive ? 1.1 : 1)).current;
  const opacityAnim = useRef(
    new Animated.Value(tab.isActive ? 1 : 0.7),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: tab.isActive ? 1.1 : 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: tab.isActive ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [tab.isActive, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      {children}
    </Animated.View>
  );
};

const BottomTabBarComponent: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabPress,
  navigation,
  state,
}) => {
  const theme = useTheme();
  const currentRoute = state?.routes[state.index].name;

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: 'home',
        label: 'Home',
        isActive: activeTab === 'home',
        onPress: () => navigation.navigate('HomeTab'),
      },
      {
        id: 'reports',
        label: 'Reports',
        isActive: activeTab === 'reports',
        // onPress: () => onTabPress('reports'),
        onPress: () => navigation.navigate('Reports'),
      },
      {
        id: 'add',
        label: 'AI Assistant',
        isActive: activeTab === 'add',
        onPress: () => navigation.navigate(ROUTES.AI_ASSISTANT),
      },
      {
        id: 'directory',
        label: 'Directory',
        isActive: activeTab === 'directory',
        onPress: () => navigation.navigate('DirectoryTab'),
      },
      {
        id: 'settings',
        label: 'Settings',
        isActive: activeTab === 'settings',
        onPress: () => navigation.navigate('Menu'),
      },
    ],
    [activeTab, onTabPress],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.background,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        },
        tabBar: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: theme.colors.surface,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          borderTopLeftRadius: theme.borderRadius.xl,
          borderTopRightRadius: theme.borderRadius.xl,
          ...theme.shadows.lg,
        },
        tab: {
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        },
        addTab: {
          marginTop: -20,
        },
        iconContainer: {
          width: 44,
          height: 44,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        iconContainerActive: {
          backgroundColor: theme.colors.primary,
        },
        iconContainerInactive: {
          backgroundColor: 'transparent',
        },
        addButton: {
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primary,
          ...theme.shadows.lg,
        },
        addButtonLabel: {
          marginTop: 4,
          fontSize: 10,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        addButtonContainer: {
          alignItems: 'center',
        },
      }),
    [theme],
  );

  const renderTabIcon = (tab: TabItem) => {
    const iconSize = 24;
    const activeColor = theme.colors.text.inverse;
    const inactiveColor = theme.colors.text.secondary;

    switch (tab.id) {
      case 'home':
        return (
          <AnimatedTabIcon tab={tab}>
            <View
              style={[
                styles.iconContainer,
                tab.isActive
                  ? styles.iconContainerActive
                  : styles.iconContainerInactive,
              ]}
            >
              {tab.isActive ? (
                <HouseIcon size={iconSize} color={activeColor} weight="fill" />
              ) : (
                <HouseIcon
                  size={iconSize}
                  color={inactiveColor}
                  weight="regular"
                />
              )}
            </View>
          </AnimatedTabIcon>
        );

      case 'reports':
        return (
          <AnimatedTabIcon tab={tab}>
            <View
              style={[
                styles.iconContainer,
                tab.isActive
                  ? styles.iconContainerActive
                  : styles.iconContainerInactive,
              ]}
            >
              {tab.isActive ? (
                <ChartBarIcon
                  size={iconSize}
                  color={activeColor}
                  weight="fill"
                />
              ) : (
                <ChartBarIcon
                  size={iconSize}
                  color={inactiveColor}
                  weight="regular"
                />
              )}
            </View>
          </AnimatedTabIcon>
        );

      case 'add':
        return (
          <AnimatedTabIcon tab={tab}>
            <View style={styles.addButtonContainer}>
              <View style={styles.addButton}>
                <PlusIcon
                  size={28}
                  color={theme.colors.text.inverse}
                  weight="bold"
                />
              </View>
              <Text style={styles.addButtonLabel}>{tab.label}</Text>
            </View>
          </AnimatedTabIcon>
        );

      case 'directory':
        return (
          <AnimatedTabIcon tab={tab}>
            <View
              style={[
                styles.iconContainer,
                tab.isActive
                  ? styles.iconContainerActive
                  : styles.iconContainerInactive,
              ]}
            >
              {tab.isActive ? (
                <FolderIcon size={iconSize} color={activeColor} weight="fill" />
              ) : (
                <FolderIcon
                  size={iconSize}
                  color={inactiveColor}
                  weight="regular"
                />
              )}
            </View>
          </AnimatedTabIcon>
        );

      case 'settings':
        return (
          <AnimatedTabIcon tab={tab}>
            <View
              style={[
                styles.iconContainer,
                tab.isActive
                  ? styles.iconContainerActive
                  : styles.iconContainerInactive,
              ]}
            >
              {tab.isActive ? (
                <GearIcon size={iconSize} color={activeColor} weight="fill" />
              ) : (
                <GearIcon
                  size={iconSize}
                  color={inactiveColor}
                  weight="regular"
                />
              )}
            </View>
          </AnimatedTabIcon>
        );

      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tab: TabItem }> = ({ tab }) => {
    const pressAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(pressAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
      tab.onPress();
    };

    return (
      <Animated.View
        style={[
          styles.tab,
          tab.id === 'add' && styles.addTab,
          { transform: [{ scale: pressAnim }] },
        ]}
      >
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={{ width: '100%', alignItems: 'center' }}
        >
          {renderTabIcon(tab)}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TabButton key={tab.id} tab={tab} />
        ))}
      </View>
    </View>
  );
};

export const BottomTabBar = memo(BottomTabBarComponent);
