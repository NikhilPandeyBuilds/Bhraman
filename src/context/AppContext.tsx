// Bhraman - Global Application State Context
// Unifies real persistence, auth, i18n, communities, discoveries, and itinerary engine

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  SupportedLanguage, 
  LocalDiscovery, 
  Community, 
  CommunityEvent, 
  SavedState, 
  MicroItinerary, 
  TravelerConstraints,
  TrafficCondition,
  WeatherCondition,
  ReplanningDiff,
  Place
} from '../types';
import { StorageService, DEFAULT_USER } from '../services/storage/storageService';
import { RecommendationEngine } from '../services/recommendationEngine';
import { ReplanningEngine } from '../services/replanningEngine';
import { LanguageService } from '../services/i18n/languageService';
import { MUMBAI_BASE_HOTEL, MUMBAI_PLACES } from '../data/mumbaiPlaces';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: string;
}

interface AppContextType {
  // User & Auth
  user: User;
  isAuthenticated: boolean;
  loginUser: (email: string, name?: string) => Promise<void>;
  signupUser: (email: string, name: string, homeCity: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;

  // Language & Translation
  activeLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  translateText: (text: string, sourceLang: SupportedLanguage) => string;

  // Real Discoveries
  discoveries: LocalDiscovery[];
  userDiscoveries: LocalDiscovery[];
  addDiscovery: (discoveryData: Omit<LocalDiscovery, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'verifiedDaysAgo' | 'provenance'>) => Promise<void>;
  deleteDiscovery: (id: string) => Promise<void>;

  // Real Communities
  communities: Community[];
  joinedCommunityIds: string[];
  createCommunity: (commData: Omit<Community, 'id' | 'createdAt' | 'membersCount' | 'memberUserIds'>) => Promise<void>;
  joinCommunity: (id: string) => Promise<void>;
  leaveCommunity: (id: string) => Promise<void>;

  // Community Events & RSVP
  userRsvps: string[];
  toggleEventRsvp: (eventId: string) => Promise<void>;

  // Saved Items
  savedState: SavedState;
  toggleSave: (type: 'place' | 'discovery' | 'community' | 'event', id: string) => Promise<void>;
  saveCurrentItinerary: () => Promise<void>;
  deleteSavedItinerary: (id: string) => Promise<void>;

  // Follow Creators
  followedCreatorIds: string[];
  toggleFollowCreator: (creatorId: string) => Promise<void>;

  // Constraints & Micro-Itinerary
  constraints: TravelerConstraints;
  setConstraints: React.Dispatch<React.SetStateAction<TravelerConstraints>>;
  activeItinerary: MicroItinerary | null;
  activeDiff: ReplanningDiff | null;
  trafficCondition: TrafficCondition;
  weatherCondition: WeatherCondition;
  setTrafficCondition: React.Dispatch<React.SetStateAction<TrafficCondition>>;
  setWeatherCondition: React.Dispatch<React.SetStateAction<WeatherCondition>>;
  buildExperience: (customConstraints?: TravelerConstraints) => void;
  acceptDiff: () => void;
  dismissDiff: () => void;

  // Replanning triggers
  triggerHeavyRain: () => void;
  triggerTrafficSpike: () => void;
  triggerTimeCut: (minutes?: number) => void;
  triggerBudgetCut: (budget?: number) => void;
  resetDemoConditions: () => void;

  // Notifications
  notifications: InAppNotification[];
  dismissNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User state
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Language state
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>('en');

  // Discoveries & Communities
  const [discoveries, setDiscoveries] = useState<LocalDiscovery[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);
  const [userRsvps, setUserRsvps] = useState<string[]>([]);
  const [savedState, setSavedState] = useState<SavedState>({
    placeIds: [],
    discoveryIds: [],
    communityIds: [],
    eventIds: [],
    itineraries: [],
  });
  const [followedCreatorIds, setFollowedCreatorIds] = useState<string[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState<InAppNotification[]>([
    {
      id: 'notif_welcome',
      title: 'Welcome to Bhraman',
      message: 'Discover Mumbai beyond the obvious with context-aware micro-itineraries.',
      type: 'info',
      timestamp: 'Just now',
    }
  ]);

  // Constraints & Itinerary
  const defaultConstraints: TravelerConstraints = {
    baseLocation: {
      name: MUMBAI_BASE_HOTEL.name,
      coordinates: MUMBAI_BASE_HOTEL.coordinates,
    },
    availableMinutes: 180,
    budget: 3000,
    groupSize: 3,
    groupType: 'friends',
    interests: ['food', 'culture', 'photography'],
    transportMode: 'bike',
    requiresReturn: true,
    minimumBufferMinutes: 15,
  };

  const [constraints, setConstraints] = useState<TravelerConstraints>(defaultConstraints);
  const [trafficCondition, setTrafficCondition] = useState<TrafficCondition>('normal');
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('clear');
  const [activeItinerary, setActiveItinerary] = useState<MicroItinerary | null>(null);
  const [activeDiff, setActiveDiff] = useState<ReplanningDiff | null>(null);

  // Initialize from persistent storage on mount
  useEffect(() => {
    async function loadData() {
      const u = await StorageService.getCurrentUser();
      setUser(u);
      setIsAuthenticated(true);
      if (u.languages && u.languages.length > 0) {
        setActiveLanguage(u.languages[0]);
      }

      const disc = await StorageService.getAllDiscoveries();
      setDiscoveries(disc);

      const comm = await StorageService.getAllCommunities();
      setCommunities(comm);

      const joined = await StorageService.getJoinedCommunityIds();
      setJoinedCommunityIds(joined);

      const rsvps = await StorageService.getUserEventRsvps();
      setUserRsvps(rsvps);

      const saved = await StorageService.getSavedState();
      setSavedState(saved);

      const followed = await StorageService.getFollowedCreatorIds();
      setFollowedCreatorIds(followed);

      // Build initial plan with user discoveries included
      const initialPlan = RecommendationEngine.buildItinerary(
        defaultConstraints,
        MUMBAI_PLACES,
        'normal',
        'clear',
        '08:00 PM',
        disc
      );
      setActiveItinerary(initialPlan);
    }
    loadData();
  }, []);

  const addNotification = (title: string, message: string, type: 'info' | 'warning' | 'success' = 'info') => {
    const newNotif: InAppNotification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
  };

  // Auth functions
  const loginUser = async (email: string, name?: string) => {
    const updated = await StorageService.updateUserProfile({
      email,
      name: name || email.split('@')[0],
    });
    setUser(updated);
    setIsAuthenticated(true);
    addNotification('Logged In', `Welcome back, ${updated.name}!`, 'success');
  };

  const signupUser = async (email: string, name: string, homeCity: string) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      name,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      bio: `Explorer based in ${homeCity}.`,
      homeCity,
      languages: [activeLanguage, 'en'],
      interests: ['food', 'culture', 'hidden_gem'],
      preferredTransport: 'bike',
      explorerPoints: 200,
      level: 1,
      badges: ['New Explorer', 'Local Scout'],
      createdAt: new Date().toISOString(),
    };
    await StorageService.setCurrentUser(newUser);
    setUser(newUser);
    setIsAuthenticated(true);
    addNotification('Account Created', `Welcome to Bhraman, ${name}!`, 'success');
  };

