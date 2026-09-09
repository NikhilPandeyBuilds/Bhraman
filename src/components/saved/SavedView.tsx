import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert,
  useWindowDimensions 
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { MUMBAI_PLACES } from '../../data/mumbaiPlaces';
import { Place, LocalDiscovery, Community, MicroItinerary } from '../../types';

interface SavedViewProps {
  onLoadSavedPlan: (plan: MicroItinerary) => void;
  onExplorePlace: (place: Place) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  onLoadSavedPlan,
  onExplorePlace,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const { 
    savedState, 
    toggleSave, 
    discoveries, 
    communities, 
    deleteSavedItinerary,
    userRsvps
  } = useApp();

  const [activeTab, setActiveTab] = useState<'places' | 'discoveries' | 'plans' | 'communities' | 'events'>('plans');

  // Resolved entities from persistent IDs
  const savedPlaces = MUMBAI_PLACES.filter(p => savedState.placeIds.includes(p.id));
  const savedDiscoveries = discoveries.filter(d => savedState.discoveryIds.includes(d.id));
  const savedCommunities = communities.filter(c => savedState.communityIds.includes(c.id));
  const savedEvents = communities
    .filter(c => c.upcomingEvent && (savedState.eventIds.includes(c.upcomingEvent.id) || userRsvps.includes(c.upcomingEvent.id)))
    .map(c => c.upcomingEvent!);

