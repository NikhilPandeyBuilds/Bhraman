// Bhraman - Real Communities, Creators, Events & Multilingual Discoveries Screen
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  TextInput,
  Alert,
  useWindowDimensions
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { DEMO_CREATORS } from '../../data/creatorsAndCommunities';
import { SupportedLanguage } from '../../types';

interface CommunityViewProps {
  onOpenCreateCommunity: () => void;
  onOpenShareDiscovery: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ 
  onOpenCreateCommunity,
  onOpenShareDiscovery,
}) => {
  const { 
    discoveries, 
    communities, 
    joinedCommunityIds, 
    joinCommunity, 
    leaveCommunity, 
    userRsvps, 
    toggleEventRsvp, 
    toggleSave,
    savedState,
    activeLanguage,
    translateText,
    followedCreatorIds,
    toggleFollowCreator
  } = useApp();

  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [activeSection, setActiveSection] = useState<'feed' | 'communities' | 'creators'>('feed');
  const [translatedMap, setTranslatedMap] = useState<Record<string, boolean>>({});
  const [communitySearch, setCommunitySearch] = useState('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('all');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const toggleTranslate = (discId: string) => {
    setTranslatedMap(prev => ({ ...prev, [discId]: !prev[discId] }));
  };

  const toggleLike = (discId: string) => {
    setLikedMap(prev => ({ ...prev, [discId]: !prev[discId] }));
  };

  // Filtered communities
  const filteredCommunities = communities.filter(c => {
    const matchesSearch = !communitySearch.trim() || 
      c.name.toLowerCase().includes(communitySearch.toLowerCase()) || 
      c.tagline.toLowerCase().includes(communitySearch.toLowerCase());
    const matchesLang = selectedLanguageFilter === 'all' || c.primaryLanguage === selectedLanguageFilter;
    return matchesSearch && matchesLang;
  });

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Action Header & Sub-Nav Switcher */}
        <View style={styles.topActionBar}>
          <View style={styles.subNavBar}>
            <TouchableOpacity
              style={[styles.subNavItem, activeSection === 'feed' && styles.subNavItemActive]}
              onPress={() => setActiveSection('feed')}
            >
              <Text style={[styles.subNavText, activeSection === 'feed' && styles.subNavTextActive]}>
                Discoveries ({discoveries.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subNavItem, activeSection === 'communities' && styles.subNavItemActive]}
              onPress={() => setActiveSection('communities')}
            >
              <Text style={[styles.subNavText, activeSection === 'communities' && styles.subNavTextActive]}>
                Communities ({communities.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subNavItem, activeSection === 'creators' && styles.subNavItemActive]}
              onPress={() => setActiveSection('creators')}
            >
              <Text style={[styles.subNavText, activeSection === 'creators' && styles.subNavTextActive]}>
                Creators
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons to Share / Create */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionPillBtn}
              onPress={onOpenShareDiscovery}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={14} color="#FFF" />
              <Text style={styles.actionPillText}>+ Share Discovery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionPillBtn, { backgroundColor: THEME.colors.secondary }]}
              onPress={onOpenCreateCommunity}
              activeOpacity={0.8}
            >
              <Ionicons name="people" size={14} color="#FFF" />
              <Text style={styles.actionPillText}>+ Create Community</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {/* 1. LOCAL DISCOVERIES FEED */}
          {activeSection === 'feed' && (
            <View style={styles.feedSection}>
              <Text style={styles.feedHeaderNote}>
                Raw local discoveries posted by Mumbai residents. Tap "Translate" to read in your language.
              </Text>

              <View style={[styles.gridContainer, isDesktop && styles.gridContainerDesktop]}>
                {discoveries.map(discovery => {
                  const isLiked = !!likedMap[discovery.id];
                  const isSaved = savedState.discoveryIds.includes(discovery.id);
                  const isTranslated = !!translatedMap[discovery.id];
                  const displayDesc = isTranslated
                    ? translateText(discovery.description, discovery.originalLanguage || 'en')
                    : discovery.description;

                  return (
                    <View key={discovery.id} style={[styles.discoveryCard, isDesktop && styles.desktopGridCard]}>
                  {/* Creator Header */}
                  <View style={styles.discoveryCardHeader}>
                    <View style={styles.creatorMetaRow}>
                      <View style={styles.creatorAvatarPlaceholder}>
                        <Text style={styles.creatorInitials}>
                          {(discovery.creatorName || 'Scout').slice(0, 1)}
                        </Text>
                      </View>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={styles.discoveryCreatorName}>{discovery.creatorName || 'Local Scout'}</Text>
                          {discovery.isUserCreated && (
                            <View style={styles.youBadge}><Text style={styles.youBadgeText}>YOU</Text></View>
                          )}
                        </View>
                        <Text style={styles.discoveryCommunityTag}>
                          {discovery.neighborhood || 'Mumbai'} • {discovery.category.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Provenance and Language Badges */}
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <View style={[styles.langProvenanceTag, discovery.isDemoData ? styles.demoBadge : styles.userContributedBadge]}>
                        <Text style={[styles.langProvenanceText, discovery.isDemoData ? styles.demoBadgeText : styles.userBadgeText]}>
                          {discovery.isDemoData ? 'SEEDED DEMO' : 'USER CONTRIBUTED'}
                        </Text>
                      </View>
                      <View style={styles.langProvenanceTag}>
                        <Text style={styles.langProvenanceText}>
                          Original: {(discovery.originalLanguage || 'en').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Discovery Image */}
                  <Image source={{ uri: discovery.imageUrl }} style={styles.discoveryImage} />

                  {/* Content */}
                  <View style={styles.discoveryContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.discoveryTitle}>{discovery.title}</Text>
                      <TouchableOpacity
                        style={styles.translateToggleBtn}
                        onPress={() => toggleTranslate(discovery.id)}
                      >
                        <Ionicons name="language" size={13} color={THEME.colors.primary} />
                        <Text style={styles.translateToggleText}>
                          {isTranslated ? 'Original' : 'Translate'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Description (Translated or Original) */}
                    <Text style={styles.discoveryDesc}>{displayDesc}</Text>

                    {/* Local Insider Tip if present */}
                    {discovery.localTip && (
                      <View style={styles.tipBox}>
                        <Ionicons name="bulb" size={12} color={THEME.colors.accent} />
                        <Text style={styles.tipText}>
                          <Text style={{ fontWeight: '700' }}>Insider Tip: </Text>
                          {discovery.localTip}
                        </Text>
                      </View>
                    )}

                    {/* Actions Row */}
                    <View style={styles.discoveryActions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => toggleLike(discovery.id)}
                      >
                        <Ionicons
                          name={isLiked ? "heart" : "heart-outline"}
                          size={18}
                          color={isLiked ? THEME.colors.danger : THEME.colors.textMuted}
                        />
                        <Text style={styles.actionCount}>
                          {discovery.likesCount + (isLiked ? 1 : 0)}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.actionBtn}>
                        <Ionicons name="chatbubble-outline" size={16} color={THEME.colors.textMuted} />
                        <Text style={styles.actionCount}>{discovery.commentsCount}</Text>
                      </View>

                      <View style={{ flex: 1 }} />

                      <TouchableOpacity
                        style={styles.saveActionBtn}
                        onPress={() => toggleSave('discovery', discovery.id)}
                      >
                        <Ionicons
                          name={isSaved ? "bookmark" : "bookmark-outline"}
                          size={16}
                          color={isSaved ? THEME.colors.primary : THEME.colors.textMuted}
                        />
                        <Text style={[styles.saveActionText, isSaved && { color: THEME.colors.primary }]}>
                          {isSaved ? 'Saved' : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
            </View>
          </View>
        )}

        {/* 2. COMMUNITIES TAB */}
        {activeSection === 'communities' && (
          <View style={styles.communitiesSection}>
            {/* Search & Language Filter */}
            <View style={styles.communitySearchRow}>
              <Ionicons name="search" size={14} color={THEME.colors.textMuted} />
              <TextInput
                style={styles.communitySearchInput}
                value={communitySearch}
                onChangeText={setCommunitySearch}
                placeholder="Search communities (e.g. Night, Nature, Food)..."
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>

            {/* Language filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {['all', 'mr', 'hi', 'en', 'gu'].map(l => (
                <TouchableOpacity
                  key={l}
                  style={[styles.langFilterPill, selectedLanguageFilter === l && styles.langFilterPillActive]}
                  onPress={() => setSelectedLanguageFilter(l)}
                >
                  <Text style={[styles.langFilterText, selectedLanguageFilter === l && styles.langFilterTextActive]}>
                    {l === 'all' ? 'All Languages' : l.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[styles.gridContainer, isDesktop && styles.gridContainerDesktop]}>
            {filteredCommunities.map(comm => {
              const isJoined = joinedCommunityIds.includes(comm.id);
              const hasEvent = !!comm.upcomingEvent;
              const isRsvpd = hasEvent && userRsvps.includes(comm.upcomingEvent!.id);

              return (
                <View key={comm.id} style={[styles.communityCard, isDesktop && styles.desktopGridCard]}>
                  <Image source={{ uri: comm.coverImage }} style={styles.commCover} />
                  <View style={styles.commDetails}>
                    <View style={styles.commHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={styles.commName}>{comm.name}</Text>
                          <View style={[styles.langProvenanceTag, comm.isDemoData ? styles.demoBadge : styles.userContributedBadge]}>
                            <Text style={[styles.langProvenanceText, comm.isDemoData ? styles.demoBadgeText : styles.userBadgeText]}>
                              {comm.isDemoData ? 'DEMO COMMUNITY' : 'USER COMMUNITY'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.commLangTag}>
                          Primary Language: {(comm.primaryLanguage || 'en').toUpperCase()} • {comm.location || 'Mumbai'}
                        </Text>
                      </View>

                      {/* Real Join / Leave Button */}
                      <TouchableOpacity
                        style={[styles.joinBtn, isJoined && styles.joinBtnActive]}
                        onPress={() => {
                          if (isJoined) leaveCommunity(comm.id);
                          else joinCommunity(comm.id);
                        }}
                      >
                        <Text style={[styles.joinBtnText, isJoined && styles.joinBtnTextActive]}>
                          {isJoined ? '✓ Joined' : '+ Join'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.commTagline}>{comm.tagline}</Text>
                    <Text style={styles.commDesc}>{comm.description}</Text>

                    {/* Community Rules if specified */}
                    {comm.rules && (
                      <Text style={styles.commRulesText}>
                        Rules: {comm.rules.split('\n')[0]}
                      </Text>
                    )}

                    {/* Upcoming Event */}
                    {hasEvent && (
                      <View style={styles.upcomingEventCard}>
                        <View style={styles.eventHeaderRow}>
                          <View style={styles.eventBadge}>
                            <Ionicons name="calendar-outline" size={11} color="#FFF" />
                            <Text style={styles.eventBadgeText}>Upcoming Session</Text>
                          </View>
                          <Text style={styles.eventFee}>
                            {comm.upcomingEvent!.fee === 0 ? 'Free' : `₹${comm.upcomingEvent!.fee}`}
                          </Text>
                        </View>

                        <Text style={styles.eventTitle}>{comm.upcomingEvent!.title}</Text>
                        <Text style={styles.eventTimeMeeting}>
                          🗓️ {comm.upcomingEvent!.dateText} at {comm.upcomingEvent!.timeText}
                        </Text>
                        <Text style={styles.eventMeetingPoint}>
                          📍 {comm.upcomingEvent!.meetingPoint}
                        </Text>

                        {/* Real RSVP Button */}
                        <TouchableOpacity
                          style={[styles.rsvpBtn, isRsvpd && styles.rsvpBtnActive]}
                          onPress={() => toggleEventRsvp(comm.upcomingEvent!.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.rsvpBtnText, isRsvpd && styles.rsvpBtnTextActive]}>
                            {isRsvpd ? '✓ RSVP Confirmed (In Saved)' : 'REQUEST TO JOIN (RSVP)'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
            </View>
          </View>
        )}

        {/* 3. CREATORS TAB */}
        {activeSection === 'creators' && (
          <View style={styles.creatorsSection}>
            <Text style={styles.creatorSectionDesc}>
              Any local explorer can become a creator by contributing discoveries and guiding communities.
            </Text>

            <View style={[styles.gridContainer, isDesktop && styles.gridContainerDesktop]}>
            {DEMO_CREATORS.map(creator => {
              const isFollowed = followedCreatorIds.includes(creator.id);
              return (
                <View key={creator.id} style={[styles.creatorCard, isDesktop && styles.desktopGridCard]}>
                  <View style={styles.creatorHeader}>
                    <Image source={{ uri: creator.avatarUrl }} style={styles.creatorAvatar} />
                    <View style={styles.creatorMainInfo}>
                      <View style={styles.creatorNameRow}>
                        <Text style={styles.creatorName}>{creator.name}</Text>
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelText}>Lvl {creator.level}</Text>
                        </View>
                        <View style={[styles.langProvenanceTag, styles.demoBadge]}>
                          <Text style={[styles.langProvenanceText, styles.demoBadgeText]}>DEMO CREATOR</Text>
                        </View>
                      </View>
                      <Text style={styles.creatorHandle}>{creator.handle}</Text>
                      <Text style={styles.creatorCommunitySub}>
                        Organizes: {creator.communityName}
                      </Text>
                    </View>

                    {/* Follow Button */}
                    <TouchableOpacity
                      style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                      onPress={() => toggleFollowCreator(creator.id)}
                    >
                      <Text style={[styles.followBtnText, isFollowed && styles.followBtnTextActive]}>
                        {isFollowed ? 'Following' : '+ Follow'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.creatorBio}>{creator.bio}</Text>

                  {/* Stats Bar */}
                  <View style={styles.creatorStatsBar}>
                    <View style={styles.creatorStatCol}>
                      <Text style={styles.creatorStatVal}>{creator.explorerPoints}</Text>
                      <Text style={styles.creatorStatLbl}>Explorer Pts</Text>
                    </View>
                    <View style={styles.creatorStatCol}>
                      <Text style={styles.creatorStatVal}>{creator.discoveriesCount}</Text>
                      <Text style={styles.creatorStatLbl}>Discoveries</Text>
                    </View>
                    <View style={styles.creatorStatCol}>
                      <Text style={styles.creatorStatVal}>{creator.reputationPercentage}%</Text>
                      <Text style={styles.creatorStatLbl}>Trust Score</Text>
                    </View>
                  </View>
                </View>
              );
            })}
            </View>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    width: '100%',
    maxWidth: 1360,
    alignSelf: 'center',
    flex: 1,
  },
  gridContainer: {
    width: '100%',
  },
  gridContainerDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },
  desktopGridCard: {
    width: '48.8%',
    minWidth: 350,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  topActionBar: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    gap: 8,
  },
  subNavBar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  subNavItem: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: THEME.radius.sm,
  },
  subNavItemActive: {
    backgroundColor: THEME.colors.primary,
  },
  subNavText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  subNavTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 7,
    borderRadius: THEME.radius.full,
    gap: 6,
  },
  actionPillText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
  },
  feedSection: {
    marginTop: THEME.spacing.xs,
  },
  feedHeaderNote: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
  },
  discoveryCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  discoveryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  creatorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  creatorAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorInitials: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  discoveryCreatorName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  youBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  youBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800',
  },
  discoveryCommunityTag: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  langProvenanceTag: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  langProvenanceText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.secondary,
  },
  demoBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.4)',
  },
  demoBadgeText: {
    color: THEME.colors.textMuted,
    fontWeight: '700',
  },
  userContributedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  userBadgeText: {
    color: THEME.colors.success,
    fontWeight: '700',
  },
  discoveryImage: {
    width: '100%',
    height: 180,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  discoveryContent: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  discoveryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  translateToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  translateToggleText: {
    fontSize: 10,
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  discoveryDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
    padding: 8,
    borderRadius: THEME.radius.sm,
    gap: 6,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: THEME.colors.accent,
  },
  tipText: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  discoveryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  saveActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  saveActionText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  communitiesSection: {
    marginTop: THEME.spacing.xs,
  },
  communitySearchRow: {
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
  communitySearchInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 12,
  },
  langFilterPill: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.radius.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  langFilterPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  langFilterText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  langFilterTextActive: {
    color: '#FFF',
  },
  communityCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  commCover: {
    width: '100%',
    height: 110,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  commDetails: {
    padding: 12,
  },
  commHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  commName: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  commLangTag: {
    fontSize: 10,
    color: THEME.colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
  },
  joinBtnActive: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  joinBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  joinBtnTextActive: {
    color: THEME.colors.primary,
  },
  commTagline: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
    marginTop: 4,
  },
  commDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  commRulesText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  upcomingEventCard: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.md,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.accent,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  eventBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  eventFee: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.success,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 4,
  },
  eventTimeMeeting: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  eventMeetingPoint: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  rsvpBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 8,
    borderRadius: THEME.radius.sm,
    alignItems: 'center',
    marginTop: 8,
  },
  rsvpBtnActive: {
    backgroundColor: THEME.colors.success,
  },
  rsvpBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  rsvpBtnTextActive: {
    color: '#FFF',
  },
  creatorsSection: {
    marginTop: THEME.spacing.xs,
  },
  creatorSectionDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
  },
  creatorCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 12,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  creatorHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  creatorMainInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  levelBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  levelText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800',
  },
  creatorHandle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  creatorCommunitySub: {
    fontSize: 10,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  followBtn: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  followBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  followBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  followBtnTextActive: {
    color: '#FFF',
  },
  creatorBio: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginVertical: 6,
    lineHeight: 14,
  },
  creatorStatsBar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.sm,
    padding: 6,
    justifyContent: 'space-around',
  },
  creatorStatCol: {
    alignItems: 'center',
  },
  creatorStatVal: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  creatorStatLbl: {
    fontSize: 9,
    color: THEME.colors.textMuted,
  },
});
