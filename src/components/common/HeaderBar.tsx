// Bhraman - Native Mobile Header Bar
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { TrafficCondition, WeatherCondition } from '../../types';

interface HeaderBarProps {
  currentCity?: string;
  neighborhood?: string;
  traffic: TrafficCondition;
  weather: WeatherCondition;
  onOpenDemoDock: () => void;
  isDemoDockOpen: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentCity = "Mumbai",
  neighborhood = "Bandra West",
  traffic,
  weather,
  onOpenDemoDock,
  isDemoDockOpen,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View>
          <View style={styles.titleWithBadge}>
            <Text style={styles.brandTitle}>BHRAMAN</Text>
            <View style={styles.hackathonBadge}>
              <Text style={styles.hackathonText}>PS6</Text>
            </View>
          </View>
          <Text style={styles.brandTagline}>Discover Beyond the Obvious</Text>
        </View>

        <TouchableOpacity 
          style={[styles.demoTriggerBtn, isDemoDockOpen && styles.demoTriggerBtnActive]}
          onPress={onOpenDemoDock}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isDemoDockOpen ? "flash" : "flash-outline"} 
            size={16} 
            color={isDemoDockOpen ? '#FFF' : THEME.colors.primary} 
          />
          <Text style={[styles.demoTriggerText, isDemoDockOpen && styles.demoTriggerTextActive]}>
            Demo Dock
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusBarRow}>
        <View style={styles.locationChip}>
          <Ionicons name="location-sharp" size={12} color={THEME.colors.primary} />
          <Text style={styles.locationText}>{neighborhood}, {currentCity}</Text>
        </View>

        <View style={styles.conditionChipsGroup}>
          <View style={[
            styles.statusPill, 
            weather === 'rain' ? styles.statusPillRain : styles.statusPillClear
          ]}>
            <Ionicons 
              name={weather === 'rain' ? "rainy" : "sunny"} 
              size={11} 
              color={weather === 'rain' ? THEME.colors.danger : THEME.colors.success} 
            />
            <Text style={[
              styles.statusPillText, 
              weather === 'rain' && styles.statusPillTextRain
            ]}>
              {weather === 'rain' ? 'Rain (Simulated)' : 'Clear (Simulated)'}
            </Text>
          </View>

          <View style={[
            styles.statusPill,
            traffic === 'heavy' ? styles.statusPillHeavy : traffic === 'severe' ? styles.statusPillSevere : styles.statusPillNormal
          ]}>
            <Ionicons 
              name={traffic === 'normal' ? "shield-checkmark" : "warning"} 
              size={11} 
              color={traffic === 'normal' ? THEME.colors.success : THEME.colors.warning} 
            />
            <Text style={[
              styles.statusPillText,
              traffic === 'heavy' && styles.statusPillTextWarning
            ]}>
              {traffic === 'normal' ? 'Normal (Simulated)' : traffic === 'heavy' ? 'Traffic Spike (Simulated)' : 'Severe (Simulated)'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: 1.5,
  },
  hackathonBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hackathonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  brandTagline: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  demoTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    gap: 4,
  },
  demoTriggerBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  demoTriggerText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  demoTriggerTextActive: {
    color: '#FFF',
  },
  statusBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.sm,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.sm,
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  conditionChipsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surface,
    gap: 3,
  },
  statusPillClear: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPillRain: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusPillNormal: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPillHeavy: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusPillSevere: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.success,
  },
  statusPillTextRain: {
    color: THEME.colors.danger,
  },
  statusPillTextWarning: {
    color: THEME.colors.warning,
  },
});
