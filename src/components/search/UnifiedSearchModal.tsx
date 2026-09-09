// Bhraman - Unified Real Search Modal across Places, Discoveries, Communities, Creators, and Events
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  Image 
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { SearchResultItem, Place, LocalDiscovery, Community, Creator, CommunityEvent } from '../../types';
import { MUMBAI_PLACES } from '../../data/mumbaiPlaces';
import { DEMO_CREATORS } from '../../data/creatorsAndCommunities';

interface UnifiedSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlace?: (place: Place) => void;
  onSelectCommunity?: (community: Community) => void;
  onSelectDiscovery?: (discovery: LocalDiscovery) => void;
}

export const UnifiedSearchModal: React.FC<UnifiedSearchModalProps> = ({
  visible,
  onClose,
  onSelectPlace,
  onSelectCommunity,
  onSelectDiscovery,
}) => {
  const { discoveries, communities, constraints, toggleSave, savedState } = useApp();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'places' | 'discoveries' | 'communities' | 'creators' | 'events'>('all');

  // Build aggregate searchable dataset
  const allResults: SearchResultItem[] = [];

  // 1. Places
  MUMBAI_PLACES.forEach(p => {
    allResults.push({
      id: p.id,
      type: 'place',
      title: p.name,
      subtitle: `${p.neighborhood} • ${p.category.toUpperCase()} • ₹${p.averageCostPerPerson}/person`,
      category: p.category,
      imageUrl: p.imageUrl,
      rating: p.rating,
      cost: p.averageCostPerPerson,
      provenance: p.provenance,
      isDemoData: p.isDemoData !== false,
      item: p,
    });
  });

  // 2. Discoveries (including user-created)
  discoveries.forEach(d => {
    allResults.push({
      id: d.id,
      type: 'discovery',
      title: d.title,
      subtitle: `${d.neighborhood || 'Mumbai'} • by ${d.creatorName || 'Scout'} • ${d.category.toUpperCase()}`,
      category: d.category,
      imageUrl: d.imageUrl,
      cost: d.averageCostPerPerson,
      provenance: d.provenance || (d.isUserCreated ? 'user_contributed' : 'community'),
      isDemoData: d.isDemoData,
      item: d,
    });
  });

  // 3. Communities (including user-created)
  communities.forEach(c => {
    allResults.push({
      id: c.id,
      type: 'community',
      title: c.name,
      subtitle: `${c.tagline} • ${c.membersCount} members • ${(c.primaryLanguage || 'en').toUpperCase()}`,
      category: c.category,
      imageUrl: c.coverImage,
      provenance: c.isDemoData ? 'community' : 'user_contributed',
      isDemoData: c.isDemoData,
      item: c,
    });
  });

  // 4. Creators
  DEMO_CREATORS.forEach(cr => {
    allResults.push({
      id: cr.id,
      type: 'creator',
      title: cr.name,
      subtitle: `${cr.handle} • ${cr.expertise.join(', ')} • Lvl ${cr.level}`,
      category: 'creator',
      imageUrl: cr.avatarUrl,
      rating: cr.reputationPercentage / 20,
      provenance: 'community',
      isDemoData: true,
      item: cr,
    });
  });

  // 5. Events
  communities.forEach(c => {
    if (c.upcomingEvent) {
      allResults.push({
        id: c.upcomingEvent.id,
        type: 'event',
        title: c.upcomingEvent.title,
        subtitle: `🗓️ ${c.upcomingEvent.dateText} at ${c.upcomingEvent.timeText} • ${c.upcomingEvent.meetingPoint}`,
        category: 'event',
        provenance: 'community',
        isDemoData: c.upcomingEvent.isDemoData,
        item: c.upcomingEvent,
      });
    }
  });

  // Filter results by query and active tab
  const q = query.trim().toLowerCase();
  const filteredResults = allResults.filter(r => {
    const matchesTab = activeFilter === 'all' || 
      (activeFilter === 'places' && r.type === 'place') ||
      (activeFilter === 'discoveries' && r.type === 'discovery') ||
      (activeFilter === 'communities' && r.type === 'community') ||
      (activeFilter === 'creators' && r.type === 'creator') ||
      (activeFilter === 'events' && r.type === 'event');

    if (!matchesTab) return false;
    if (!q) return true;

    return r.title.toLowerCase().includes(q) || 
      r.subtitle.toLowerCase().includes(q) || 
      r.category.toLowerCase().includes(q);
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header with Search Bar */}
          <View style={styles.searchHeader}>
            <View style={styles.searchInputRow}>
              <Ionicons name="search" size={18} color={THEME.colors.primary} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search places, discoveries, communities, events..."
                placeholderTextColor={THEME.colors.textMuted}
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={16} color={THEME.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Context indicator */}
          <View style={styles.contextBadgeRow}>
            <Ionicons name="filter-circle-outline" size={13} color={THEME.colors.secondary} />
            <Text style={styles.contextBadgeText}>
              Aware of active base ({constraints.baseLocation.name}) • Budget: ₹{constraints.budget} • Time: {Math.floor(constraints.availableMinutes / 60)}h
            </Text>
          </View>

          {/* Filter Pills */}
          <View style={styles.filtersRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {(['all', 'places', 'discoveries', 'communities', 'creators', 'events'] as const).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Results List */}
          <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
            {filteredResults.length === 0 ? (
              <View style={styles.noResultsBox}>
                <Ionicons name="search-outline" size={36} color={THEME.colors.textMuted} />
                <Text style={styles.noResultsTitle}>No matching results</Text>
                <Text style={styles.noResultsSub}>
                  Try searching for "Bandra", "Ranwar", "food", "nature", or "After Dark".
                </Text>
              </View>
            ) : (
              filteredResults.map(item => {
                const isSaved = item.type === 'place' ? savedState.placeIds.includes(item.id)
                  : item.type === 'discovery' ? savedState.discoveryIds.includes(item.id)
                  : item.type === 'community' ? savedState.communityIds.includes(item.id)
                  : false;

                return (
                  <TouchableOpacity
                    key={`${item.type}_${item.id}`}
                    style={styles.resultCard}
                    onPress={() => {
                      if (item.type === 'place' && onSelectPlace) {
                        onSelectPlace(item.item as Place);
                        onClose();
                      } else if (item.type === 'community' && onSelectCommunity) {
                        onSelectCommunity(item.item as Community);
                        onClose();
                      } else if (item.type === 'discovery' && onSelectDiscovery) {
                        onSelectDiscovery(item.item as LocalDiscovery);
                        onClose();
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.resultImg} />
                    ) : (
                      <View style={styles.placeholderImg}>
                        <Ionicons name="sparkles" size={16} color={THEME.colors.primary} />
                      </View>
                    )}

                    <View style={styles.resultInfo}>
                      <View style={styles.resultTypeRow}>
                        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                          <View style={styles.typeTag}>
                            <Text style={styles.typeTagText}>{item.type.toUpperCase()}</Text>
                          </View>
                          <View style={[styles.typeTag, item.isDemoData ? styles.demoTag : styles.userTag]}>
                            <Text style={[styles.typeTagText, item.isDemoData ? styles.demoTagText : styles.userTagText]}>
                              {item.provenance === 'sponsored' ? 'SPONSORED' : item.isDemoData ? 'SEEDED DEMO' : 'USER CREATED'}
                            </Text>
                          </View>
                        </View>
                        {item.rating && item.provenance !== 'user_contributed' && (
                          <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
                        )}
                      </View>
                      <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.resultSub} numberOfLines={2}>{item.subtitle}</Text>
                    </View>

                    {item.type !== 'event' && item.type !== 'creator' && (
                      <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={() => toggleSave(item.type as any, item.id)}
                      >
                        <Ionicons
                          name={isSaved ? "bookmark" : "bookmark-outline"}
                          size={18}
                          color={isSaved ? THEME.colors.primary : THEME.colors.textMuted}
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xs,
    gap: 8,
  },
  searchInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 13,
  },
  closeBtn: {
    padding: 6,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  contextBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 137, 123, 0.12)',
    marginHorizontal: THEME.spacing.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.sm,
    gap: 4,
    marginTop: 4,
  },
  contextBadgeText: {
    fontSize: 10,
    color: THEME.colors.secondary,
    fontWeight: '600',
  },
  filtersRow: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
  },
  filterChip: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  resultsList: {
    paddingHorizontal: THEME.spacing.md,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.md,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: 'center',
    gap: 10,
  },
  resultImg: {
    width: 60,
    height: 60,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  placeholderImg: {
    width: 60,
    height: 60,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeTag: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  typeTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  demoTag: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  demoTagText: {
    color: THEME.colors.textMuted,
  },
  userTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  userTagText: {
    color: THEME.colors.success,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.accent,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  resultSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  saveBtn: {
    padding: 6,
  },
  noResultsBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  noResultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 8,
  },
  noResultsSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 15,
  },
});