  const logoutUser = async () => {
    setIsAuthenticated(false);
    addNotification('Logged Out', 'You are currently browsing as a guest.', 'info');
  };

  const updateProfile = async (updates: Partial<User>) => {
    const updated = await StorageService.updateUserProfile(updates);
    setUser(updated);
    addNotification('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  // Translation helpers
  const t = (key: string) => LanguageService.getUIString(key, activeLanguage);
  const translateText = (text: string, sourceLang: SupportedLanguage) => {
    return LanguageService.translateContent(text, sourceLang, activeLanguage);
  };

  // Real Discovery Creation
  const addDiscovery = async (discoveryData: any) => {
    const newDiscovery: LocalDiscovery = {
      ...discoveryData,
      id: `disc_user_${Date.now()}`,
      creatorId: user.id,
      creatorName: user.name,
      creatorHandle: `@${user.name.toLowerCase().replace(/\s+/g, '_')}`,
      creatorAvatar: user.avatarUrl,
      likesCount: 0,
      commentsCount: 0,
      verifiedDaysAgo: 0,
      provenance: 'user_contributed',
      isUserCreated: true,
      originalLanguage: activeLanguage,
      createdAt: new Date().toISOString(),
    };
    const updatedList = await StorageService.addDiscovery(newDiscovery);
    setDiscoveries(updatedList);
    // Refresh user points
    const freshUser = await StorageService.getCurrentUser();
    setUser(freshUser);
    addNotification(
      'Discovery Published!',
      `"${newDiscovery.title}" is now discoverable across Mumbai and added to candidate micro-itineraries (+50 pts).`,
      'success'
    );
  };

  const deleteDiscovery = async (id: string) => {
    await StorageService.deleteDiscovery(id);
    setDiscoveries(prev => prev.filter(d => d.id !== id));
    addNotification('Discovery Removed', 'Your discovery has been deleted.', 'info');
  };

  // Real Community Creation
  const createCommunity = async (commData: any) => {
    const newCommunity: Community = {
      ...commData,
      id: `comm_user_${Date.now()}`,
      creatorId: user.id,
      creatorName: user.name,
      membersCount: 1,
      memberUserIds: [user.id],
      isUserCreated: true,
      createdAt: new Date().toISOString(),
    };
    const updatedList = await StorageService.addCommunity(newCommunity);
    setCommunities(updatedList);
    setJoinedCommunityIds(prev => [...prev, newCommunity.id]);
    const freshUser = await StorageService.getCurrentUser();
    setUser(freshUser);
    addNotification(
      'Community Created!',
      `"${newCommunity.name}" is now live (+40 pts).`,
      'success'
    );
  };

  const joinCommunity = async (id: string) => {
    const updated = await StorageService.joinCommunity(id);
    setJoinedCommunityIds(updated);
    const freshUser = await StorageService.getCurrentUser();
    setUser(freshUser);
    addNotification('Joined Community', 'You are now an active member (+15 pts).', 'success');
  };

  const leaveCommunity = async (id: string) => {
    const updated = await StorageService.leaveCommunity(id);
    setJoinedCommunityIds(updated);
  };

  const toggleEventRsvp = async (eventId: string) => {
    const isRsvpd = await StorageService.toggleEventRsvp(eventId);
    const updated = await StorageService.getUserEventRsvps();
    setUserRsvps(updated);
    const freshUser = await StorageService.getCurrentUser();
    setUser(freshUser);
    if (isRsvpd) {
      addNotification('RSVP Confirmed', 'Session added to your timeline (+10 pts).', 'success');
    } else {
      addNotification('RSVP Cancelled', 'Your spot has been freed.', 'info');
    }
  };

  // Real Saved Items
  const toggleSave = async (type: 'place' | 'discovery' | 'community' | 'event', id: string) => {
    const updated = await StorageService.toggleSaveItem(type, id);
    setSavedState(updated);
    const freshUser = await StorageService.getCurrentUser();
    setUser(freshUser);
  };

  const saveCurrentItinerary = async () => {
    if (!activeItinerary) return;
    const updated = await StorageService.saveItinerary(activeItinerary);
    setSavedState(updated);
    const freshUser = await StorageService.getCurrentUser();
    setUser(freshUser);
    addNotification('Plan Saved', 'Saved to your offline traveler profile (+20 pts).', 'success');
  };

  const deleteSavedItinerary = async (id: string) => {
    const updated = await StorageService.deleteSavedItinerary(id);
    setSavedState(updated);
  };

  const toggleFollowCreator = async (creatorId: string) => {
    const isFollowed = await StorageService.toggleFollowCreator(creatorId);
    const updated = await StorageService.getFollowedCreatorIds();
    setFollowedCreatorIds(updated);
  };

  // Itinerary calculation (includes user discoveries)
  const buildExperience = (customConstraints?: TravelerConstraints) => {
    const target = customConstraints || constraints;
    const plan = RecommendationEngine.buildItinerary(
      target,
      MUMBAI_PLACES,
      trafficCondition,
      weatherCondition,
      '08:00 PM',
      discoveries
    );
    setActiveItinerary(plan);
    setActiveDiff(null);
  };

  const acceptDiff = () => {
    if (activeDiff) {
      setActiveItinerary(activeDiff.newPlan);
      setActiveDiff(null);
      addNotification('Plan Updated', 'Your adapted itinerary has been confirmed.', 'success');
    }
  };

  const dismissDiff = () => setActiveDiff(null);

  // Replanning Triggers
  const triggerHeavyRain = () => {
    if (!activeItinerary) return;
    setWeatherCondition('rain');
    const diff = ReplanningEngine.handleHeavyRain(activeItinerary, constraints);
    setActiveDiff(diff);
    addNotification('Weather Alert: Rain', 'Outdoor stops swapped with weather-protected indoor alternatives.', 'warning');
  };

  const triggerTrafficSpike = () => {
    if (!activeItinerary) return;
    setTrafficCondition('heavy');
    const diff = ReplanningEngine.handleTrafficSpike(activeItinerary, constraints);
    setActiveDiff(diff);
    addNotification('Traffic Alert', 'Severe traffic detected. Travel times recalculated to protect return deadline.', 'warning');
  };

  const triggerTimeCut = (minutes: number = 70) => {
    if (!activeItinerary) return;
    const diff = ReplanningEngine.handleTimeReduction(activeItinerary, constraints, minutes);
    setActiveDiff(diff);
    addNotification('Time Cut: 70m', `Reachable boundary shrunk to guarantee return within ${minutes} min.`, 'info');
  };

  const triggerBudgetCut = (budget: number = 1000) => {
    if (!activeItinerary) return;
    const diff = ReplanningEngine.handleBudgetReduction(activeItinerary, constraints, budget);
    setActiveDiff(diff);
    addNotification('Budget Cut: ₹1000', 'Plan re-optimized for authentic street food & community gems.', 'info');
  };

  const resetDemoConditions = () => {
    setTrafficCondition('normal');
    setWeatherCondition('clear');
    setActiveDiff(null);
    const fresh = RecommendationEngine.buildItinerary(
      defaultConstraints,
      MUMBAI_PLACES,
      'normal',
      'clear',
      '08:00 PM',
      discoveries
    );
    setActiveItinerary(fresh);
    setConstraints(defaultConstraints);
    addNotification('Conditions Reset', 'Baseline normal weather & traffic restored.', 'info');
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        loginUser,
        signupUser,
        logoutUser,
        logout: logoutUser,
        updateProfile,
        activeLanguage,
        setLanguage: setActiveLanguage,
        t,
        translateText,
        discoveries,
        userDiscoveries: discoveries.filter(d => d.creatorId === user.id || !d.isDemoData),
        addDiscovery,
        deleteDiscovery,
        communities,
        joinedCommunityIds,
        createCommunity,
        joinCommunity,
        leaveCommunity,
        userRsvps,
        toggleEventRsvp,
        savedState,
        toggleSave,
        saveCurrentItinerary,
        deleteSavedItinerary,
        followedCreatorIds,
        toggleFollowCreator,
        constraints,
        setConstraints,
        activeItinerary,
        activeDiff,
        trafficCondition,
        weatherCondition,
        setTrafficCondition,
        setWeatherCondition,
        buildExperience,
        acceptDiff,
        dismissDiff,
        triggerHeavyRain,
        triggerTrafficSpike,
        triggerTimeCut,
        triggerBudgetCut,
        resetDemoConditions,
        notifications,
        dismissNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
