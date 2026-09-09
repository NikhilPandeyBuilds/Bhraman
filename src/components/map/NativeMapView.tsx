// Bhraman - Universal Interactive Mobile Map View
// Displays base, sequence route, isochrone reachable boundary, and distinct pins
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Dimensions
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Place, MicroItinerary, Category, Coordinates, TransportMode, TrafficCondition } from '../../types';
import { ReachabilityService } from '../../services/reachabilityService';
import { MUMBAI_PLACES, MUMBAI_BASE_HOTEL } from '../../data/mumbaiPlaces';

interface NativeMapViewProps {
  activeItinerary: MicroItinerary | null;
  onSelectPlace?: (place: Place) => void;
  transportMode?: TransportMode;
  traffic?: TrafficCondition;
}

export const NativeMapView: React.FC<NativeMapViewProps> = ({
  activeItinerary,
  onSelectPlace,
  transportMode = 'bike',
  traffic = 'normal',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePlace, setActivePlace] = useState<Place | null>(MUMBAI_PLACES[0]);

  const categories = [
    { key: 'all', label: 'All Places' },
    { key: 'food', label: '🍔 Local Food' },
    { key: 'culture', label: '🏛️ Culture' },
    { key: 'photography', label: '📸 Photography' },
    { key: 'nature', label: '🌿 Nature' },
    { key: 'hidden_gem', label: '✨ Hidden Gems' },
    { key: 'sponsored', label: '💜 Sponsored' },
  ];

  const filteredPlaces = MUMBAI_PLACES.filter(p => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'sponsored') return p.provenance === 'sponsored';
    return p.category === selectedCategory;
  });

  // Calculate isochrone reachability stats
  const availableMinutes = activeItinerary ? activeItinerary.totalTimeMinutes : 180;
  const isochronePoints = ReachabilityService.generateIsochronePolygon(
    MUMBAI_BASE_HOTEL.coordinates,
    availableMinutes,
    transportMode,
    traffic
  );

  // Checks if a place is part of active itinerary stops
  const getStopIndex = (placeId: string): number | null => {
    if (!activeItinerary) return null;
    const match = activeItinerary.stops.find(s => s.place.id === placeId);
    return match ? match.stopIndex : null;
  };

  return (
    <View style={styles.container}>
      {/* Category Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.filterChip, selectedCategory === cat.key && styles.filterChipActive]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text style={[styles.filterChipText, selectedCategory === cat.key && styles.filterChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Interactive Mobile Map Canvas Simulation */}
      <View style={styles.mapCanvas}>
        {/* Background Map Grid & Ambient Mumbai coastline texture */}
        <View style={styles.coastlineWater} />
        <View style={styles.coastlineLand}>
          {/* Map water label */}
          <Text style={styles.arabianSeaLabel}>ARABIAN SEA</Text>
          <Text style={styles.bandraWestLabel}>BANDRA WEST PRECINCT</Text>

          {/* Isochrone Reachable Boundary Contour Tag */}
          <View style={styles.isochroneBadge}>
            <Ionicons name="scan-outline" size={12} color={THEME.colors.primary} />
            <Text style={styles.isochroneBadgeText}>
              {availableMinutes}m Reachable Isochrone ({transportMode.toUpperCase()})
            </Text>
          </View>

          {/* Isochrone boundary contour line simulation */}
          <View style={styles.isochroneContourRing} />

          {/* Base Hotel Pin */}
          <View style={[styles.mapPin, styles.baseHotelPin, { top: '48%', left: '50%' }]}>
            <View style={styles.basePulseHalo} />
            <Ionicons name="business" size={12} color="#FFF" />
            <View style={styles.pinCallout}>
              <Text style={styles.pinCalloutText}>BASE: Bandra Hotel</Text>
            </View>
          </View>

          {/* Render Map Places Pins */}
          {filteredPlaces.slice(0, 12).map((place, idx) => {
            const stopIdx = getStopIndex(place.id);
            const isSelected = activePlace?.id === place.id;
            const isSponsored = place.provenance === 'sponsored';

            // Deterministic scatter around Bandra coordinate space
            const deltaLat = (place.coordinates.latitude - MUMBAI_BASE_HOTEL.coordinates.latitude) * 1200;
            const deltaLon = (place.coordinates.longitude - MUMBAI_BASE_HOTEL.coordinates.longitude) * 1200;
            const topPercent = Math.max(15, Math.min(80, 50 - deltaLat));
            const leftPercent = Math.max(15, Math.min(85, 50 + deltaLon));

            return (
              <TouchableOpacity
                key={place.id}
                style={[
                  styles.mapPin,
                  { top: `${topPercent}%`, left: `${leftPercent}%` },
                  isSelected && styles.mapPinSelected,
                  stopIdx !== null && styles.itineraryStopPin,
                  isSponsored && styles.sponsoredPin,
                ]}
                onPress={() => {
                  setActivePlace(place);
                  if (onSelectPlace) onSelectPlace(place);
                }}
                activeOpacity={0.8}
              >
                {stopIdx !== null ? (
                  <Text style={styles.stopPinNumber}>{stopIdx}</Text>
                ) : isSponsored ? (
                  <Text style={styles.sponsoredPinText}>★</Text>
                ) : (
                  <Ionicons
                    name={
                      place.category === 'food'
                        ? 'fast-food'
                        : place.category === 'culture'
                        ? 'color-palette'
                        : place.category === 'photography'
                        ? 'camera'
                        : place.category === 'nature'
                        ? 'leaf'
                        : 'sparkles'
                    }
                    size={11}
                    color="#FFF"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Route Active Badge if itinerary exists */}
        {activeItinerary && (
          <View style={styles.routeActiveIndicator}>
            <Ionicons name="git-commit" size={14} color={THEME.colors.success} />
            <Text style={styles.routeActiveText}>
              Route Active: {activeItinerary.stops.length} Stops + Return Loop
            </Text>
          </View>
        )}
      </View>

      {/* Selected Place Bottom Sheet Preview */}
      {activePlace && (
        <View style={styles.bottomSheetPreview}>
          <Image source={{ uri: activePlace.imageUrl }} style={styles.previewImage} />
          <View style={styles.previewInfo}>
            <View style={styles.previewProvenanceRow}>
              <View style={[
                styles.provenancePill,
                activePlace.provenance === 'sponsored' ? styles.provenanceSponsored : styles.provenanceCommunity
              ]}>
                <Text style={styles.provenanceText}>
                  {activePlace.provenance === 'sponsored' ? 'SPONSORED' : activePlace.provenance === 'community' ? 'COMMUNITY DISCOVERED' : 'ORGANIC'}
                </Text>
              </View>
              <Text style={styles.previewRating}>★ {activePlace.rating}</Text>
            </View>

            <Text style={styles.previewName} numberOfLines={1}>{activePlace.name}</Text>
            <Text style={styles.previewDesc} numberOfLines={2}>{activePlace.description}</Text>

            <View style={styles.previewFooterRow}>
              <Text style={styles.previewCost}>
                {activePlace.averageCostPerPerson === 0 ? 'Free' : `~₹${activePlace.averageCostPerPerson}/person`}
              </Text>
              <Text style={styles.previewStay}>⏱️ {activePlace.typicalStayMinutes} min typical stay</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  filterBar: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  filterScroll: {
    paddingHorizontal: THEME.spacing.md,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceElevated,
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
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  coastlineWater: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '35%',
    height: '100%',
    backgroundColor: '#0c1b2b', // Deep coastal water
  },
  coastlineLand: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#121822',
    borderLeftWidth: 2,
    borderLeftColor: '#1d2f44',
  },
  arabianSeaLabel: {
    position: 'absolute',
    top: '25%',
    left: 10,
    color: 'rgba(255, 255, 255, 0.1)',
    fontSize: 14,
    fontWeight: '800',
    transform: [{ rotate: '-90deg' }],
    letterSpacing: 3,
  },
  bandraWestLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  isochroneBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 28, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    zIndex: 10,
  },
  isochroneBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  isochroneContourRing: {
    position: 'absolute',
    top: '20%',
    left: '25%',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(230, 81, 0, 0.35)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(230, 81, 0, 0.04)',
  },
  mapPin: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
    zIndex: 5,
  },
  mapPinSelected: {
    transform: [{ scale: 1.25 }],
    borderColor: THEME.colors.primary,
    borderWidth: 2,
    zIndex: 15,
  },
  baseHotelPin: {
    backgroundColor: THEME.colors.primary,
    zIndex: 20,
  },
  basePulseHalo: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(230, 81, 0, 0.25)',
  },
  pinCallout: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pinCalloutText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '700',
  },
  itineraryStopPin: {
    backgroundColor: THEME.colors.accent,
    zIndex: 12,
  },
  stopPinNumber: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sponsoredPin: {
    backgroundColor: THEME.colors.sponsoredBadge,
    zIndex: 6,
  },
  sponsoredPinText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  routeActiveIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 28, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: THEME.colors.success,
  },
  routeActiveText: {
    fontSize: 9,
    color: THEME.colors.success,
    fontWeight: '700',
  },
  bottomSheetPreview: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
    padding: THEME.spacing.sm,
    gap: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: 75,
    height: 75,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  previewInfo: {
    flex: 1,
  },
  previewProvenanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  provenancePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  provenanceCommunity: {
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
  },
  provenanceSponsored: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  provenanceText: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.5,
  },
  previewRating: {
    fontSize: 11,
    color: THEME.colors.accent,
    fontWeight: '700',
  },
  previewName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  previewDesc: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  previewFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  previewCost: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.success,
  },
  previewStay: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
});
