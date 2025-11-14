import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, SearchBar, TabSelector, ScheduledPaymentCard } from '../../components/common';
import { ScheduledPayment } from '../../components/common/ScheduledPaymentCard';
import { theme } from '../../constants/theme';

const ScheduledPaymentsScreen: React.FC<NavigationProps<'ScheduledPayments'>> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'Active', label: 'Active' },
    { id: 'Overdue', label: 'Overdue' },
  ];

  // Mock scheduled payments data - matching HomeScreen structure
  const allPayments: ScheduledPayment[] = [
    {
      id: '1',
      title: 'Home service fee',
      dueDateText: 'Due date in 4 days',
      amount: 35,
      specificDate: '3 June',
      color: '#FF6B35',
      icon: '🏠',
      isOverdue: false,
    },
    {
      id: '2',
      title: 'Car Insurance',
      dueDateText: 'Due date in 15 days',
      amount: 65,
      specificDate: '14 June',
      color: theme.colors.success,
      icon: '🚗',
      isOverdue: false,
    },
    {
      id: '3',
      title: 'Gym Membership',
      dueDateText: 'Due date in 16 days',
      amount: 27,
      specificDate: '15 June',
      color: '#007AFF',
      icon: '🏋️',
      isOverdue: false,
    },
    {
      id: '4',
      title: 'Netflix Subscription',
      dueDateText: 'Due date in 20 days',
      amount: 27,
      specificDate: '20 June',
      color: '#FF3B30',
      icon: '📺',
      isOverdue: false,
    },
    {
      id: '5',
      title: 'Internet',
      dueDateText: 'Overdue',
      amount: 18,
      specificDate: '23 May',
      color: '#5AC8FA',
      icon: '📶',
      isOverdue: true,
    },
  ];

  const filteredPayments = allPayments.filter((payment) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return !payment.isOverdue;
    if (activeTab === 'Overdue') return payment.isOverdue;
    return true;
  });

  const handleAddNew = () => {
    // Navigate to add scheduled payment screen or show modal
    console.log('Add new scheduled payment');
  };

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      <HeaderNavigation
        title="Scheduled payments"
        onBackPress={() => navigation.goBack()}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPayments.length > 0 ? (
          filteredPayments.map((item) => (
            <ScheduledPaymentCard
              key={item.id}
              payment={item}
              onPress={() => {
                // Navigate to payment details
                console.log('Payment details', item.id);
              }}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} payments</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <View style={styles.addIconContainer}>
            <View style={styles.addIconHorizontal} />
            <View style={styles.addIconVertical} />
          </View>
          <Text style={styles.addText}>Add new</Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  addButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  addIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  addIconHorizontal: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: theme.colors.text.secondary,
    borderRadius: 1,
  },
  addIconVertical: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: theme.colors.text.secondary,
    borderRadius: 1,
  },
  addText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});

export default ScheduledPaymentsScreen;

