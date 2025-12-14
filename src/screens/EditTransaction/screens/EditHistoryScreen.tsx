// flows/editTransaction/screens/EditHistoryScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../../constants/theme';

interface EditHistoryEntry {
  id: string;
  editedBy: string;
  editedAt: string;
  editReason: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

// Mock edit history
const mockEditHistory: EditHistoryEntry[] = [
  {
    id: 'EDIT-003',
    editedBy: 'Current User',
    editedAt: '2025-12-09T14:30:00',
    editReason: 'Payment method was incorrectly recorded',
    changes: [
      {
        field: 'Payment Method',
        oldValue: 'Cash',
        newValue: 'Bank Transfer',
      },
    ],
  },
  {
    id: 'EDIT-002',
    editedBy: 'Admin User',
    editedAt: '2025-12-08T10:15:00',
    editReason: 'Amount was entered incorrectly, correcting to actual amount',
    changes: [
      {
        field: 'Amount',
        oldValue: 'PKR 45,000',
        newValue: 'PKR 50,000',
      },
    ],
  },
  {
    id: 'EDIT-001',
    editedBy: 'Current User',
    editedAt: '2025-12-07T16:45:00',
    editReason: 'Transaction date was wrong',
    changes: [
      {
        field: 'Date',
        oldValue: '07 Dec 2025',
        newValue: '06 Dec 2025',
      },
    ],
  },
];

const EditHistoryScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();

  // @ts-ignore
  const { transaction } = route.params || {};

  const [editHistory] = React.useState<EditHistoryEntry[]>(mockEditHistory);

  const handleExpandEdit = (editId: string) => {
    console.log('Expand edit:', editId);
  };

  const renderChangeField = (change: any) => (
    <View key={change.field} style={styles.changeField}>
      <Text style={styles.changeFieldLabel}>{change.field}</Text>
      <View style={styles.changeFieldValues}>
        <View style={styles.changeFieldOld}>
          <Text style={styles.changeFieldOldValue}>{change.oldValue}</Text>
        </View>
        <Ionicons name="arrow-forward" size={14} color="#8E8E93" />
        <View style={styles.changeFieldNew}>
          <Text style={styles.changeFieldNewValue}>{change.newValue}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit History</Text>
          <Text style={styles.headerSubtitle}>
            Complete audit trail for {transaction?.reference}
          </Text>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoBannerText}>
            All edits are tracked for compliance and auditing purposes. Original
            transaction details are always preserved.
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {editHistory.map((entry, index) => (
            <View key={entry.id} style={styles.timelineItem}>
              {/* Timeline Line */}
              {index !== editHistory.length - 1 && (
                <View style={styles.timelineLine} />
              )}

              {/* Timeline Dot */}
              <View style={styles.timelineDot}>
                <View style={styles.timelineDotInner} />
              </View>

              {/* Edit Card */}
              <TouchableOpacity
                style={styles.editCard}
                onPress={() => handleExpandEdit(entry.id)}
              >
                <View style={styles.editHeader}>
                  <View style={styles.editHeaderLeft}>
                    <Ionicons name="create" size={20} color="#007AFF" />
                    <Text style={styles.editId}>{entry.id}</Text>
                  </View>
                  <Text style={styles.editDate}>
                    {new Date(entry.editedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={styles.editBody}>
                  <View style={styles.editMetaRow}>
                    <Ionicons name="person" size={16} color="#8E8E93" />
                    <Text style={styles.editMeta}>{entry.editedBy}</Text>
                  </View>

                  <View style={styles.editMetaRow}>
                    <Ionicons name="time" size={16} color="#8E8E93" />
                    <Text style={styles.editMeta}>
                      {new Date(entry.editedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <View style={styles.editReasonContainer}>
                    <Text style={styles.editReasonLabel}>Reason:</Text>
                    <Text style={styles.editReasonText}>
                      {entry.editReason}
                    </Text>
                  </View>

                  {/* Changes */}
                  <View style={styles.changesContainer}>
                    <Text style={styles.changesLabel}>Changes:</Text>
                    {entry.changes.map(change => renderChangeField(change))}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}

          {/* Original Transaction */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotOriginal]}>
              <Ionicons name="document" size={16} color="#34C759" />
            </View>

            <View style={[styles.editCard, styles.originalCard]}>
              <View style={styles.editHeader}>
                <View style={styles.editHeaderLeft}>
                  <Ionicons name="add-circle" size={20} color="#34C759" />
                  <Text style={styles.editId}>Original Transaction</Text>
                </View>
              </View>

              <View style={styles.editBody}>
                <Text style={styles.originalText}>
                  Transaction created on{' '}
                  {new Date(transaction?.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.originalSubtext}>
                  No edits have been made to this point
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Edit Summary</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Edits</Text>
            <Text style={styles.statValue}>{editHistory.length}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Last Edited</Text>
            <Text style={styles.statValue}>
              {new Date(editHistory[0].editedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Edited By</Text>
            <Text style={styles.statValue}>
              {[...new Set(editHistory.map(e => e.editedBy))].length} user
              {[...new Set(editHistory.map(e => e.editedBy))].length !== 1
                ? 's'
                : ''}
            </Text>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.exportCard}>
          <Text style={styles.exportTitle}>Export History</Text>

          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download" size={20} color="#007AFF" />
            <Text style={styles.exportButtonText}>
              Download Audit Report (PDF)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="mail" size={20} color="#007AFF" />
            <Text style={styles.exportButtonText}>Email Audit Trail</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  infoBanner: {
    flexDirection: 'row' as const,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  infoBannerText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  timeline: {
    marginBottom: theme.spacing.lg,
  },
  timelineItem: {
    position: 'relative' as const,
    paddingLeft: 40,
    marginBottom: theme.spacing.lg,
  },
  timelineLine: {
    position: 'absolute' as const,
    left: 15,
    top: 32,
    bottom: -theme.spacing.lg,
    width: 2,
    backgroundColor: theme.colors.divider,
  },
  timelineDot: {
    position: 'absolute' as const,
    left: 0,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    borderWidth: 4,
    borderColor: theme.colors.background,
  },
  timelineDotInner: {
    width: '100%' as const,
    height: '100%' as const,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  timelineDotOriginal: {
    backgroundColor: '#34C759',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  editCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  originalCard: {
    borderWidth: 2,
    borderColor: '#34C759' + '30',
  },
  editHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  editHeaderLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
  },
  editId: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  editDate: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  editBody: {
    gap: theme.spacing.sm,
  },
  editMetaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.xs,
  },
  editMeta: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  editReasonContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  editReasonLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 10,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  editReasonText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    lineHeight: 16,
  },
  changesContainer: {
    marginTop: theme.spacing.sm,
  },
  changesLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  changeField: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  changeFieldLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 10,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  changeFieldValues: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
  },
  changeFieldOld: {
    flex: 1,
  },
  changeFieldOldValue: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textDecorationLine: 'line-through' as const,
  },
  changeFieldNew: {
    flex: 1,
  },
  changeFieldNewValue: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  originalText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  originalSubtext: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  statsTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  statRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  statValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  exportCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  exportTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  exportButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  exportButtonText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
});

export default EditHistoryScreen;
