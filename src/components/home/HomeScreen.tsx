// Bhraman - Modern Mobile Home Screen
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Alert 
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { TravelerConstraints, Category, TransportMode, TravelerGroup, MicroItinerary, Place, SupportedLanguage } from '../../types';
import { MUMBAI_BASE_HOTEL, MUMBAI_PLACES } from '../../data/mumbaiPlaces';
import { useApp } from '../../context/AppContext';

interface HomeScreenProps {
  constraints: TravelerConstraints;
  onChangeConstraints: (newConstraints: TravelerConstraints) => void;
  onOpenVoiceTextInput: () => void;
  onBuildExperience: () => void;
  activePlan: MicroItinerary | null;
  onViewActivePlan: () => void;
  onSelectSponsoredPlace: (place: Place) => void;
  onOpenSearch?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  constraints,
  onChangeConstraints,
  onOpenVoiceTextInput,
  onBuildExperience,
  activePlan,
  onViewActivePlan,
  onSelectSponsoredPlace,
  onOpenSearch,
}) => {
  const { activeLanguage, setLanguage, t } = useApp();

  const timeOptions = [
    { label: '30 min', minutes: 30 },
    { label: '1 hr', minutes: 60 },
    { label: '2 hr', minutes: 120 },
    { label: '3 hr', minutes: 180 },
  ];

  const budgetOptions = [500, 1000, 2000, 3000];

  const groupOptions: { key: TravelerGroup; label: string; count: number }[] = [
    { key: 'solo', label: 'Solo', count: 1 },
    { key: 'couple', label: 'Couple', count: 2 },
    { key: 'friends', label: '3 Friends', count: 3 },
    { key: 'family', label: 'Family of 4', count: 4 },
  ];

  const transportModes: { key: TransportMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'walk', label: 'Walk', icon: 'walk' },
    { key: 'bicycle', label: 'Cycle', icon: 'bicycle' },
    { key: 'bike', label: 'Bike', icon: 'speedometer' },
    { key: 'auto', label: 'Auto', icon: 'car-sport' },
    { key: 'cab', label: 'Cab', icon: 'car' },
  ];

  const interestTags: { key: Category; label: string; emoji: string }[] = [
    { key: 'food', label: 'Local Food', emoji: '🍔' },
    { key: 'culture', label: 'Culture', emoji: '🏛️' },
    { key: 'photography', label: 'Photography', emoji: '📸' },
    { key: 'nature', label: 'Nature', emoji: '🌿' },
    { key: 'hidden_gem', label: 'Hidden Gems', emoji: '✨' },
    { key: 'heritage', label: 'Heritage', emoji: '🏰' },
    { key: 'quirky', label: 'Quirky', emoji: '🔮' },
    { key: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
  ];

  const supportedLangs: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'mr', label: 'मराठी' },
    { code: 'gu', label: 'ગુજરાતી' },
  ];

  const sponsoredPlaces = MUMBAI_PLACES.filter(p => p.provenance === 'sponsored');

  const toggleInterest = (cat: Category) => {
    const current = constraints.interests;
    const exists = current.includes(cat);
    const updated = exists ? current.filter(c => c !== cat) : [...current, cat];
    onChangeConstraints({ ...constraints, interests: updated });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Search Bar & Language Selector */}
      <View style={styles.topControlRow}>
        <TouchableOpacity
          style={styles.searchBarBtn}
          onPress={onOpenSearch}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={16} color={THEME.colors.primary} />
          <Text style={styles.searchBarPlaceholder}>
            Search places, gems, communities, creators...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Quick Pills */}
      <View style={styles.langSelectorRow}>
        <Ionicons name="globe-outline" size={14} color={THEME.colors.secondary} />
        <Text style={styles.langLabel}>Lang:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScroll}>
          {supportedLangs.map(l => (
            <TouchableOpacity
              key={l.code}
              style={[styles.langPill, activeLanguage === l.code && styles.langPillActive]}
              onPress={() => setLanguage(l.code)}
              activeOpacity={0.7}
            >
              <Text style={[styles.langPillText, activeLanguage === l.code && styles.langPillTextActive]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroPreTitle}>FROM PLACES → TO PLANS</Text>
        <Text style={styles.heroHeadline}>Discover Beyond the Obvious</Text>
        <Text style={styles.heroSubtitle}>
          Tell us where you are, what you want, and how much time you have. We'll build what's realistically possible right now.
        </Text>

        {/* DUAL VOICE / TEXT PROMINENT TRIGGER */}
        <View style={styles.dualInputTriggerRow}>
          <TouchableOpacity
            style={styles.voiceTriggerBtn}
            onPress={onOpenVoiceTextInput}
            activeOpacity={0.8}
          >
            <View style={styles.voiceIconCircle}>
              <Ionicons name="mic" size={18} color="#FFF" />
            </View>
            <View style={styles.triggerTextCol}>
              <Text style={styles.triggerTitle}>Speak Your Plan</Text>
              <Text style={styles.triggerSubtitle}>"3 friends, 3h, Bandra, ₹3000..."</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.textTriggerBtn}
            onPress={onOpenVoiceTextInput}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={18} color={THEME.colors.primary} />
            <Text style={styles.textTriggerTitle}>Type / Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Plan Banner (If already built) */}
      {activePlan && (
        <TouchableOpacity
          style={styles.activePlanBanner}
          onPress={onViewActivePlan}
          activeOpacity={0.8}
        >
          <View style={styles.activePlanLeft}>
            <View style={styles.activePlanDot} />
            <View>
              <Text style={styles.activePlanTitle}>
                Active: {activePlan.stops.length}-Stop Mumbai Plan
              </Text>
              <Text style={styles.activePlanMeta}>
                ₹{activePlan.totalCost} • {Math.floor(activePlan.totalTimeMinutes / 60)}h {activePlan.totalTimeMinutes % 60}m • {activePlan.safetyBufferMinutes}m buffer
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={18} color={THEME.colors.primary} />
        </TouchableOpacity>
      )}

      {/* Structured Constraints Card */}
      <View style={styles.constraintsCard}>
        <Text style={styles.cardHeaderTitle}>STRUCTURED TRAVELER SETUP</Text>

        {/* 1. Base Location */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>📍 Starting Base</Text>
          <View style={styles.baseLocationBox}>
            <Ionicons name="business" size={16} color={THEME.colors.primary} />
            <Text style={styles.baseLocationText}>{constraints.baseLocation.name}</Text>
          </View>
        </View>

        {/* 2. Available Time */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>⏱️ Available Time</Text>
            <Text style={styles.sectionValueHighlight}>
              {Math.floor(constraints.availableMinutes / 60)}h {constraints.availableMinutes % 60}m
            </Text>
          </View>
          <View style={styles.chipRow}>
            {timeOptions.map(opt => (
              <TouchableOpacity
                key={opt.minutes}
                style={[
                  styles.chipBtn,
                  constraints.availableMinutes === opt.minutes && styles.chipBtnActive,
                ]}
                onPress={() => onChangeConstraints({ ...constraints, availableMinutes: opt.minutes })}
              >
                <Text
                  style={[
                    styles.chipBtnText,
                    constraints.availableMinutes === opt.minutes && styles.chipBtnTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. Budget */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>💰 Total Budget</Text>
            <Text style={styles.sectionValueHighlight}>₹{constraints.budget.toLocaleString()}</Text>
          </View>
          <View style={styles.chipRow}>
            {budgetOptions.map(val => (
              <TouchableOpacity
                key={val}
                style={[styles.chipBtn, constraints.budget === val && styles.chipBtnActive]}
                onPress={() => onChangeConstraints({ ...constraints, budget: val })}
              >
                <Text style={[styles.chipBtnText, constraints.budget === val && styles.chipBtnTextActive]}>
                  ₹{val.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. Group */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>👥 Who's Traveling?</Text>
            <Text style={styles.sectionValueHighlight}>
              {constraints.groupSize} {constraints.groupSize === 1 ? 'Person' : 'People'}
            </Text>
          </View>
          <View style={styles.chipRow}>
            {groupOptions.map(g => (
              <TouchableOpacity
                key={g.key}
                style={[
                  styles.chipBtn,
                  constraints.groupType === g.key && styles.chipBtnActive,
                ]}
                onPress={() =>
                  onChangeConstraints({
                    ...constraints,
                    groupType: g.key,
                    groupSize: g.count,
                  })
                }
              >
                <Text
                  style={[
                    styles.chipBtnText,
                    constraints.groupType === g.key && styles.chipBtnTextActive,
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. Transport Mode */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>🛵 Transport (Shapes Reachability)</Text>
          <View style={styles.transportGrid}>
            {transportModes.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.transportCard,
                  constraints.transportMode === t.key && styles.transportCardActive,
                ]}
                onPress={() => onChangeConstraints({ ...constraints, transportMode: t.key })}
              >
                <Ionicons
                  name={t.icon}
                  size={20}
                  color={constraints.transportMode === t.key ? '#FFF' : THEME.colors.textMuted}
                />
                <Text
                  style={[
                    styles.transportCardText,
                    constraints.transportMode === t.key && styles.transportCardTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 6. Interests */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>🎯 What Are You In The Mood For?</Text>
          <View style={styles.interestsWrap}>
            {interestTags.map(item => {
              const isSelected = constraints.interests.includes(item.key);
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.interestPill, isSelected && styles.interestPillActive]}
                  onPress={() => toggleInterest(item.key)}
                >
                  <Text style={styles.interestEmoji}>{item.emoji}</Text>
                  <Text style={[styles.interestText, isSelected && styles.interestTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* PRIMARY CTA */}
        <TouchableOpacity
          style={styles.buildCtaBtn}
          onPress={onBuildExperience}
          activeOpacity={0.85}
        >
          <Text style={styles.buildCtaText}>BUILD MY EXPERIENCE</Text>
          <Ionicons name="sparkles" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* DISTINCT SPONSORED SECTION */}
      <View style={styles.sponsoredSection}>
        <View style={styles.sponsoredHeaderRow}>
          <View>
            <View style={styles.sponsoredBadgeRow}>
              <View style={styles.sponsoredTag}>
                <Text style={styles.sponsoredTagText}>SPONSORED</Text>
              </View>
              <Text style={styles.sponsoredSectionTitle}>Places Worth Knowing</Text>
            </View>
            <Text style={styles.sponsoredDisclaimer}>
              Paid placements clearly identified. Businesses can buy visibility; they cannot buy relevance.
            </Text>
          </View>
        </View>

        {sponsoredPlaces.map(spon => (
          <TouchableOpacity
            key={spon.id}
            style={styles.sponsoredCard}
            onPress={() => onSelectSponsoredPlace(spon)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: spon.imageUrl }} style={styles.sponImg} />
            <View style={styles.sponContent}>
              <View style={styles.sponBadgeRow}>
                <Text style={styles.sponBadgeText}>SPONSORED PARTNER</Text>
                <Text style={styles.sponRating}>★ {spon.rating}</Text>
              </View>
              <Text style={styles.sponName}>{spon.name}</Text>
              <Text style={styles.sponDesc} numberOfLines={2}>{spon.description}</Text>
              <Text style={styles.sponCost}>~₹{spon.averageCostPerPerson} • {spon.neighborhood}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 70 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.md,
  },
  topControlRow: {
    paddingTop: THEME.spacing.sm,
    marginBottom: 6,
  },
  searchBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  searchBarPlaceholder: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    flex: 1,
  },
  langSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    paddingVertical: 2,
  },
  langLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
  },
  langScroll: {
    gap: 6,
    alignItems: 'center',
  },
  langPill: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  langPillActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.secondary,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  langPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  heroSection: {
    paddingVertical: THEME.spacing.sm,
  },
  heroPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 1.5,
  },
  heroHeadline: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  dualInputTriggerRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: THEME.spacing.md,
  },
  voiceTriggerBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radius.lg,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    gap: 10,
  },
  voiceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerTextCol: {
    flex: 1,
  },
  triggerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  triggerSubtitle: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  textTriggerBtn: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 4,
  },
  textTriggerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  activePlanBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 81, 0, 0.12)',
    padding: 12,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    marginBottom: THEME.spacing.md,
  },
  activePlanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activePlanDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.success,
  },
  activePlanTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  activePlanMeta: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  constraintsCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.md,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: THEME.spacing.sm,
  },
  sectionBlock: {
    marginBottom: THEME.spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionValueHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  baseLocationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    padding: 10,
    borderRadius: THEME.radius.md,
    gap: 8,
  },
  baseLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chipBtn: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingVertical: 8,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  chipBtnActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipBtnText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  chipBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  transportGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  transportCard: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingVertical: 8,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  transportCardActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  transportCardText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  transportCardTextActive: {
    color: '#FFF',
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 4,
  },
  interestPillActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.secondary,
  },
  interestEmoji: {
    fontSize: 12,
  },
  interestText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  interestTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  buildCtaBtn: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: THEME.radius.lg,
    gap: 8,
    marginTop: THEME.spacing.sm,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buildCtaText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sponsoredSection: {
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  sponsoredHeaderRow: {
    marginBottom: 8,
  },
  sponsoredBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sponsoredTag: {
    backgroundColor: THEME.colors.sponsoredBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  sponsoredTagText: {
    color: '#C4B5FD',
    fontSize: 9,
    fontWeight: '800',
  },
  sponsoredSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  sponsoredDisclaimer: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  sponsoredCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 10,
    alignItems: 'center',
  },
  sponImg: {
    width: 65,
    height: 65,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  sponContent: {
    flex: 1,
  },
  sponBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sponBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.colors.sponsoredBadge,
  },
  sponRating: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.accent,
  },
  sponName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  sponDesc: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  sponCost: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    marginTop: 3,
  },
});