  return (
    <View style={styles.container}>
      {/* Sub Tab Navigation */}
      <View style={[styles.subNavBar, isDesktop && { alignItems: 'center' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.subNavScroll, isDesktop && { maxWidth: 1280, width: '100%', justifyContent: 'center' }]}>
          <TouchableOpacity
            style={[styles.subNavItem, activeTab === 'plans' && styles.subNavItemActive]}
            onPress={() => setActiveTab('plans')}
          >
            <Text style={[styles.subNavText, activeTab === 'plans' && styles.subNavTextActive]}>
              Plans ({savedState.itineraries.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subNavItem, activeTab === 'places' && styles.subNavItemActive]}
            onPress={() => setActiveTab('places')}
          >
            <Text style={[styles.subNavText, activeTab === 'places' && styles.subNavTextActive]}>
              Places ({savedPlaces.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subNavItem, activeTab === 'discoveries' && styles.subNavItemActive]}
            onPress={() => setActiveTab('discoveries')}
          >
            <Text style={[styles.subNavText, activeTab === 'discoveries' && styles.subNavTextActive]}>
              Discoveries ({savedDiscoveries.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subNavItem, activeTab === 'communities' && styles.subNavItemActive]}
            onPress={() => setActiveTab('communities')}
          >
            <Text style={[styles.subNavText, activeTab === 'communities' && styles.subNavTextActive]}>
              Communities ({savedCommunities.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subNavItem, activeTab === 'events' && styles.subNavItemActive]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.subNavText, activeTab === 'events' && styles.subNavTextActive]}>
              Events ({savedEvents.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={isDesktop ? styles.desktopScrollContent : undefined}
        showsVerticalScrollIndicator={false}
      >
        <View style={isDesktop ? styles.desktopWrapper : undefined}>
        {/* 1. SAVED PLANS */}
        {activeTab === 'plans' && (
          <View>
            {savedState.itineraries.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Ionicons name="trail-sign-outline" size={40} color={THEME.colors.textMuted} />
                <Text style={styles.emptyTitle}>No Saved Itineraries Yet</Text>
                <Text style={styles.emptySub}>
                  When you build an itinerary, tap "Save Plan" to store it for offline review.
                </Text>
              </View>
            ) : (
              <View style={isDesktop ? styles.gridContainer : undefined}>
              {savedState.itineraries.map((plan, idx) => (
                <View key={plan.id || idx} style={[styles.planCard, isDesktop && styles.cardDesktop]}>
                  <View style={styles.planCardHeader}>
                    <View>
                      <Text style={styles.planCardSuper}>SAVED ITINERARY</Text>
                      <Text style={styles.planCardTitle}>
                        {plan.stops.length}-Stop Mumbai Experience
                      </Text>
                      <Text style={styles.planCardMeta}>
                        Base: {plan.baseLocation.name}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteSavedItinerary(plan.id)}>
                      <Ionicons name="trash-outline" size={18} color={THEME.colors.danger} />
                    </TouchableOpacity>
                  </View>

                  {/* Metrics preview */}
                  <View style={styles.planMetricsRow}>
                    <Text style={styles.planMetricItem}>💰 ₹{plan.totalCost}</Text>
                    <Text style={styles.planMetricItem}>⏱️ {Math.floor(plan.totalTimeMinutes / 60)}h {plan.totalTimeMinutes % 60}m</Text>
                    <Text style={[styles.planMetricItem, { color: THEME.colors.success }]}>
                      🛡️ {plan.safetyBufferMinutes}m buffer
                    </Text>
                  </View>

                  {/* Stop sequence */}
                  <View style={styles.planStopsList}>
                    {plan.stops.map(s => (
                      <Text key={s.stopIndex} style={styles.planStopLine} numberOfLines={1}>
                        • Stop {s.stopIndex}: {s.place.name} ({s.activityDurationMinutes}m)
                      </Text>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.loadPlanBtn}
                    onPress={() => onLoadSavedPlan(plan)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.loadPlanBtnText}>ACTIVATE / VIEW PLAN</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
              </View>
            )}
          </View>
        )}

        {/* 2. SAVED PLACES */}
        {activeTab === 'places' && (
          <View>
            {savedPlaces.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Ionicons name="business-outline" size={40} color={THEME.colors.textMuted} />
                <Text style={styles.emptyTitle}>No Saved Places</Text>
                <Text style={styles.emptySub}>Bookmark heritage spots, cafes, and viewpoints from Explore.</Text>
              </View>
            ) : (
              <View style={isDesktop ? styles.gridContainer : undefined}>
              {savedPlaces.map(place => (
                <TouchableOpacity
                  key={place.id}
                  style={[styles.itemCard, isDesktop && styles.cardDesktop]}
                  onPress={() => onExplorePlace(place)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: place.imageUrl }} style={styles.itemImg} />
                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeaderRow}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{place.name}</Text>
                        <View style={styles.provenancePill}>
                          <Text style={styles.provenancePillText}>
                            {place.provenance === 'sponsored' ? 'SPONSORED' : place.isDemoData !== false ? 'SEEDED DEMO' : 'VERIFIED'}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => toggleSave('place', place.id)}>
                        <Ionicons name="bookmark" size={18} color={THEME.colors.primary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.itemSub}>{place.neighborhood} • {place.category.toUpperCase()}</Text>
                    <Text style={styles.itemDesc} numberOfLines={2}>{place.description}</Text>
                    <Text style={styles.itemCost}>~₹{place.averageCostPerPerson}/person • ★ {place.rating}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              </View>
            )}
          </View>
        )}

        {/* 3. SAVED DISCOVERIES */}
        {activeTab === 'discoveries' && (
          <View>
            {savedDiscoveries.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Ionicons name="sparkles-outline" size={40} color={THEME.colors.textMuted} />
                <Text style={styles.emptyTitle}>No Saved Discoveries</Text>
                <Text style={styles.emptySub}>Save secret lanes and community finds from the Community feed.</Text>
              </View>
            ) : (
              <View style={isDesktop ? styles.gridContainer : undefined}>
              {savedDiscoveries.map(disc => (
                <View key={disc.id} style={[styles.itemCard, isDesktop && styles.cardDesktop]}>
                  <Image source={{ uri: disc.imageUrl }} style={styles.itemImg} />
                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeaderRow}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{disc.title}</Text>
                        <View style={styles.provenancePill}>
                          <Text style={styles.provenancePillText}>
                            {disc.isDemoData ? 'SEEDED DEMO' : 'USER CONTRIBUTED'}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => toggleSave('discovery', disc.id)}>
                        <Ionicons name="bookmark" size={18} color={THEME.colors.primary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.itemSub}>{disc.neighborhood || 'Mumbai'} • by {disc.creatorName || 'Scout'}</Text>
                    <Text style={styles.itemDesc} numberOfLines={2}>{disc.description}</Text>
                  </View>
                </View>
              ))}
              </View>
            )}
          </View>
        )}

        {/* 4. SAVED COMMUNITIES */}
        {activeTab === 'communities' && (
          <View>
            {savedCommunities.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Ionicons name="people-outline" size={40} color={THEME.colors.textMuted} />
                <Text style={styles.emptyTitle}>No Saved Communities</Text>
                <Text style={styles.emptySub}>Join local groups and bookmark communities to explore with locals.</Text>
              </View>
            ) : (
              <View style={isDesktop ? styles.gridContainer : undefined}>
              {savedCommunities.map(comm => (
                <View key={comm.id} style={[styles.itemCard, isDesktop && styles.cardDesktop]}>
                  <Image source={{ uri: comm.coverImage }} style={styles.itemImg} />
                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeaderRow}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{comm.name}</Text>
                        <View style={styles.provenancePill}>
                          <Text style={styles.provenancePillText}>
                            {comm.isDemoData ? 'DEMO COMMUNITY' : 'USER COMMUNITY'}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => toggleSave('community', comm.id)}>
                        <Ionicons name="bookmark" size={18} color={THEME.colors.primary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.itemSub}>{comm.tagline}</Text>
                    <Text style={styles.itemCost}>{comm.membersCount} explorers • {(comm.primaryLanguage || 'en').toUpperCase()}</Text>
                  </View>
                </View>
              ))}
              </View>
            )}
          </View>
        )}

        {/* 5. SAVED / RSVP'D EVENTS */}
        {activeTab === 'events' && (
          <View>
            {savedEvents.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Ionicons name="calendar-outline" size={40} color={THEME.colors.textMuted} />
                <Text style={styles.emptyTitle}>No RSVP'd Events</Text>
                <Text style={styles.emptySub}>Request to join community exploration walks to track them here.</Text>
              </View>
            ) : (
              <View style={isDesktop ? styles.gridContainer : undefined}>
              {savedEvents.map(evt => (
                <View key={evt.id} style={[styles.eventCard, isDesktop && styles.cardDesktop]}>
                  <View style={styles.eventCardHeader}>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <View style={styles.eventRsvpBadge}>
                        <Ionicons name="checkmark-circle" size={12} color="#FFF" />
                        <Text style={styles.eventRsvpText}>RSVP Active</Text>
                      </View>
                      <View style={styles.provenancePill}>
                        <Text style={styles.provenancePillText}>
                          {evt.isDemoData ? 'DEMO EVENT' : 'COMMUNITY EVENT'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.eventCostText}>{evt.fee === 0 ? 'Free' : `₹${evt.fee}`}</Text>
                  </View>
                  <Text style={styles.eventCardTitle}>{evt.title}</Text>
                  <Text style={styles.eventCardTime}>🗓️ {evt.dateText} at {evt.timeText}</Text>
                  <Text style={styles.eventCardMeeting}>📍 {evt.meetingPoint}</Text>
                  <Text style={styles.eventCardHost}>Host: {evt.hostName}</Text>
                </View>
              ))}
              </View>
            )}
          </View>
        )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  subNavBar: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  subNavScroll: {
    paddingHorizontal: THEME.spacing.md,
    gap: 6,
  },
  subNavItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  subNavItemActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  subNavText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  subNavTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  cardDesktop: {
    width: '48.8%',
    marginBottom: 0,
  },
  emptyStateBox: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  emptySub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 16,
  },
  planCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planCardSuper: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 1,
  },
  planCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  planCardMeta: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  planMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: THEME.colors.background,
    padding: 8,
    borderRadius: THEME.radius.sm,
    marginVertical: 8,
  },
  planMetricItem: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  planStopsList: {
    marginBottom: 8,
  },
  planStopLine: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 2,
  },
  loadPlanBtn: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: THEME.radius.sm,
    gap: 6,
  },
  loadPlanBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.md,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 10,
    alignItems: 'center',
  },
  itemImg: {
    width: 65,
    height: 65,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  itemSub: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  itemDesc: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 13,
  },
  itemCost: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.success,
    marginTop: 3,
  },
  eventCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.accent,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventRsvpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  eventRsvpText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  eventCostText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.success,
  },
  eventCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  eventCardTime: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  eventCardMeeting: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  eventCardHost: {
    fontSize: 10,
    color: THEME.colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  provenancePill: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  provenancePillText: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
});
