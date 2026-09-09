// Bhraman - Micro-Itinerary Detailed Screen
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Modal,
  useWindowDimensions
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { MicroItinerary, ItineraryStop, ReplanningDiff, TravelerConstraints } from '../../types';
import { ReplanningBanner } from './ReplanningBanner';

interface ItineraryViewProps {
  itinerary: MicroItinerary | null;
  activeDiff: ReplanningDiff | null;
  onAcceptDiff: () => void;
  onDismissDiff: () => void;
  onTriggerSimulateChange: (scenario: 'heavy_rain' | 'traffic_spike' | 'time_cut' | 'budget_cut') => void;
  onSavePlan: () => void;
  onSelectStopOnMap?: (stop: ItineraryStop) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  activeDiff,
  onAcceptDiff,
  onDismissDiff,
  onTriggerSimulateChange,
  onSavePlan,
  onSelectStopOnMap,
}) => {
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [expandedStopIndex, setExpandedStopIndex] = useState<number | null>(null);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  if (!itinerary) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="trail-sign-outline" size={48} color={THEME.colors.textMuted} />
        <Text style={styles.emptyTitle}>No Active Exploration Plan</Text>
        <Text style={styles.emptySubtitle}>
          Use voice or text on the Home screen to build your personalized time-bounded experience.
        </Text>
      </View>
    );
  }

  const toggleExpand = (idx: number) => {
    setExpandedStopIndex(expandedStopIndex === idx ? null : idx);
  };

  const renderHeader = () => (
    <View style={styles.planHeaderCard}>
      <View style={styles.planHeaderTop}>
        <View>
          <Text style={styles.planSuperTitle}>YOUR BHRAMAN PLAN</Text>
          <Text style={styles.planHeadline}>
            {itinerary.stops.length}-Stop Local Experience
          </Text>
          <Text style={styles.planBaseText}>
            Base: {itinerary.baseLocation.name}
          </Text>
        </View>
        <View style={[
          styles.confidenceBadge, 
          itinerary.confidence === 'High' ? styles.confidenceHigh : styles.confidenceModerate
        ]}>
          <Ionicons name="shield-checkmark" size={12} color="#FFF" />
          <Text style={styles.confidenceBadgeText}>{itinerary.confidence} Confidence</Text>
        </View>
      </View>

      {/* Key Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Calculated Cost</Text>
          <Text style={styles.metricValue}>₹{itinerary.totalCost.toLocaleString()}</Text>
          <Text style={styles.metricSub}>Limit: ₹{itinerary.budgetLimit.toLocaleString()}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Duration</Text>
          <Text style={styles.metricValue}>
            {Math.floor(itinerary.totalTimeMinutes / 60)}h {itinerary.totalTimeMinutes % 60}m
          </Text>
          <Text style={styles.metricSub}>{itinerary.startTime} - {itinerary.endTime}</Text>
        </View>

        <View style={[styles.metricCard, styles.bufferMetricCard]}>
          <Text style={[styles.metricLabel, { color: THEME.colors.success }]}>Return Buffer</Text>
          <Text style={[styles.metricValue, { color: THEME.colors.success }]}>
            {itinerary.safetyBufferMinutes} min
          </Text>
          <Text style={styles.metricSub}>Guaranteed</Text>
        </View>
      </View>

      {/* Confidence statement */}
      <View style={styles.confidenceReasonBox}>
        <Ionicons name="information-circle-outline" size={14} color={THEME.colors.textSecondary} />
        <Text style={styles.confidenceReasonText}>{itinerary.confidenceReason}</Text>
      </View>
    </View>
  );

  const renderActionBar = () => (
    <View style={styles.actionButtonsRow}>
      <TouchableOpacity
        style={styles.simulateChangeBtn}
        onPress={() => setShowSimulateModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={16} color="#FFF" />
        <Text style={styles.simulateChangeText}>Simulate Change</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.savePlanBtn} onPress={onSavePlan} activeOpacity={0.8}>
        <Ionicons name="bookmark-outline" size={16} color={THEME.colors.primary} />
        <Text style={styles.savePlanText}>Save Plan</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimeline = () => (
    <View style={styles.timelineSection}>
      <Text style={styles.timelineSectionTitle}>TIMELINE & STOPS</Text>

      {/* Start Point */}
      <View style={styles.timelineNode}>
        <View style={styles.nodeIconCol}>
          <View style={styles.nodeCircleBase}>
            <Ionicons name="business" size={12} color="#FFF" />
          </View>
          <View style={styles.nodeLine} />
        </View>
        <View style={styles.nodeContent}>
          <Text style={styles.nodeTimeText}>{itinerary.startTime}</Text>
          <Text style={styles.nodeTitleText}>Depart Base: {itinerary.baseLocation.name}</Text>
          <Text style={styles.nodeSubtitleText}>Mode: {itinerary.transportMode.toUpperCase()}</Text>
        </View>
      </View>

      {/* Stops */}
      {itinerary.stops.map((stop) => {
        const isExpanded = expandedStopIndex === stop.stopIndex;
        return (
          <View key={stop.stopIndex} style={styles.timelineNode}>
            {/* Vertical line & Marker */}
            <View style={styles.nodeIconCol}>
              <View style={styles.nodeCircleStop}>
                <Text style={styles.nodeStopNum}>{stop.stopIndex}</Text>
              </View>
              <View style={styles.nodeLine} />
            </View>

            {/* Stop Card */}
            <View style={styles.stopCard}>
              <View style={styles.stopCardHeader}>
                <View style={styles.stopInfoGroup}>
                  <View style={styles.badgeRow}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{stop.place.category.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.travelLegTime}>
                      +{stop.travelTimeMinutes}m travel (₹{stop.travelCost})
                    </Text>
                  </View>
                  <Text style={styles.stopName}>{stop.place.name}</Text>
                  <Text style={styles.stopTiming}>
                    {stop.arrivalTime} - {stop.departureTime} ({stop.activityDurationMinutes}m stay)
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.expandToggle}
                  onPress={() => toggleExpand(stop.stopIndex)}
                >
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={THEME.colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Why Bhraman picked this */}
              <View style={styles.whyBox}>
                <View style={styles.whyHeader}>
                  <Ionicons name="bulb-outline" size={12} color={THEME.colors.accent} />
                  <Text style={styles.whyLabel}>Why Bhraman picked this:</Text>
                </View>
                <Text style={styles.whyText}>{stop.whyChosen}</Text>
              </View>

              {/* Expanded Details */}
              {isExpanded && (
                <View style={styles.expandedSection}>
                  <Text style={styles.placeDesc}>{stop.place.description}</Text>
                  <View style={styles.scoreDetailsRow}>
                    <Text style={styles.scoreDetailItem}>
                      Match: {stop.scoreBreakdown.preferenceMatch}/30
                    </Text>
                    <Text style={styles.scoreDetailItem}>
                      Feasibility: {stop.scoreBreakdown.feasibility}/20
                    </Text>
                    <Text style={styles.scoreDetailItem}>
                      Efficiency: {stop.scoreBreakdown.travelEfficiency}/15
                    </Text>
                    <Text style={styles.scoreDetailItem}>
                      Trust: {stop.scoreBreakdown.communityTrust}/10
                    </Text>
                  </View>
                  <View style={styles.costBreakdownRow}>
                    <Text style={styles.costText}>
                      Activity: ₹{stop.activityCost} (₹{stop.place.averageCostPerPerson}/person)
                    </Text>
                    <Text style={styles.costText}>Transit: ₹{stop.travelCost}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {/* Return Leg */}
      <View style={styles.timelineNode}>
        <View style={styles.nodeIconCol}>
          <View style={styles.nodeCircleReturn}>
            <Ionicons name="home" size={12} color="#FFF" />
          </View>
        </View>
        <View style={styles.nodeContent}>
          <Text style={styles.nodeTimeText}>{itinerary.endTime}</Text>
          <Text style={styles.nodeTitleText}>
            Return to Base ({itinerary.returnTravelMinutes}m transit, ₹{itinerary.returnTravelCost})
          </Text>
          <View style={styles.bufferGuaranteeTag}>
            <Ionicons name="checkmark-circle" size={12} color={THEME.colors.success} />
            <Text style={styles.bufferGuaranteeText}>
              {itinerary.safetyBufferMinutes}-Minute Return Buffer Preserved
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={isDesktop ? styles.desktopScrollContent : undefined}
      showsVerticalScrollIndicator={false}
    >
      <View style={isDesktop ? styles.desktopWrapper : undefined}>
        {/* Replanning Banner if active */}
        {activeDiff && (
          <ReplanningBanner
            diff={activeDiff}
            onAccept={onAcceptDiff}
            onDismiss={onDismissDiff}
          />
        )}

        {isDesktop ? (
          <View style={styles.desktopColumns}>
            <View style={styles.leftColumn}>
              {renderTimeline()}
            </View>
            <View style={styles.rightColumn}>
              {renderHeader()}
              {renderActionBar()}
            </View>
          </View>
        ) : (
          <>
            {renderHeader()}
            {renderActionBar()}
            {renderTimeline()}
          </>
        )}
      </View>

      {/* Simulate Change Modal */}
      <Modal visible={showSimulateModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
          <View style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚡ Simulate Local Change (PS6)</Text>
              <TouchableOpacity onPress={() => setShowSimulateModal(false)}>
                <Ionicons name="close" size={22} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Demonstrates Bhraman's dynamic context-aware replanning when reality changes:
            </Text>

            <TouchableOpacity
              style={styles.scenarioBtn}
              onPress={() => {
                setShowSimulateModal(false);
                onTriggerSimulateChange('heavy_rain');
              }}
            >
              <View style={styles.scenarioIconWrap}>
                <Ionicons name="rainy" size={20} color={THEME.colors.danger} />
              </View>
              <View style={styles.scenarioInfo}>
                <Text style={styles.scenarioTitle}>Heavy Rain Triggers</Text>
                <Text style={styles.scenarioSubtitle}>
                  Prunes outdoor stops and auto-substitutes covered indoor gems.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scenarioBtn}
              onPress={() => {
                setShowSimulateModal(false);
                onTriggerSimulateChange('traffic_spike');
              }}
            >
              <View style={styles.scenarioIconWrap}>
                <Ionicons name="warning" size={20} color={THEME.colors.warning} />
              </View>
              <View style={styles.scenarioInfo}>
                <Text style={styles.scenarioTitle}>Traffic Spike On Return Corridors</Text>
                <Text style={styles.scenarioSubtitle}>
                  Inflates travel times; re-evaluates stops to protect return buffer.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scenarioBtn}
              onPress={() => {
                setShowSimulateModal(false);
                onTriggerSimulateChange('time_cut');
              }}
            >
              <View style={styles.scenarioIconWrap}>
                <Ionicons name="hourglass" size={20} color={THEME.colors.primary} />
              </View>
              <View style={styles.scenarioInfo}>
                <Text style={styles.scenarioTitle}>Available Time Reduced to 70 Mins</Text>
                <Text style={styles.scenarioSubtitle}>
                  Shrinks reachable boundary; collapses to 1 high-value stop with return.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scenarioBtn}
              onPress={() => {
                setShowSimulateModal(false);
                onTriggerSimulateChange('budget_cut');
              }}
            >
              <View style={styles.scenarioIconWrap}>
                <Ionicons name="wallet" size={20} color={THEME.colors.success} />
              </View>
              <View style={styles.scenarioInfo}>
                <Text style={styles.scenarioTitle}>Budget Reduced to ₹1,000</Text>
                <Text style={styles.scenarioSubtitle}>
                  Replaces high-cost items with authentic street snacks & free community gems.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
  },
  desktopScrollContent: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
  },
  desktopWrapper: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  desktopColumns: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
    width: '100%',
  },
  leftColumn: {
    flex: 6,
  },
  rightColumn: {
    flex: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xl,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: THEME.spacing.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: THEME.spacing.sm,
    lineHeight: 18,
  },
  planHeaderCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.md,
  },
  planHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.sm,
  },
  planSuperTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 1,
  },
  planHeadline: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  planBaseText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.full,
    gap: 4,
  },
  confidenceHigh: {
    backgroundColor: THEME.colors.success,
  },
  confidenceModerate: {
    backgroundColor: THEME.colors.warning,
  },
  confidenceBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: THEME.spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    padding: 8,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  bufferMetricCard: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  metricLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  metricSub: {
    fontSize: 9,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  confidenceReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    padding: 8,
    borderRadius: THEME.radius.sm,
    gap: 6,
  },
  confidenceReasonText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: THEME.spacing.md,
  },
  simulateChangeBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    gap: 6,
  },
  simulateChangeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  savePlanBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 6,
  },
  savePlanText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  timelineSection: {
    marginTop: THEME.spacing.xs,
  },
  timelineSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: THEME.spacing.sm,
  },
  timelineNode: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.sm,
  },
  nodeIconCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 8,
  },
  nodeCircleBase: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeCircleStop: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeStopNum: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  nodeCircleReturn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeLine: {
    flex: 1,
    width: 2,
    backgroundColor: THEME.colors.surfaceBorder,
    marginVertical: 4,
  },
  nodeContent: {
    flex: 1,
    paddingBottom: 10,
  },
  nodeTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  nodeTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  nodeSubtitleText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  bufferGuaranteeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bufferGuaranteeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.success,
  },
  stopCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: 6,
  },
  stopCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stopInfoGroup: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryPill: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  travelLegTime: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  stopTiming: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  expandToggle: {
    padding: 4,
  },
  whyBox: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.sm,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: THEME.colors.accent,
  },
  whyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  whyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.accent,
  },
  whyText: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    lineHeight: 15,
  },
  expandedSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
  },
  placeDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  scoreDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  scoreDetailItem: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  costBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  costText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalOverlayDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  modalContentDesktop: {
    maxWidth: 540,
    width: '100%',
    borderRadius: 20,
    paddingBottom: THEME.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  modalDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
  },
  scenarioBtn: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.md,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 12,
  },
  scenarioIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  scenarioSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
