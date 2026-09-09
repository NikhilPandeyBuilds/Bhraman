// Bhraman - Real Traveler Profile, Roles & Reputation View
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

interface ProfileViewProps {
  onSwitchToProvider: () => void;
  onOpenAuthModal: () => void;
  savedPlanCount?: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onSwitchToProvider,
  onOpenAuthModal,
  savedPlanCount = 0,
}) => {
  const { 
    user, 
    logout, 
    userDiscoveries, 
    joinedCommunityIds, 
    savedState,
    activeLanguage,
    setLanguage
  } = useApp();

  const totalSavedCount = savedState.placeIds.length + savedState.discoveryIds.length + savedState.itineraries.length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Real Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
          )}

          <View style={styles.profileMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name || 'Explorer'}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{user?.reputation?.level || 'Lvl 1 Pioneer'}</Text>
              </View>
            </View>
            <Text style={styles.userEmail}>{user?.email || 'authenticated@bhraman.app'}</Text>
            <Text style={styles.userPoints}>⭐ {user?.reputation?.points || 150} Explorer Points</Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={onOpenAuthModal}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={18} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {user?.bio && (
          <Text style={styles.bioText}>"{user.bio}"</Text>
        )}

        {/* User Roles (Non-Exclusive, Section 4) */}
        <View style={styles.rolesRow}>
          <Text style={styles.rolesLabel}>Active Roles:</Text>
          {(user?.roles || ['traveler', 'contributor']).map(role => (
            <View key={role} style={styles.roleChip}>
              <Text style={styles.roleChipText}>
                {role === 'traveler' ? '🎒 Traveler' :
                 role === 'contributor' ? '📍 Local Contributor' :
                 role === 'creator' ? '⭐ Creator' :
                 role === 'community_organizer' ? '🤝 Organizer' : '🏢 Provider'}
              </Text>
            </View>
          ))}
        </View>

        {/* Languages & Home City */}
        <View style={styles.locationLangRow}>
          <View style={styles.infoMetaPill}>
            <Ionicons name="location-outline" size={13} color={THEME.colors.primary} />
            <Text style={styles.infoMetaText}>{user?.homeCity || 'Mumbai, MH'}</Text>
          </View>
          <View style={styles.infoMetaPill}>
            <Ionicons name="globe-outline" size={13} color={THEME.colors.secondary} />
            <Text style={styles.infoMetaText}>
              {(user?.languagesSpoken || ['English', 'Hindi']).join(' • ')}
            </Text>
          </View>
        </View>

        {/* Real Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{userDiscoveries.length}</Text>
            <Text style={styles.statLbl}>Discoveries</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{joinedCommunityIds.length}</Text>
            <Text style={styles.statLbl}>Communities</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalSavedCount}</Text>
            <Text style={styles.statLbl}>Saved Items</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{user?.reputation?.points || 150}</Text>
            <Text style={styles.statLbl}>Points</Text>
          </View>
        </View>

        {/* Account Action Buttons */}
        <View style={styles.accountActionRow}>
          <TouchableOpacity
            style={styles.authActionBtn}
            onPress={onOpenAuthModal}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={16} color={THEME.colors.primary} />
            <Text style={styles.authActionText}>Edit Profile / Switch Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              Alert.alert(
                "Sign Out",
                "Are you sure you want to sign out of this session?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Sign Out", style: "destructive", onPress: logout }
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={16} color={THEME.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Switch to Business / Provider Mode */}
      <TouchableOpacity
        style={styles.providerModeCard}
        onPress={onSwitchToProvider}
        activeOpacity={0.8}
      >
        <View style={styles.providerIconWrap}>
          <Ionicons name="storefront-outline" size={22} color={THEME.colors.primary} />
        </View>
        <View style={styles.providerInfoWrap}>
          <Text style={styles.providerModeTitle}>Switch to Provider / Business Mode</Text>
          <Text style={styles.providerModeSub}>
            Merchant analytics, traveler demand heatmaps & sponsored campaign simulator.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
      </TouchableOpacity>

      {/* Explorer Badges & Reputation */}
      <Text style={styles.sectionTitle}>EXPLORER BADGES & REPUTATION (VERIFIED)</Text>
      <View style={styles.badgesContainer}>
        {(user?.reputation?.badges || ['Pioneer Explorer', 'Hidden Gem Scout', 'Active Contributor']).map(badgeName => (
          <View key={badgeName} style={styles.badgeItem}>
            <View style={styles.badgeIconWrap}>
              <Ionicons name="ribbon-outline" size={16} color={THEME.colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.badgeName}>{badgeName}</Text>
              <Text style={styles.badgeDesc}>
                Earned by discovering authentic spots and community participation
              </Text>
            </View>
            <View style={styles.verifiedTag}>
              <Ionicons name="checkmark-circle" size={12} color={THEME.colors.success} />
              <Text style={styles.verifiedTagText}>Earned</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Product Principles & Provenance Notice */}
      <View style={styles.infoNoticeCard}>
        <View style={styles.infoTitleRow}>
          <Ionicons name="shield-checkmark" size={16} color={THEME.colors.primary} />
          <Text style={styles.infoTitle}>HackCelestial 3.0 • PS6 Local & Experiences</Text>
        </View>
        <Text style={styles.infoBody}>
          Bhraman connects real local contributors with travelers. Discoveries you share contribute candidates to our time-based reachability engine.
        </Text>
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
  profileCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  profileMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  levelBadge: {
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },
  userEmail: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  userPoints: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginTop: 3,
  },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  bioText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 16,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  rolesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
  },
  roleChip: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  locationLangRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  infoMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.sm,
  },
  infoMetaText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
  },
  accountActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  authActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surfaceElevated,
    paddingVertical: 8,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  authActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: THEME.radius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.success,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.md,
    padding: 10,
    marginTop: 12,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  statLbl: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  providerModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.md,
    gap: 10,
  },
  providerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInfoWrap: {
    flex: 1,
  },
  providerModeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  providerModeSub: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: THEME.spacing.xs,
  },
  badgesContainer: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.md,
    gap: 8,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  badgeIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 137, 123, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  badgeDesc: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  infoNoticeCard: {
    backgroundColor: THEME.colors.surfaceElevated,
    padding: 12,
    borderRadius: THEME.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  infoBody: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    lineHeight: 14,
  },
});
