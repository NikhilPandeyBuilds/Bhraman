// Bhraman - HackCelestial 3.0 Judge Demo Controller Dock
// Provides 1-click execution of the complete 3-minute hackathon judging script
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { TrafficCondition, WeatherCondition } from '../../types';

interface HackathonDemoDockProps {
  onRunBaseDemo: () => void;
  onTriggerHeavyRain: () => void;
  onTriggerTrafficSpike: () => void;
  onTriggerTimeCut: () => void;
  onTriggerBudgetCut: () => void;
  onResetConditions: () => void;
  currentTraffic: TrafficCondition;
  currentWeather: WeatherCondition;
  onClose: () => void;
}

export const HackathonDemoDock: React.FC<HackathonDemoDockProps> = ({
  onRunBaseDemo,
  onTriggerHeavyRain,
  onTriggerTrafficSpike,
  onTriggerTimeCut,
  onTriggerBudgetCut,
  onResetConditions,
  currentTraffic,
  currentWeather,
  onClose,
}) => {
  return (
    <View style={styles.dockContainer}>
      <View style={styles.dockHeader}>
        <View style={styles.titleGroup}>
          <Ionicons name="flash" size={16} color={THEME.colors.primary} />
          <Text style={styles.dockTitle}>⚡ HackCelestial 3.0 Judge Demo Dock</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color={THEME.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.dockSubtitle}>
        Execute the 3-minute PS6 evaluation script in 1-tap steps:
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
        {/* Step 1: Base Bandra 3h Itinerary */}
        <TouchableOpacity style={[styles.stepCard, styles.stepCardPrimary]} onPress={onRunBaseDemo}>
          <View style={styles.stepNumBadge}>
            <Text style={styles.stepNumText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>3h Bandra Hotel Plan</Text>
            <Text style={styles.stepSub}>3 people • ₹3,000 • Bike</Text>
          </View>
        </TouchableOpacity>

        {/* Step 2: Trigger Rain */}
        <TouchableOpacity 
          style={[styles.stepCard, currentWeather === 'rain' && styles.stepCardActive]} 
          onPress={onTriggerHeavyRain}
        >
          <View style={[styles.stepNumBadge, { backgroundColor: THEME.colors.danger }]}>
            <Text style={styles.stepNumText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>🌧️ Trigger Heavy Rain</Text>
            <Text style={styles.stepSub}>Outdoor $\to$ Covered Gem</Text>
          </View>
        </TouchableOpacity>

        {/* Step 3: Trigger Traffic Spike */}
        <TouchableOpacity 
          style={[styles.stepCard, currentTraffic === 'heavy' && styles.stepCardActive]} 
          onPress={onTriggerTrafficSpike}
        >
          <View style={[styles.stepNumBadge, { backgroundColor: THEME.colors.warning }]}>
            <Text style={styles.stepNumText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>🚦 Trigger Traffic Spike</Text>
            <Text style={styles.stepSub}>Protects return deadline</Text>
          </View>
        </TouchableOpacity>

        {/* Step 4: Trigger Time Cut */}
        <TouchableOpacity style={styles.stepCard} onPress={onTriggerTimeCut}>
          <View style={[styles.stepNumBadge, { backgroundColor: THEME.colors.accent }]}>
            <Text style={styles.stepNumText}>4</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>⏱️ Time Cut $\to$ 70 Min</Text>
            <Text style={styles.stepSub}>Shrinks isochrone to 1 stop</Text>
          </View>
        </TouchableOpacity>

        {/* Step 5: Trigger Budget Cut */}
        <TouchableOpacity style={styles.stepCard} onPress={onTriggerBudgetCut}>
          <View style={[styles.stepNumBadge, { backgroundColor: THEME.colors.success }]}>
            <Text style={styles.stepNumText}>5</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>💰 Budget Cut $\to$ ₹1,000</Text>
            <Text style={styles.stepSub}>Street food & free gems</Text>
          </View>
        </TouchableOpacity>

        {/* Reset */}
        <TouchableOpacity style={[styles.stepCard, styles.stepCardReset]} onPress={onResetConditions}>
          <Ionicons name="refresh" size={16} color={THEME.colors.textMuted} />
          <Text style={styles.stepResetText}>Reset</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dockContainer: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderTopWidth: 2,
    borderTopColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: 8,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  dockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dockTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    padding: 2,
  },
  dockSubtitle: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  actionsScroll: {
    gap: 8,
    alignItems: 'center',
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 8,
  },
  stepCardPrimary: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(230, 81, 0, 0.15)',
  },
  stepCardActive: {
    borderColor: THEME.colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  stepCardReset: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 8,
  },
  stepResetText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  stepNumBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  stepContent: {
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  stepSub: {
    fontSize: 9,
    color: THEME.colors.textMuted,
  },
});
