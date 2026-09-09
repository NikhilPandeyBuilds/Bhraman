// Bhraman - Dynamic Context-Aware Replanning Diff Banner
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ReplanningDiff } from '../../types';

interface ReplanningBannerProps {
  diff: ReplanningDiff;
  onAccept: () => void;
  onDismiss: () => void;
}

export const ReplanningBanner: React.FC<ReplanningBannerProps> = ({
  diff,
  onAccept,
  onDismiss,
}) => {
  const getTriggerIcon = () => {
    switch (diff.trigger) {
      case 'heavy_rain':
        return 'rainy';
      case 'traffic_spike':
        return 'warning';
      case 'time_cut':
        return 'hourglass';
      case 'budget_cut':
        return 'wallet';
      default:
        return 'refresh-circle';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name={getTriggerIcon()} size={18} color={THEME.colors.warning} />
          <Text style={styles.alertTitle}>Plan Recalculated Automatically</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color={THEME.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.reasonText}>{diff.reason}</Text>

      {/* Changes Summary Grid */}
      <View style={styles.diffChangesGrid}>
        {diff.removedStops.length > 0 && (
          <View style={styles.diffItemRemoved}>
            <Text style={styles.diffLabelRemoved}>✕ Removed</Text>
            {diff.removedStops.map(s => (
              <Text key={s.id} style={styles.diffPlaceRemovedText} numberOfLines={1}>
                {s.name}
              </Text>
            ))}
          </View>
        )}

        {diff.addedStops.length > 0 && (
          <View style={styles.diffItemAdded}>
            <Text style={styles.diffLabelAdded}>✓ Added Alternative</Text>
            {diff.addedStops.map(s => (
              <Text key={s.id} style={styles.diffPlaceAddedText} numberOfLines={1}>
                {s.name}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Metric comparison */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Total Duration</Text>
          <Text style={styles.metricValue}>
            {diff.newDurationMinutes}m{' '}
            <Text style={styles.metricOldValue}>({diff.oldDurationMinutes}m)</Text>
          </Text>
        </View>

        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Estimated Cost</Text>
          <Text style={styles.metricValue}>
            ₹{diff.newCost}{' '}
            <Text style={styles.metricOldValue}>(₹{diff.oldCost})</Text>
          </Text>
        </View>

        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Safety Buffer</Text>
          <Text style={[styles.metricValue, { color: THEME.colors.success }]}>
            {diff.newBufferMinutes}m guaranteed
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.acceptButton} onPress={onAccept} activeOpacity={0.8}>
        <Text style={styles.acceptButtonText}>ACCEPT NEW PLAN</Text>
        <Ionicons name="checkmark-circle" size={16} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.warning,
    marginBottom: THEME.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.warning,
  },
  closeBtn: {
    padding: 2,
  },
  reasonText: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    lineHeight: 17,
    marginBottom: THEME.spacing.sm,
  },
  diffChangesGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: THEME.spacing.sm,
  },
  diffItemRemoved: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 8,
    borderRadius: THEME.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.danger,
  },
  diffLabelRemoved: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.danger,
    marginBottom: 2,
  },
  diffPlaceRemovedText: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  diffItemAdded: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 8,
    borderRadius: THEME.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.success,
  },
  diffLabelAdded: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.success,
    marginBottom: 2,
  },
  diffPlaceAddedText: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.background,
    padding: 8,
    borderRadius: THEME.radius.sm,
    marginBottom: THEME.spacing.sm,
  },
  metricCol: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  metricOldValue: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  acceptButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    gap: 6,
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
