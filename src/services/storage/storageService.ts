// Bhraman - Unified Persistence & Storage Repository
// Strictly PS6: Local & Experiences
// Provides cross-platform persistent storage (AsyncStorage on native, localStorage on web)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  LocalDiscovery, 
  Community, 
  CommunityEvent, 
  SavedState, 
  MicroItinerary,
  Category,
  TransportMode,
  SupportedLanguage
} from '../../types';
import { DEMO_COMMUNITIES, DEMO_LOCAL_DISCOVERIES } from '../../data/creatorsAndCommunities';

const STORAGE_KEYS = {
  CURRENT_USER: '@bhraman_current_user',
  ALL_USERS: '@bhraman_all_users',
  USER_DISCOVERIES: '@bhraman_user_discoveries',
  COMMUNITIES: '@bhraman_communities',
  JOINED_COMMUNITY_IDS: '@bhraman_joined_community_ids',
  COMMUNITY_EVENTS: '@bhraman_community_events',
  USER_EVENT_RSVPS: '@bhraman_user_event_rsvps',
  SAVED_STATE: '@bhraman_saved_state',
  FOLLOWED_CREATOR_IDS: '@bhraman_followed_creator_ids',
};

// Default initial authenticated user
export const DEFAULT_USER: User = {
  id: 'usr_default_aarav',
  email: 'aarav@bhraman.local',
  name: 'Aarav Kapoor',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  bio: 'Mumbai street food explorer and weekend photographer based in Bandra.',
  homeCity: 'Mumbai',
  languages: ['en', 'hi', 'mr'],
  interests: ['food', 'photography', 'culture', 'hidden_gem'],
  preferredTransport: 'bike',
  explorerPoints: 1420,
  level: 4,
  badges: ['Local Scout', 'City Explorer', 'Hidden Gem Hunter', 'Authenticity Fan'],
  createdAt: new Date().toISOString(),
};

export class StorageService {
  // ---------------- USER & AUTH ----------------

