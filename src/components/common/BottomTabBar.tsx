// Bhraman - Native Mobile Bottom Tab Bar (Strictly Section 38 Architecture)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

export type TabScreen = 'home' | 'explore' | 'communities' | 'saved' | 'profile';

interface BottomTabBarProps {
  activeTab: TabScreen;
  onSelectTab: (tab: TabScreen) => void;
  hasActivePlan: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  hasActivePlan,
}) => {
  const { t } = useApp();

  const tabs: { key: TabScreen; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap; badge?: boolean }[] = [
    { key: 'home', label: t('navHome') || 'Home', icon: 'compass-outline', activeIcon: 'compass' },
    { key: 'explore', label: t('navExplore') || 'Explore', icon: 'map-outline', activeIcon: 'map' },
    { key: 'communities', label: t('navCommunity') || 'Community', icon: 'people-outline', activeIcon: 'people' },
    { key: 'saved', label: t('navSaved') || 'Saved', icon: 'bookmark-outline', activeIcon: 'bookmark', badge: hasActivePlan },
    { key: 'profile', label: t('navProfile') || 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={21}
                color={isActive ? THEME.colors.primary : THEME.colors.textMuted}
              />
              {tab.badge && tab.key === 'saved' && (
                <View style={styles.activePlanDot} />
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
    paddingVertical: 7,
    paddingBottom: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    position: 'relative',
    padding: 2,
  },
  activePlanDot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.colors.success,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: THEME.colors.textMuted,
  },
});
