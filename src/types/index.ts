// Bhraman - Comprehensive Domain Types & Interfaces
// Strictly PS6: Local & Experiences

export type TransportMode = 'walk' | 'bicycle' | 'bike' | 'auto' | 'cab';
export type TravelerGroup = 'solo' | 'couple' | 'friends' | 'family';
export type Category = 
  | 'food' 
  | 'culture' 
  | 'photography' 
  | 'nature' 
  | 'hidden_gem' 
  | 'heritage' 
  | 'quirky' 
  | 'nightlife' 
  | 'peaceful'
  | 'shopping';

export type ProvenanceType = 'organic' | 'community' | 'verified' | 'sponsored' | 'user_contributed';
export type TrafficCondition = 'normal' | 'heavy' | 'severe';
export type WeatherCondition = 'clear' | 'rain' | 'extreme_heat';

export type SupportedLanguage = 
  | 'en' // English
  | 'hi' // Hindi (हिन्दी)
  | 'mr' // Marathi (मराठी)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'bn' // Bengali (বাংলা)
  | 'ta' // Tamil (தமிழ்)
  | 'te' // Telugu (తెలుగు)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ml' // Malayalam (മലയാളം)
  | 'pa'; // Punjabi (ਪੰਜਾਬੀ)

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  bio: string;
  homeCity: string;
  languages: SupportedLanguage[];
  languagesSpoken?: string[];
  interests: Category[];
  preferredTransport: TransportMode;
  explorerPoints: number;
  level: number;
  badges: string[];
  roles?: string[];
  reputation?: {
    points: number;
    level: string;
    badges: string[];
  };
  isDemoUser?: boolean;
  createdAt: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

export interface Place {
  id: string;
  name: string;
  category: Category;
  tags: string[];
  description: string;
  neighborhood: string;
  coordinates: Coordinates;
  averageCostPerPerson: number;
  typicalStayMinutes: number;
  openingHours: string;
  isOpen: boolean;
  isIndoor: boolean;
  provenance: ProvenanceType;
  verificationNote?: string;
  rating: number;
  reviewCount: number;
  authenticityScore: number; // 0 - 100
  uniquenessScore: number;    // 0 - 100
  imageUrl: string;
  isDemoData?: boolean;
  isUserCreated?: boolean;
  originalLanguage?: SupportedLanguage;
  sponsorDetails?: {
    sponsorName: string;
    campaignTagline: string;
  };
}

export interface LocalDiscovery {
  id: string;
  title: string;
  description: string;
  localTip?: string;
  creatorId?: string;
  creatorName?: string;
  creatorHandle?: string;
  creatorAvatar?: string;
  communityId?: string;
  communityName?: string;
  coordinates: Coordinates;
  neighborhood?: string;
  category: Category;
  averageCostPerPerson?: number;
  typicalStayMinutes?: number;
  likesCount: number;
  commentsCount: number;
  verifiedDaysAgo?: number;
  imageUrl: string;
  isDemoData?: boolean;
  isUserCreated?: boolean;
  provenance?: ProvenanceType;
  originalLanguage?: SupportedLanguage;
  translatedText?: string;
  translatedLanguage?: SupportedLanguage;
  createdAt?: string;
}

export interface CommunityEvent {
  id: string;
  communityId?: string;
  title: string;
  dateText: string;
  timeText: string;
  meetingPoint: string;
  capacity: number;
  participantsCount: number;
  fee: number;
  hostName: string;
  hostId?: string;
  description: string;
  language?: SupportedLanguage;
  rsvpUserIds?: string[];
  isDemoData?: boolean;
  isUserCreated?: boolean;
}

export interface Community {
  id: string;
  name: string;
  tagline: string;
  description: string;
  rules?: string;
  category: Category;
  location?: string;
  membersCount: number;
  memberUserIds?: string[];
  creatorId: string;
  creatorName: string;
  coverImage: string;
  primaryLanguage?: SupportedLanguage;
  upcomingEvent?: CommunityEvent;
  isDemoData?: boolean;
  isUserCreated?: boolean;
  createdAt?: string;
}

