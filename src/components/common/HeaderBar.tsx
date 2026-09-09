// Bhraman - Responsive Header & Desktop Navigation Bar
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { TrafficCondition, WeatherCondition } from '../../types';
import { TabScreen } from './BottomTabBar';
import { useApp } from '../../context/AppContext';

interface HeaderBarProps {
  currentCity?: string;
  neighborhood?: string;
  traffic: TrafficCondition;
  weather: WeatherCondition;
  onOpenDemoDock: () => void;
  isDemoDockOpen: boolean;
  activeTab?: TabScreen;
  onSelectTab?: (tab: TabScreen) => void;
  hasActivePlan?: boolean;
  onOpenSearch?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentCity = "Mumbai",
  neighborhood = "Bandra West",
  traffic,
  weather,
  onOpenDemoDock,
  isDemoDockOpen,
  activeTab = 'home',
  onSelectTab,
  hasActivePlan = false,
  onOpenSearch,
}) => {
  const { width } = useWindowDimensions();
  const { t } = useApp();
  const isDesktop = width >= 860;
  const isTablet = width >= 640 && width < 860;

  const navItems: { key: TabScreen; label: string; icon: keyof typeof Ionicons.glyphMap; badge?: boolean }[] = [
    { key: 'home', label: t('navHome') || 'Home', icon: 'compass-outline' },
    { key: 'explore', label: t('navExplore') || 'Explore', icon: 'map-outline' },
    { key: 'communities', label: t('navCommunity') || 'Community', icon: 'people-outline' },
    { key: 'saved', label: t('navSaved') || 'Saved', icon: 'bookmark-outline', badge: hasActivePlan },
    { key: 'profile', label: t('navProfile') || 'Profile', icon: 'person-outline' },
  ];

  // Wide Desktop & Laptop Layout
  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        <View style={styles.desktopInner}>
          {/* Brand Left */}
          <TouchableOpacity 
            style={styles.brandGroup}
            onPress={() => onSelectTab && onSelectTab('home')}
            activeOpacity={0.8}
          >
            <View style={styles.titleWithBadge}>
              <Text style={styles.brandTitle}>BHRAMAN</Text>
              <View style={styles.hackathonBadge}>
                <Text style={styles.hackathonText}>PS6</Text>
              </View>
            </View>
            <Text style={styles.brandTagline}>From Places → To Plans</Text>
          </TouchableOpacity>

          {/* Center Navigation Links */}
          <View style={styles.desktopNavLinks}>
            {navItems.map(item => {
              const isActive = activeTab === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.desktopNavItem, isActive && styles.desktopNavItemActive]}
                  onPress={() => onSelectTab && onSelectTab(item.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={isActive ? THEME.colors.primary : THEME.colors.textSecondary}
                  />
                  <Text style={[styles.desktopNavText, isActive && styles.desktopNavTextActive]}>
                    {item.label}
                  </Text>
                  {item.badge && item.key === 'saved' && (
                    <View style={styles.navBadgeDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Right Status Badges & Demo Trigger */}
          <View style={styles.desktopRightGroup}>
            {onOpenSearch && (
              <TouchableOpacity
                style={styles.searchQuickBtn}
                onPress={onOpenSearch}
                activeOpacity={0.8}
              >
                <Ionicons name="search" size={15} color={THEME.colors.textSecondary} />
                <Text style={styles.searchQuickText}>Search...</Text>
              </TouchableOpacity>
            )}

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

            <TouchableOpacity 
              style={[styles.demoTriggerBtn, isDemoDockOpen && styles.demoTriggerBtnActive]}
              onPress={onOpenDemoDock}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={isDemoDockOpen ? "flash" : "flash-outline"} 
                size={14} 
                color={isDemoDockOpen ? '#FFF' : THEME.colors.primary} 
              />
              <Text style={[styles.demoTriggerText, isDemoDockOpen && styles.demoTriggerTextActive]}>
                Demo Dock
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Tablet Layout (640px to 860px)
  if (isTablet) {
    return (
      <View style={styles.tabletContainer}>
        <View style={styles.brandRow}>
          <TouchableOpacity 
            style={styles.brandGroup}
            onPress={() => onSelectTab && onSelectTab('home')}
            activeOpacity={0.8}
          >
            <View style={styles.titleWithBadge}>
              <Text style={styles.brandTitle}>BHRAMAN</Text>
              <View style={styles.hackathonBadge}>
                <Text style={styles.hackathonText}>PS6</Text>
              </View>
            </View>
            <Text style={styles.brandTagline}>From Places → To Plans</Text>
          </TouchableOpacity>

          <View style={styles.tabletRightGroup}>
            <View style={styles.locationChip}>
              <Ionicons name="location-sharp" size={12} color={THEME.colors.primary} />
              <Text style={styles.locationText}>{neighborhood}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.demoTriggerBtn, isDemoDockOpen && styles.demoTriggerBtnActive]}
              onPress={onOpenDemoDock}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={isDemoDockOpen ? "flash" : "flash-outline"} 
                size={14} 
                color={isDemoDockOpen ? '#FFF' : THEME.colors.primary} 
              />
              <Text style={[styles.demoTriggerText, isDemoDockOpen && styles.demoTriggerTextActive]}>
                Demo Dock
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tablet Navigation Tabs */}
        {onSelectTab && (
          <View style={styles.tabletNavRow}>
            {navItems.map(item => {
              const isActive = activeTab === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.tabletNavItem, isActive && styles.tabletNavItemActive]}
                  onPress={() => onSelectTab(item.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={15}
                    color={isActive ? THEME.colors.primary : THEME.colors.textSecondary}
                  />
                  <Text style={[styles.tabletNavText, isActive && styles.tabletNavTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  // Mobile Layout (< 640px) — Identical to existing mobile header
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
  // Mobile Header Styles
  container: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  // Desktop Header Styles
  desktopContainer: {
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    width: '100%',
    zIndex: 100,
  },
  desktopInner: {
    maxWidth: 1380,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  desktopNavLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  desktopNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.radius.md,
    position: 'relative',
  },
  desktopNavItemActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderBottomWidth: 2,
    borderBottomColor: THEME.colors.primary,
  },
  desktopNavText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  desktopNavTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  navBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
    position: 'absolute',
    top: 6,
    right: 8,
  },
  desktopRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchQuickText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  // Tablet Header Styles
  tabletContainer: {
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  tabletRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tabletNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
  },
  tabletNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.sm,
  },
  tabletNavItemActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  tabletNavText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  tabletNavTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  // Shared Brand Styles
  brandGroup: {
    justifyContent: 'center',
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
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
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
    backgroundColor: THEME.colors.background,
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
