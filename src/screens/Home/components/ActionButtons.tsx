import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';

interface ActionButtonData {
  id: string;
  icon: string;
  onPress: () => void;
}

export const ActionButtons: React.FC = () => {
  const actionButtons: ActionButtonData[] = [
    {
      id: '1',
      icon: '😊',
      onPress: () => console.log('Button 1 pressed'),
    },
    {
      id: '2',
      icon: '⚡',
      onPress: () => console.log('Button 2 pressed'),
    },
    {
      id: '3',
      icon: '⏰',
      onPress: () => console.log('Button 3 pressed'),
    },
    {
      id: '4',
      icon: '💰',
      onPress: () => console.log('Button 4 pressed'),
    },
    {
      id: '5',
      icon: '+',
      onPress: () => console.log('Add button pressed'),
    },
  ];

  return (
    <View style={styles.container}>
      {actionButtons.map((button) => (
        <TouchableOpacity
          key={button.id}
          style={[
            styles.button,
            button.id === '5' && styles.addButton
          ]}
          onPress={button.onPress}
          activeOpacity={0.7}
        >
          {button.id === '5' ? (
            <View style={styles.addIcon}>
              <View style={styles.addIconHorizontal} />
              <View style={styles.addIconVertical} />
            </View>
          ) : (
            <View style={styles.iconContainer}>
              <View style={styles.iconText}>
                {/* Using simple colored circles for now since we can't use actual icons */}
                <View style={[
                  styles.iconPlaceholder,
                  { backgroundColor: getIconColor(button.id) }
                ]} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const getIconColor = (id: string): string => {
  const colors = {
    '1': theme.colors.primary,
    '2': '#FF6B35',
    '3': '#4A90E2',
    '4': '#F5A623',
  };
  return colors[id as keyof typeof colors] || theme.colors.primary;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  addIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  addIconHorizontal: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: theme.colors.text.inverse,
    borderRadius: 1,
  },
  addIconVertical: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: theme.colors.text.inverse,
    borderRadius: 1,
  },
});
