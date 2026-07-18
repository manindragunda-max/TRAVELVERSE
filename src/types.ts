export interface DestinationSuggestion {
  destination: string;
  matchingReason: string;
  estimatedBudget: number;
  bestTimeToVisit: string;
  topAttractions: string[];
  recommendedActivities: string[];
  idealDuration: string;
}

export interface PackingItem {
  name: string;
  status: "essential" | "optional";
  packed?: boolean; // client-side state
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  morning: {
    activities: string[];
    attractions: string[];
  };
  afternoon: {
    lunchSuggestion: string;
    sightseeing: string[];
  };
  evening: {
    sunsetNightActivities: string[];
    dinnerRecommendation: string;
  };
  transportation: string;
  estimatedDailyCost: number;
  transitTimes: string;
}

export interface BudgetBreakdown {
  transportation: number;
  accommodation: number;
  food: number;
  attractions: number;
  shopping: number;
  miscellaneous: number;
  totalCost: number;
  budgetStatus: "under_budget" | "within_budget" | "over_budget";
  costSavingTips: string[];
}

export interface HotelRecommendation {
  name: string;
  pricePerNight: number;
  rating: number;
  location: string;
  whyRecommended: string;
}

export interface RestaurantRecommendation {
  name: string;
  cuisine: string;
  avgPrice: number;
  signatureDish: string;
  recommendedFor: "Breakfast" | "Lunch" | "Dinner";
}

export interface LocalTips {
  transportationOptions: string[];
  currencyInfo: string;
  localLanguage: string;
  emergencyContacts: string[];
  safetyAdvice: string[];
  etiquette: string[];
  weatherTips: string;
  scamsToAvoid: string[];
  usefulApps: string[];
}

export interface BonusRecommendations {
  hiddenGems: string[];
  nearbyAttractions: string[];
  localMarkets: string[];
  shoppingAreas: string[];
  nightlife: string[];
  adventureActivities: string[];
  familyFriendly: string[];
  rainyDayAlternatives: string[];
}

export interface PackingChecklist {
  essentialDocuments: PackingItem[];
  clothing: PackingItem[];
  footwear: PackingItem[];
  electronics: PackingItem[];
  toiletries: PackingItem[];
  medicines: PackingItem[];
  accessories: PackingItem[];
  weatherSpecific: PackingItem[];
}

export interface TravelPlan {
  tripSummary: {
    destination: string;
    departureCity: string;
    dates: string;
    duration: number;
    travelers: number;
    budget: number;
    travelStyle: string;
    interests: string;
  };
  dayWiseItinerary: ItineraryDay[];
  budgetBreakdown: BudgetBreakdown;
  hotels: HotelRecommendation[];
  restaurants: RestaurantRecommendation[];
  packingChecklist: PackingChecklist;
  localTips: LocalTips;
  bonusRecommendations: BonusRecommendations;
}

export interface UserPreferences {
  departureCity: string;
  destination: string;
  dates: string;
  duration: number;
  travelers: number;
  budget: number;
  travelStyle: string;
  interests: string;
  accommodation: string;
  transportation: string;
  dietaryRestrictions: string;
  mustVisitPlaces: string;
}
