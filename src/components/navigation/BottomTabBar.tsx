import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { theme } from '../../constants/theme';

interface TabItem {
  id: string;
  icon: string;
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabPress }) => {
  const tabs: TabItem[] = [
    {
      id: 'home',
      icon: '$',
      label: 'Home',
      isActive: activeTab === 'home',
      onPress: () => onTabPress('home'),
    },
    {
      id: 'analytics',
      icon: '📊',
      label: 'Analytics',
      isActive: activeTab === 'analytics',
      onPress: () => onTabPress('analytics'),
    },
    {
      id: 'add',
      icon: '+',
      label: 'Add',
      isActive: activeTab === 'add',
      onPress: () => onTabPress('add'),
    },
    {
      id: 'ai',
      icon: 'AI',
      label: 'AI',
      isActive: activeTab === 'ai',
      onPress: () => onTabPress('ai'),
    },
    {
      id: 'menu',
      icon: '⋮⋮',
      label: 'Menu',
      isActive: activeTab === 'menu',
      onPress: () => onTabPress('menu'),
    },
  ];

  const renderTabIcon = (tab: TabItem) => {
    if (tab.id === 'home') {
      return (
        <View style={[
          styles.homeIcon,
          { backgroundColor: tab.isActive ? theme.colors.primary : theme.colors.surface }
        ]}>
          <Text style={[
            styles.homeIconText,
            { color: tab.isActive ? theme.colors.text.inverse : theme.colors.text.primary }
          ]}>
            $
          </Text>
        </View>
      );
    }

    if (tab.id === 'add') {
      return (
        <View style={[
          styles.addButton,
          { backgroundColor: tab.isActive ? theme.colors.primary : theme.colors.primary }
        ]}>
          <View style={styles.addIcon}>
            <View style={styles.addIconHorizontal} />
            <View style={styles.addIconVertical} />
          </View>
        </View>
      );
    }

    if (tab.id === 'analytics') {
      return (
        <View style={[
          styles.regularIcon,
          { 
            backgroundColor: tab.isActive ? theme.colors.primary : 'transparent',
            borderWidth: tab.isActive ? 0 : 1,
            borderColor: theme.colors.text.secondary,
          }
        ]}>
          <Text style={[
            styles.regularIconText,
            { color: tab.isActive ? theme.colors.text.inverse : theme.colors.text.secondary }
          ]}>
            📈
          </Text>
        </View>
      );
    }

    if (tab.id === 'ai') {
      return (
        <View style={[
          styles.aiIcon,
          { 
            backgroundColor: tab.isActive ? theme.colors.primary : 'transparent',
            borderWidth: tab.isActive ? 0 : 1,
            borderColor: theme.colors.text.secondary,
          }
        ]}>
          <Text style={[
            styles.aiIconText,
            { color: tab.isActive ? theme.colors.text.inverse : theme.colors.text.secondary }
          ]}>
            AI
          </Text>
        </View>
      );
    }

    if (tab.id === 'menu') {
      return (
        <View style={styles.menuIcon}>
          <View style={styles.menuGrid}>
            <View style={[styles.menuDot, { backgroundColor: tab.isActive ? theme.colors.primary : theme.colors.text.secondary }]} />
            <View style={[styles.menuDot, { backgroundColor: tab.isActive ? theme.colors.primary : theme.colors.text.secondary }]} />
            <View style={[styles.menuDot, { backgroundColor: tab.isActive ? theme.colors.primary : theme.colors.text.secondary }]} />
            <View style={[styles.menuDot, { backgroundColor: tab.isActive ? theme.colors.primary : theme.colors.text.secondary }]} />
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              tab.id === 'add' && styles.addTab
            ]}
            onPress={tab.onPress}
            activeOpacity={0.7}
          >
            {renderTabIcon(tab)}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingBottom: 20, // Safe area padding
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
    marginTop: -20, // Elevate the add button
  },
  homeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  regularIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regularIconText: {
    fontSize: 16,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIconText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  addIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  addIconHorizontal: {
    position: 'absolute',
    width: 16,
    height: 3,
    backgroundColor: theme.colors.text.inverse,
    borderRadius: 1.5,
  },
  addIconVertical: {
    position: 'absolute',
    width: 3,
    height: 16,
    backgroundColor: theme.colors.text.inverse,
    borderRadius: 1.5,
  },
  menuIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuGrid: {
    width: 24,
    height: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  menuDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