export interface Creator {
  id: string;
  userId?: string;
  name: string;
  handle: string;
  avatarUrl: string;
  level: number;
  explorerPoints: number;
  reputationPercentage: number;
  expertise: string[];
  communityId: string;
  communityName: string;
  discoveriesCount: number;
  helpfulReviewsCount: number;
  eventsCount: number;
  badges: string[];
  bio: string;
  languages?: SupportedLanguage[];
  isDemoData?: boolean;
  isUserCreated?: boolean;
}

export interface TravelerConstraints {
  baseLocation: {
    name: string;
    coordinates: Coordinates;
  };
  availableMinutes: number;
  budget: number;
  groupSize: number;
  groupType: TravelerGroup;
  interests: Category[];
  transportMode: TransportMode;
  requiresReturn: boolean;
  minimumBufferMinutes: number;
}

export interface ScoreBreakdown {
  preferenceMatch: number; // 30%
  feasibility: number;      // 20%
  travelEfficiency: number; // 15%
  communityTrust: number;   // 10%
  freshness: number;        // 10%
  ratingQuality: number;    // 5%
  uniqueness: number;       // 5%
  budgetFit: number;        // 5%
  totalScore: number;
}

export interface ItineraryStop {
  stopIndex: number;
  place: Place;
  arrivalTime: string;
  departureTime: string;
  travelTimeMinutes: number;
  travelDistanceKm: number;
  travelCost: number;
  activityDurationMinutes: number;
  activityCost: number;
  totalLegCost: number;
  whyChosen: string;
  scoreBreakdown: ScoreBreakdown;
}

export interface MicroItinerary {
  id: string;
  title?: string;
  createdAt: string;
  baseLocation: {
    name: string;
    coordinates: Coordinates;
  };
  startTime: string;
  endTime: string;
  totalTimeMinutes: number;
  totalCost: number;
  budgetLimit: number;
  safetyBufferMinutes: number;
  stops: ItineraryStop[];
  returnTravelMinutes: number;
  returnTravelCost: number;
  confidence: 'High' | 'Moderate';
  confidenceReason: string;
  trafficCondition: TrafficCondition;
  weatherCondition: WeatherCondition;
  groupSize: number;
  transportMode: TransportMode;
  constraints?: TravelerConstraints;
}

export interface ReplanningDiff {
  trigger: 'heavy_rain' | 'traffic_spike' | 'time_cut' | 'budget_cut' | 'place_unavailable';
  reason: string;
  removedStops: Place[];
  addedStops: Place[];
  oldDurationMinutes: number;
  newDurationMinutes: number;
  oldCost: number;
  newCost: number;
  oldBufferMinutes: number;
  newBufferMinutes: number;
  newPlan: MicroItinerary;
}

export interface ProviderAnalytics {
  businessName: string;
  viewsTotal: number;
  savesTotal: number;
  itineraryInclusions: number;
  inquiries: number;
  topTravelerInterests: { category: string; percentage: number }[];
  peakDiscoveryTimes: { timeRange: string; count: number }[];
  isDemoData?: boolean;
}

export interface ParsedNLPResult {
  rawText: string;
  detectedLanguage: SupportedLanguage;
  languageConfidence: number;
  constraints: Partial<TravelerConstraints>;
  confidence: number;
  missingFields: string[];
}

export interface SavedState {
  placeIds: string[];
  discoveryIds: string[];
  communityIds: string[];
  eventIds: string[];
  itineraries: MicroItinerary[];
}

export interface SearchResultItem {
  id: string;
  type: 'place' | 'discovery' | 'community' | 'creator' | 'event';
  title: string;
  subtitle: string;
  category: string;
  imageUrl?: string;
  rating?: number;
  cost?: number;
  provenance?: ProvenanceType;
  isDemoData?: boolean;
  item: Place | LocalDiscovery | Community | Creator | CommunityEvent;
}
