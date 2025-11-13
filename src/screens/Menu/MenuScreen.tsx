import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { NavigationProps } from '../../types';
import { ROUTES } from '../../constants/routes';
import { theme } from '../../constants/theme';
import { Container, Avatar, MenuCard } from '../../components/common';
import { BottomTabBar } from '../../components/navigation/BottomTabBar';
import { useAppSelector } from '../../store/hooks';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route?: keyof typeof ROUTES;
  onPress?: () => void;
}

const MenuScreen: React.FC<NavigationProps<'Menu'>> = ({ navigation }) => {
  const user = useAppSelector((state) => state.user.user);
  const [activeTab, setActiveTab] = useState<string>('menu');

  // Set active tab when component mounts
  useEffect(() => {
    setActiveTab('menu');
  }, []);

  // Create smooth layout animation
  const createLayoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
      },
    });
  };

  const handleTabPress = useCallback((tabId: string) => {
    createLayoutAnimation();
    setActiveTab(tabId);

    switch (tabId) {
      case 'home':
        navigation.navigate(ROUTES.HOME);
        break;
      case 'analytics':
        navigation.navigate(ROUTES.ANALYTICS);
        break;
      case 'add':
        navigation.navigate(ROUTES.ADD_TRANSACTION);
        break;
      case 'ai':
        navigation.navigate(ROUTES.AI_ASSISTANT);
        break;
      case 'menu':
        // Already on menu screen
        break;
      default:
        break;
    }
  }, [navigation]);

  const handleMenuCardPress = useCallback((item: MenuItem) => {
    if (item.route) {
      createLayoutAnimation();
      navigation.navigate(item.route);
    } else if (item.onPress) {
      item.onPress();
    }
  }, [navigation]);

  // Menu items configuration
  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'Login, authenticator',
      icon: (
        <Avatar
          firstName={user?.firstName || 'Farida'}
          lastName={user?.lastName || 'Orujova'}
          size={48}
        />
      ),
      route: ROUTES.PROFILE as keyof typeof ROUTES,
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Widgets, Themes',
      icon: (
        <View style={styles.gridIcon}>
          {Array.from({ length: 16 }).map((_, index) => (
            <View key={index} style={styles.gridDot} />
          ))}
        </View>
      ),
      onPress: () => {
        // TODO: Navigate to Appearance screen
        console.log('Appearance pressed');
      },
    },
    {
      id: 'general',
      title: 'General',
      description: 'Currency, clear data and more',
      icon: (
        <View style={styles.dotsIcon}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      ),
      onPress: () => {
        // TODO: Navigate to General settings screen
        console.log('General pressed');
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Account settings, alerts & notifications',
      icon: (
        <View style={styles.gearIcon}>
          <Text style={styles.gearIconText}>⚙️</Text>
        </View>
      ),
      onPress: () => {
        // TODO: Navigate to Settings screen
        console.log('Settings pressed');
      },
    },
    {
      id: 'data',
      title: 'Data',
      description: 'Data management, export and import features',
      icon: (
        <View style={styles.dataIcon}>
          <Text style={styles.dataIconText}>⇅</Text>
        </View>
      ),
      onPress: () => {
        // TODO: Navigate to Data management screen
        console.log('Data pressed');
      },
    },
    {
      id: 'privacy',
      title: 'Privacy',
      description: 'Password management, privacy preferences',
      icon: (
        <View style={styles.lockIcon}>
          <Text style={styles.lockIconText}>🔒</Text>
        </View>
      ),
      onPress: () => {
        // TODO: Navigate to Privacy screen
        console.log('Privacy pressed');
      },
    },
  ];

  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || 'Farida Orujova';

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar
            firstName={user?.firstName || 'Farida'}
            lastName={user?.lastName || 'Orujova'}
            size={40}
          />
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Text style={styles.iconText}>🌙</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <View style={styles.notificationBadge}>
              <View style={styles.notificationDot} />
            </View>
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <MenuCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
              onPress={() => handleMenuCardPress(item)}
              style={styles.menuCard}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  userName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconText: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  // Icon Styles
  gridIcon: {
    width: 48,
    height: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  gridDot: {
    width: 8,
    height: 8,
    backgroundColor: theme.colors.text.primary,
    borderRadius: 2,
  },
  dotsIcon: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text.primary,
  },
  gearIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIconText: {
    fontSize: 28,
  },
  dataIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataIconText: {
    fontSize: 28,
    color: theme.colors.text.primary,
  },
  lockIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconText: {
    fontSize: 28,
  },
});

export default MenuScreen;
