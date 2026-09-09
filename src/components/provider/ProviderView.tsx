// Bhraman - Provider / Merchant Mode Dashboard
// Demonstrates business analytics and sponsored campaign simulation
// Strictly embodies: "Businesses can buy visibility; they cannot buy relevance."

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  Alert
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { DEMO_PROVIDER_ANALYTICS } from '../../data/creatorsAndCommunities';

interface ProviderViewProps {
  onBackToTraveler: () => void;
}

export const ProviderView: React.FC<ProviderViewProps> = ({ onBackToTraveler }) => {
  const [dailyBudget, setDailyBudget] = useState('500');
  const [campaignActive, setCampaignActive] = useState(false);

  const handleLaunchCampaign = () => {
    setCampaignActive(true);
    Alert.alert(
      "Sponsored Visibility Active",
      `Campaign launched with daily budget ₹${dailyBudget}. Your placement will display prominently in the distinct Sponsored section with a clear [SPONSORED] tag. Note: Organic ranking score remains unaffected.`
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerSuper}>MERCHANT & PROVIDER PORTAL</Text>
            <Text style={styles.businessName}>{DEMO_PROVIDER_ANALYTICS.businessName}</Text>
            <Text style={styles.businessCategory}>Bandra West • Rooftop Artisan Dining</Text>
          </View>
          <TouchableOpacity style={styles.exitModeBtn} onPress={onBackToTraveler}>
            <Ionicons name="arrow-back" size={14} color="#FFF" />
            <Text style={styles.exitModeText}>Traveler Mode</Text>
          </TouchableOpacity>
        </View>

        {/* CORE TRUST MANDATE BANNER */}
        <View style={styles.trustMandateBanner}>
          <Ionicons name="shield-checkmark" size={16} color={THEME.colors.warning} />
          <View style={{ flex: 1 }}>
            <Text style={styles.trustMandateTitle}>Bhraman Integrity Principle</Text>
            <Text style={styles.trustMandateText}>
              Businesses can purchase clearly labelled visibility. Businesses can NEVER buy organic relevance. Organic ranking is determined solely by traveler constraints, reachability, and community trust.
            </Text>
          </View>
        </View>
      </View>

      {/* Analytics Overview Grid */}
      <Text style={styles.sectionTitle}>PERFORMANCE ANALYTICS</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Ionicons name="eye-outline" size={18} color={THEME.colors.primary} />
          <Text style={styles.analyticsVal}>{DEMO_PROVIDER_ANALYTICS.viewsTotal.toLocaleString()}</Text>
          <Text style={styles.analyticsLbl}>Profile Views</Text>
        </View>

        <View style={styles.analyticsCard}>
          <Ionicons name="bookmark-outline" size={18} color={THEME.colors.secondary} />
          <Text style={styles.analyticsVal}>{DEMO_PROVIDER_ANALYTICS.savesTotal.toLocaleString()}</Text>
          <Text style={styles.analyticsLbl}>Traveler Saves</Text>
        </View>

        <View style={styles.analyticsCard}>
          <Ionicons name="trail-sign-outline" size={18} color={THEME.colors.accent} />
          <Text style={styles.analyticsVal}>{DEMO_PROVIDER_ANALYTICS.itineraryInclusions.toLocaleString()}</Text>
          <Text style={styles.analyticsLbl}>In Plan Routes</Text>
        </View>

        <View style={styles.analyticsCard}>
          <Ionicons name="chatbubbles-outline" size={18} color={THEME.colors.success} />
          <Text style={styles.analyticsVal}>{DEMO_PROVIDER_ANALYTICS.inquiries.toLocaleString()}</Text>
          <Text style={styles.analyticsLbl}>Direct Inquiries</Text>
        </View>
      </View>

      {/* Traveler Demand Heatmap */}
      <Text style={styles.sectionTitle}>NEIGHBORHOOD TRAVELER DEMAND</Text>
      <View style={styles.demandCard}>
        <Text style={styles.demandDesc}>
          Travelers searching within 20-min reachability of Bandra West are looking for:
        </Text>
        {DEMO_PROVIDER_ANALYTICS.topTravelerInterests.map(item => (
          <View key={item.category} style={styles.demandRow}>
            <View style={styles.demandLabelRow}>
              <Text style={styles.demandCatName}>{item.category}</Text>
              <Text style={styles.demandCatPct}>{item.percentage}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${item.percentage}%` }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Sponsored Campaign Simulation */}
      <Text style={styles.sectionTitle}>SPONSORED CAMPAIGN SIMULATOR</Text>
      <View style={styles.campaignCard}>
        <View style={styles.campaignHeaderRow}>
          <View>
            <Text style={styles.campaignTitle}>Promoted Experience Slot</Text>
            <Text style={styles.campaignSubtitle}>Appears exclusively in the distinct Sponsored section</Text>
          </View>
          <View style={styles.sponsoredBadgePreview}>
            <Text style={styles.sponsoredBadgePreviewText}>SPONSORED</Text>
          </View>
        </View>

        <View style={styles.budgetInputGroup}>
          <Text style={styles.inputLabel}>Daily Campaign Budget (INR)</Text>
          <View style={styles.inputRow}>
            <Text style={styles.rupeePrefix}>₹</Text>
            <TextInput
              style={styles.budgetInput}
              value={dailyBudget}
              onChangeText={setDailyBudget}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.reachEstimateBox}>
          <Text style={styles.reachEstimateText}>
            Estimated Impressions: ~{parseInt(dailyBudget || '0', 10) * 8} nearby travelers per day
          </Text>
          <Text style={styles.reachEstimateSub}>
            Delivered only when traveler is within practical reachability bounds.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.launchCampaignBtn, campaignActive && styles.launchCampaignBtnActive]}
          onPress={handleLaunchCampaign}
          activeOpacity={0.8}
        >
          <Text style={styles.launchCampaignBtnText}>
            {campaignActive ? "✓ CAMPAIGN SIMULATION ACTIVE" : "SIMULATE SPONSORED CAMPAIGN"}
          </Text>
        </TouchableOpacity>
      </View>

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
  headerCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.sm,
  },
  headerSuper: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  businessCategory: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  exitModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
    gap: 4,
  },
  exitModeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  trustMandateBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 10,
    borderRadius: THEME.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.warning,
    gap: 8,
    marginTop: 6,
  },
  trustMandateTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.warning,
    marginBottom: 2,
  },
  trustMandateText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    lineHeight: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: THEME.spacing.xs,
    marginTop: THEME.spacing.xs,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: THEME.spacing.md,
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: 'flex-start',
  },
  analyticsVal: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 4,
  },
  analyticsLbl: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  demandCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.md,
  },
  demandDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 10,
  },
  demandRow: {
    marginBottom: 8,
  },
  demandLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  demandCatName: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  demandCatPct: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  barTrack: {
    height: 6,
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
  },
  campaignCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.md,
  },
  campaignHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  campaignTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  campaignSubtitle: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  sponsoredBadgePreview: {
    backgroundColor: THEME.colors.sponsoredBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sponsoredBadgePreviewText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C4B5FD',
  },
  budgetInputGroup: {
    marginVertical: 6,
  },
  inputLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  rupeePrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginRight: 4,
  },
  budgetInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
    paddingVertical: 8,
  },
  reachEstimateBox: {
    backgroundColor: THEME.colors.surfaceElevated,
    padding: 8,
    borderRadius: THEME.radius.sm,
    marginVertical: 8,
  },
  reachEstimateText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  reachEstimateSub: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  launchCampaignBtn: {
    backgroundColor: THEME.colors.sponsoredBadge,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    marginTop: 4,
  },
  launchCampaignBtnActive: {
    backgroundColor: THEME.colors.success,
  },
  launchCampaignBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