  public static async getCurrentUser(): Promise<User> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) {
        return JSON.parse(data);
      }
      // Initialize with default real user
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    } catch (e) {
      console.warn('StorageService.getCurrentUser error:', e);
      return DEFAULT_USER;
    }
  }

  public static async setCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {
      console.warn('StorageService.setCurrentUser error:', e);
    }
  }

  public static async updateUserProfile(updates: Partial<User>): Promise<User> {
    const user = await this.getCurrentUser();
    const updated: User = { ...user, ...updates };
    await this.setCurrentUser(updated);
    return updated;
  }

  public static async addExplorerPoints(points: number): Promise<User> {
    const user = await this.getCurrentUser();
    const newPoints = user.explorerPoints + points;
    const newLevel = Math.max(1, Math.min(10, Math.floor(newPoints / 350) + 1));
    return this.updateUserProfile({
      explorerPoints: newPoints,
      level: newLevel,
    });
  }

  // ---------------- LOCAL DISCOVERIES ----------------

  public static async getAllDiscoveries(): Promise<LocalDiscovery[]> {
    try {
      const userDiscoveriesJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DISCOVERIES);
      const userDiscoveries: LocalDiscovery[] = userDiscoveriesJson ? JSON.parse(userDiscoveriesJson) : [];
      // Combine user created discoveries with seed discoveries
      return [...userDiscoveries, ...DEMO_LOCAL_DISCOVERIES];
    } catch (e) {
      console.warn('StorageService.getAllDiscoveries error:', e);
      return DEMO_LOCAL_DISCOVERIES;
    }
  }

  public static async addDiscovery(discovery: LocalDiscovery): Promise<LocalDiscovery[]> {
    try {
      const userDiscoveriesJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DISCOVERIES);
      const userDiscoveries: LocalDiscovery[] = userDiscoveriesJson ? JSON.parse(userDiscoveriesJson) : [];
      const updated = [discovery, ...userDiscoveries];
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DISCOVERIES, JSON.stringify(updated));
      // Award +50 explorer points
      await this.addExplorerPoints(50);
      return updated;
    } catch (e) {
      console.warn('StorageService.addDiscovery error:', e);
      return [];
    }
  }

  public static async deleteDiscovery(discoveryId: string): Promise<void> {
    try {
      const userDiscoveriesJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DISCOVERIES);
      if (userDiscoveriesJson) {
        const userDiscoveries: LocalDiscovery[] = JSON.parse(userDiscoveriesJson);
        const filtered = userDiscoveries.filter(d => d.id !== discoveryId);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DISCOVERIES, JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn('StorageService.deleteDiscovery error:', e);
    }
  }

  // ---------------- COMMUNITIES ----------------

  public static async getAllCommunities(): Promise<Community[]> {
    try {
      const userCommJson = await AsyncStorage.getItem(STORAGE_KEYS.COMMUNITIES);
      const userCommunities: Community[] = userCommJson ? JSON.parse(userCommJson) : [];
      return [...userCommunities, ...DEMO_COMMUNITIES];
    } catch (e) {
      console.warn('StorageService.getAllCommunities error:', e);
      return DEMO_COMMUNITIES;
    }
  }

  public static async addCommunity(community: Community): Promise<Community[]> {
    try {
      const userCommJson = await AsyncStorage.getItem(STORAGE_KEYS.COMMUNITIES);
      const userCommunities: Community[] = userCommJson ? JSON.parse(userCommJson) : [];
      const updated = [community, ...userCommunities];
      await AsyncStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(updated));
      // Also auto-join the created community
      await this.joinCommunity(community.id);
      // Award +40 explorer points
      await this.addExplorerPoints(40);
      return updated;
    } catch (e) {
      console.warn('StorageService.addCommunity error:', e);
      return [];
    }
  }

  public static async getJoinedCommunityIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.JOINED_COMMUNITY_IDS);
      return data ? JSON.parse(data) : ['comm_after_dark']; // Default one joined for demo
    } catch (e) {
      return ['comm_after_dark'];
    }
  }

  public static async joinCommunity(communityId: string): Promise<string[]> {
    try {
      const current = await this.getJoinedCommunityIds();
      if (!current.includes(communityId)) {
        const updated = [...current, communityId];
        await AsyncStorage.setItem(STORAGE_KEYS.JOINED_COMMUNITY_IDS, JSON.stringify(updated));
        await this.addExplorerPoints(15);
        return updated;
      }
      return current;
    } catch (e) {
      return [];
    }
  }

  public static async leaveCommunity(communityId: string): Promise<string[]> {
    try {
      const current = await this.getJoinedCommunityIds();
      const updated = current.filter(id => id !== communityId);
      await AsyncStorage.setItem(STORAGE_KEYS.JOINED_COMMUNITY_IDS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  }

  // ---------------- COMMUNITY EVENTS & RSVPs ----------------

  public static async getUserEventRsvps(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_EVENT_RSVPS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  public static async toggleEventRsvp(eventId: string): Promise<boolean> {
    try {
      const current = await this.getUserEventRsvps();
      const exists = current.includes(eventId);
      let updated: string[];
      if (exists) {
        updated = current.filter(id => id !== eventId);
      } else {
        updated = [...current, eventId];
        await this.addExplorerPoints(10);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.USER_EVENT_RSVPS, JSON.stringify(updated));
      return !exists;
    } catch (e) {
      return false;
    }
  }

  // ---------------- SAVED ITEMS ----------------

  public static async getSavedState(): Promise<SavedState> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_STATE);
      if (data) {
        return JSON.parse(data);
      }
      const initial: SavedState = {
        placeIds: ['food_subko_bandra', 'cult_ranwar_village'],
        discoveryIds: ['disc_ranwar_secret_lane'],
        communityIds: ['comm_after_dark'],
        eventIds: [],
        itineraries: [],
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_STATE, JSON.stringify(initial));
      return initial;
    } catch (e) {
      return {
        placeIds: [],
        discoveryIds: [],
        communityIds: [],
        eventIds: [],
        itineraries: [],
      };
    }
  }

  public static async toggleSaveItem(
    type: 'place' | 'discovery' | 'community' | 'event',
    id: string
  ): Promise<SavedState> {
    const current = await this.getSavedState();
    let key: 'placeIds' | 'discoveryIds' | 'communityIds' | 'eventIds' = 'placeIds';
    if (type === 'discovery') key = 'discoveryIds';
    else if (type === 'community') key = 'communityIds';
    else if (type === 'event') key = 'eventIds';

    const list = current[key];
    const exists = list.includes(id);
    const updatedList = exists ? list.filter(item => item !== id) : [...list, id];

    const updatedState: SavedState = {
      ...current,
      [key]: updatedList,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_STATE, JSON.stringify(updatedState));
    if (!exists) {
      await this.addExplorerPoints(5);
    }
    return updatedState;
  }

  public static async saveItinerary(itinerary: MicroItinerary): Promise<SavedState> {
    const current = await this.getSavedState();
    // Prepend new plan without duplicates
    const filtered = current.itineraries.filter(i => i.id !== itinerary.id);
    const updatedState: SavedState = {
      ...current,
      itineraries: [itinerary, ...filtered],
    };
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_STATE, JSON.stringify(updatedState));
    await this.addExplorerPoints(20);
    return updatedState;
  }

  public static async deleteSavedItinerary(itineraryId: string): Promise<SavedState> {
    const current = await this.getSavedState();
    const updatedState: SavedState = {
      ...current,
      itineraries: current.itineraries.filter(i => i.id !== itineraryId),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_STATE, JSON.stringify(updatedState));
    return updatedState;
  }

  // ---------------- FOLLOWS ----------------

  public static async getFollowedCreatorIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FOLLOWED_CREATOR_IDS);
      return data ? JSON.parse(data) : ['creator_raj'];
    } catch (e) {
      return ['creator_raj'];
    }
  }

  public static async toggleFollowCreator(creatorId: string): Promise<boolean> {
    try {
      const current = await this.getFollowedCreatorIds();
      const exists = current.includes(creatorId);
      const updated = exists ? current.filter(id => id !== creatorId) : [...current, creatorId];
      await AsyncStorage.setItem(STORAGE_KEYS.FOLLOWED_CREATOR_IDS, JSON.stringify(updated));
      return !exists;
    } catch (e) {
      return false;
    }
  }
}
