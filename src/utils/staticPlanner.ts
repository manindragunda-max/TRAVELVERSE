import { UserPreferences, TravelPlan, DestinationSuggestion, ItineraryDay, HotelRecommendation, RestaurantRecommendation, PackingItem, LocalTips, BonusRecommendations } from "../types";

// Helper to capitalize first letter of words
function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Simple deterministic pseudo-random generator to vary static recommendations beautifully
function getSeededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// --- Predefined Static Data Templates for Popular Destinations ---
const POPULAR_DESTINATIONS: Record<string, {
  attractions: string[];
  breakfasts: string[];
  lunches: string[];
  dinners: string[];
  cuisines: string[];
  dishes: string[];
  hotelPrefixes: string[];
  currency: string;
  language: string;
  emergency: string[];
  scams: string[];
  apps: string[];
  weather: string;
  hiddenGems: string[];
  markets: string[];
  nightlife: string[];
  adventures: string[];
}> = {
  "kyoto": {
    attractions: [
      "Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kinkaku-ji (Golden Pavilion)",
      "Kiyomizu-dera Temple", "Gion District", "Nijo Castle", "Nishiki Market",
      "Philosopher's Path", "Sanjusangen-do", "Kyoto Imperial Palace", "Tofuku-ji Temple"
    ],
    breakfasts: ["Gion Karyo", "Inoda Coffee", "Shigetsu Zen Cuisine", "Yojiya Cafe", "Kyoto Bistro"],
    lunches: ["Nishiki Market Stall", "Ramen Sen-no-Kaze", "Omen Ginkaku-ji", "Chao Chao Gyoza", "Honke Owariya"],
    dinners: ["Gion Nanba (Kaiseki)", "Pontocho Robin", "Mishima-tei (Sukiyaki)", "Tsubame", "Kyoto Katsugyu"],
    cuisines: ["Traditional Kaiseki", "Tonkotsu Ramen", "Tempura", "Soba & Udon", "Wagyu Sukiyaki"],
    dishes: ["Multi-course Kaiseki dinner", "Kyoto-style Ramen", "Handcrafted Matcha Soba", "Crispy Vegetable Tempura", "Sake-infused Wagyu beef"],
    hotelPrefixes: ["Ryokan Kuramaya", "The Thousand Kyoto", "Gion Heritage House", "Arashiyama Riverside Onsen", "Kyoto Central Boutique Hotel"],
    currency: "Japanese Yen (¥) • 1 USD ≈ 150 JPY",
    language: "Japanese • Useful: 'Arigatou gozaimasu' (Thank you), 'Sumimasen' (Excuse me)",
    emergency: ["Police: 110", "Ambulance/Fire: 119", "Tourist Hotline: +81-50-3786-2222"],
    scams: ["Overpriced tea house invitations in Gion", "Unregulated private taxis", "Hidden table charge fees at unauthorized Izakayas"],
    apps: ["Japan Travel by NAVITIME", "Google Translate", "Suica/PASMO app", "Yurekuru Call"],
    weather: "Temperate. October is autumn foliage season with mild sunny days around 18°C-22°C.",
    hiddenGems: ["Gio-ji Moss Temple", "Otagi Nenbutsu-ji (1200 stone statues)", "Murin-an Garden"],
    markets: ["Nishiki Market", "Toji Temple Antique Market (21st of each month)"],
    nightlife: ["Pontocho Alley Izakayas", "Bar Rocking Chair", "Gion Sake Bars"],
    adventures: ["Hozugawa River rafting", "Hiking Kurama to Kibune trail", "Cycling along Kamo River"],
  },
  "paris": {
    attractions: [
      "Eiffel Tower", "Louvre Museum", "Sainte-Chapelle", "Montmartre & Sacré-Cœur",
      "Musée d'Orsay", "Palace of Versailles", "Arc de Triomphe", "Tuileries Garden",
      "Notre-Dame Cathedral", "Seine River Cruise", "Latin Quarter"
    ],
    breakfasts: ["Café de Flore", "Les Deux Magots", "Angelina Paris", "Du Pain et des Idées", "Careette"],
    lunches: ["L'As du Fallafel", "Chez Alain Miam Miam", "Bistrot Paul Bert", "Breizh Café", "Le Comptoir de La Gastronomie"],
    dinners: ["Le Jules Verne (Eiffel Tower)", "Frenchie", "Le Train Bleu", "Bouillon Chartier", "Le Coupe-Chou"],
    cuisines: ["French Haute Cuisine", "Gourmet Crepes & Galettes", "Authentic Parisian Bistro", "Middle Eastern Fusion", "Modern French Gastronomy"],
    dishes: ["Coq au Vin", "Savory Buckwheat Galettes", "Duck Confit with Herb Potatoes", "Freshly Baked Croissant & Macarons", "Snail in Garlic Butter (Escargots)"],
    hotelPrefixes: ["Hotel Regina Louvre", "Les Jardins du Marais", "Hotel Caron de Beaumarchais", "Grand Hotel Saint-Michel", "Le Bristol Paris"],
    currency: "Euro (€) • 1 USD ≈ 0.92 EUR",
    language: "French • Useful: 'Bonjour' (Hello), 'S'il vous plaît' (Please), 'Merci' (Thank you)",
    emergency: ["General Emergency: 112", "Police: 17", "Ambulance: 15"],
    scams: ["Friendship bracelet scam around Sacré-Cœur", "Petition signature pickpockets near Louvre", "Fake taxi drivers at CDG airport"],
    apps: ["Bonjour RATP", "Citymapper", "G7 Taxi", "TheFork (for restaurant bookings)"],
    weather: "Variable. September is pleasant and warm, perfect for walking along the Seine (15°C-22°C).",
    hiddenGems: ["La Petite Ceinture (abandoned railway)", "Musée de la Chasse et de la Nature", "Square du Vert-Galant"],
    markets: ["Marché d'Aligre", "Rue Mouffetard Food Market", "Les Puces de Saint-Ouen (flea market)"],
    nightlife: ["Le Marais cocktail lounges", "Jazz Club Etoile", "Belleville indie bars"],
    adventures: ["Seine river night kayaking", "Cycling tour around Versailles forest", "Catacombs exploration"],
  },
  "tokyo": {
    attractions: [
      "Shibuya Crossing", "Sensō-ji Temple", "teamLab Planets / Borderless",
      "Meiji Jingu Shrine", "Harajuku Takeshita Street", "Akihabara Electric Town",
      "Shinjuku Gyoen National Garden", "Tokyo Skytree", "Tsukiji Outer Market", "Roppongi Hills"
    ],
    breakfasts: ["Tsukiji Outer Market Stalls", "Bills Omotesando", "Cafe Aoyama", "Sarabeth's Tokyo", "Sake-kasu Bread bakery"],
    lunches: ["Ichiran Ramen Shibuya", "Kura Sushi", "Afuri Ramen Ebisu", "Tempura Tsunahachi", "Gyukatsu Motomura"],
    dinners: ["Robot Restaurant district bistro", "Kagurazaka Ishikawa", "New York Grill (Park Hyatt)", "Omoide Yokocho Yakitori", "Ginza Ukai Tei"],
    cuisines: ["Edomae Sushi", "Yuzu Shio Ramen", "Gourmet Tempura", "Charcoal Yakitori", "Teppanyaki Wagyu"],
    dishes: ["Chef's choice Nigiri platter", "Yuzu Sea Salt Ramen", "Crispy Tiger Prawn Tempura", "Glazed Chicken & Scallion Skewers", "A5 Miyazaki Wagyu beef steak"],
    hotelPrefixes: ["Keio Plaza Shinjuku", "The Gate Hotel Kaminarimon", "Shibuya Stream Excel", "Hotel Gracery Shinjuku", "Park Hyatt Tokyo"],
    currency: "Japanese Yen (¥) • 1 USD ≈ 150 JPY",
    language: "Japanese • Useful: 'Konnichiwa' (Hello), 'Kore wa ikura desu ka' (How much is this?)",
    emergency: ["Police: 110", "Ambulance/Fire: 119", "Tourist Center: +81-3-3201-3331"],
    scams: ["Kabukicho touts offering 'free' drinks", "Overpriced cover charges at Host clubs", "Fake street charities"],
    apps: ["Suica card in Apple Wallet", "Tokyo Subway Navigation", "Google Maps", "Japan Travel by NAVITIME"],
    weather: "Sunny and crisp. November is gorgeous with ginkgo autumn foliage and clean skies (10°C-17°C).",
    hiddenGems: ["Yanaka Ginza (old Tokyo town)", "Gotokuji Cat Temple", "Todoroki Valley walking trail"],
    markets: ["Ameyoko Shopping Street", "Tsukiji Outer Market", "Oedo Antique Market"],
    nightlife: ["Golden Gai tiny alley bars", "Shinjuku Neo-arcade bars", "Roppongi lounges"],
    adventures: ["Go-Karting through Akihabara", "Climbing Mount Takao at sunrise", "Virtual reality arenas in Joypolis"],
  }
};

// Default template for fallback/custom destinations
const DEFAULT_TEMPLATE = {
  attractions: [
    "Historic Old Town Square", "Panoramic City Lookout Tower", "Local Botanical Gardens",
    "Modern Art & Culture Museum", "Scenic Riverfront Boardwalk", "Grand Cathedral / Landmark",
    "Traditional Heritage Market", "Vibrant Arts District", "Central Public park", "Hidden Forest Trail"
  ],
  breakfasts: ["The Local Cafe", "Bayside Bakery", "Sunrise Bistro", "The Daily Grind", "Organic Corner"],
  lunches: ["Town Square Tavern", "The Street Food Market", "Riverside Grill", "Heritage Bistro", "Spicy Noodles House"],
  dinners: ["The Grand Dining Room", "Sunset Marina Bistro", "Under the Stars Grill", "The Chef's Table", "Local Fusion Kitchen"],
  cuisines: ["Regional Heritage Fusion", "Gourmet Farm-to-Table", "Contemporary Local Cuisine", "Fresh Seafood Specialties", "Traditional Family Recipes"],
  dishes: ["Slow-roasted signature dish", "Fresh locally caught seafood platter", "Chef's special dessert sampler", "Traditional garden herb salad", "Flame-grilled artisan platter"],
  hotelPrefixes: ["Grand Plaza Hotel", "Riverside Heritage Lodge", "Boutique Central Suites", "Secluded Nature Resort", "The Urban Explorer Inn"],
  currency: "Local Currency / USD accepted",
  language: "English / Regional dialect",
  emergency: ["General Emergency: 112 or 911", "Local Tourist Helpline"],
  scams: ["Unmetered taxis near public squares", "Street vendors charging inflated prices without menus", "Pickpockets in crowded transit hubs"],
  apps: ["Google Maps", "Google Translate", "Local Ride-share app", "TripAdvisor"],
  weather: "Mild and pleasant, ideal for outdoor sightseeing and leisure walking.",
  hiddenGems: ["The secret courtyard garden", "An underground historical passage", "Scenic hillside overlook"],
  markets: ["Weekend Flea & Craft Market", "Central Fresh Food Bazaar"],
  nightlife: ["Artisan cocktail lounges", "Live acoustic music gardens", "Scenic rooftop terrace"],
  adventures: ["Walking city exploration tour", "Local scenic bike rentals", "Sunset photography tour"],
};

// -------------------------------------------------------------------------
// Core Suggestions Generator (Mock dynamic client version)
// -------------------------------------------------------------------------
export function suggestClientDestinations(
  departureCity: string, 
  budget: number, 
  travelStyle: string, 
  interests: string
): DestinationSuggestion[] {
  // Deterministic randomize using departureCity + travelStyle + interests as seed
  const rand = getSeededRandom(departureCity + travelStyle + interests);

  const pool = [
    {
      destination: "Kyoto, Japan",
      matchingReason: `Perfect match for ${travelStyle} travel with interests in ${interests || "culture"}. Offers breathtaking ancient temples, tranquil bamboo gardens, and supreme culinary dining.`,
      estimatedBudget: Math.min(3200, Math.max(1200, Math.round(budget * 0.85))),
      bestTimeToVisit: "October - November (Autumn Leaves) & April (Cherry Blossoms)",
      topAttractions: ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Golden Pavilion"],
      recommendedActivities: ["Participating in traditional tea ceremony", "Scenic walking in historic Gion", "Renting traditional Yukata kimono"],
      idealDuration: "5 - 7 Days"
    },
    {
      destination: "Paris, France",
      matchingReason: `Exceptional European experience for interests in ${interests || "art"}. Perfect for ${travelStyle} looking to wander down the Seine and explore world-class art collections.`,
      estimatedBudget: Math.min(3800, Math.max(1500, Math.round(budget * 0.9))),
      bestTimeToVisit: "April - June (Spring) & September - October (Autumn)",
      topAttractions: ["The Louvre Museum", "Eiffel Tower", "Sainte-Chapelle Cathedral"],
      recommendedActivities: ["Seine sunset river cruise", "Cozy Parisian bakery walking tour", "Exploring Montmartre art market"],
      idealDuration: "4 - 6 Days"
    },
    {
      destination: "Rome, Italy",
      matchingReason: `Drenched in ancient history and culinary art, which aligns perfectly with your interests. Offers rich monumental architecture and authentic wood-fired gastronomy.`,
      estimatedBudget: Math.min(2900, Math.max(1100, Math.round(budget * 0.8))),
      bestTimeToVisit: "April - May & September - October",
      topAttractions: ["The Colosseum & Forum", "Vatican Museums", "Trevi Fountain"],
      recommendedActivities: ["Handmade pasta/pizza cooking workshop", "Colosseum night tour", "Gelato hopping in Trastevere"],
      idealDuration: "4 - 5 Days"
    },
    {
      destination: "Bali, Indonesia",
      matchingReason: `Provides an incredible budget-friendly tropical paradise. Perfect for a ${travelStyle} trip focused on ${interests || "nature and relaxation"}.`,
      estimatedBudget: Math.min(1800, Math.max(800, Math.round(budget * 0.6))),
      bestTimeToVisit: "May - September (Dry Season)",
      topAttractions: ["Ubud Monkey Forest", "Uluwatu Sunset Temple", "Tegalalang Rice Terraces"],
      recommendedActivities: ["Sunrise hike up Mount Batur", "Balinese traditional massage", "Surfing lessons in Canggu"],
      idealDuration: "6 - 10 Days"
    },
    {
      destination: "Tokyo, Japan",
      matchingReason: `An immersive fusion of ultra-modern tech skyscrapers and serene historical shrines. Matches your requested ${travelStyle} style and interests perfectly.`,
      estimatedBudget: Math.min(4200, Math.max(1800, Math.round(budget * 0.92))),
      bestTimeToVisit: "October - December & March - May",
      topAttractions: ["Shibuya Crossing", "Senso-ji Ancient Temple", "teamLab Planets digital museum"],
      recommendedActivities: ["Shopping high-tech Akihabara gadgets", "Enjoying fresh sushi at Tsukiji market", "Viewing neon skyline from Skytree"],
      idealDuration: "5 - 8 Days"
    },
    {
      destination: "London, United Kingdom",
      matchingReason: `A hub of global royalty, theatre, and free world-class museums. Perfectly matches interests in ${interests || "history and sightseeing"}.`,
      estimatedBudget: Math.min(3600, Math.max(1600, Math.round(budget * 0.88))),
      bestTimeToVisit: "May - August & December (Winter Markets)",
      topAttractions: ["Tower of London", "British Museum", "London Eye"],
      recommendedActivities: ["Watching a West End award musical", "Afternoon classic English Tea", "Borough Food Market tour"],
      idealDuration: "4 - 6 Days"
    }
  ];

  // Pick exactly 5 based on some pseudo-random sorting
  const shuffled = [...pool].sort(() => rand() - 0.5);
  return shuffled.slice(0, 5);
}

// -------------------------------------------------------------------------
// Core Plan Generator (Mock dynamic client version)
// -------------------------------------------------------------------------
export function generateClientItinerary(prefs: UserPreferences): TravelPlan {
  const normDest = prefs.destination.toLowerCase();
  
  // Find which template matches best
  let template = DEFAULT_TEMPLATE;
  let matchedKey = "default";
  
  if (normDest.includes("kyoto")) {
    template = POPULAR_DESTINATIONS.kyoto;
    matchedKey = "kyoto";
  } else if (normDest.includes("paris")) {
    template = POPULAR_DESTINATIONS.paris;
    matchedKey = "paris";
  } else if (normDest.includes("tokyo")) {
    template = POPULAR_DESTINATIONS.tokyo;
    matchedKey = "tokyo";
  } else {
    // Dynamically adjust default template to customize names of hotels & restaurants based on destination name!
    const capDest = capitalizeWords(prefs.destination.split(",")[0]);
    template = {
      ...DEFAULT_TEMPLATE,
      hotelPrefixes: [
        `The ${capDest} Grand Palace`,
        `Riverside ${capDest} Heritage Lodge`,
        `Boutique ${capDest} Central Suites`,
        `${capDest} Secluded Nature Resort`,
        `The ${capDest} Urban Explorer Inn`
      ],
      breakfasts: [
        `${capDest} Sunrise Cafe`,
        `${capDest} Artisan Bakery`,
        `Bayside ${capDest} Bistro`,
        `The Daily Grind ${capDest}`,
        `Organic Corner ${capDest}`
      ],
      lunches: [
        `${capDest} Square Tavern`,
        `The Street Food Market of ${capDest}`,
        `${capDest} Riverside Grill`,
        `Heritage ${capDest} Bistro`,
        `Central ${capDest} Bowl`
      ],
      dinners: [
        `The Grand ${capDest} Dining Room`,
        `${capDest} Sunset Marina Bistro`,
        `Under the Stars ${capDest} Grill`,
        `The ${capDest} Chef's Table`,
        `Traditional ${capDest} Heritage Kitchen`
      ]
    };
  }

  const rand = getSeededRandom(prefs.destination + prefs.travelStyle + prefs.duration);

  // --- 1. Day-Wise Itinerary Generator ---
  const dayWiseItinerary: ItineraryDay[] = [];
  const totalDays = prefs.duration || 5;

  for (let i = 1; i <= totalDays; i++) {
    const attractionPool = [...template.attractions];
    const morningAttr = attractionPool[(i * 2 - 2) % attractionPool.length];
    const afternoonAttr = attractionPool[(i * 2 - 1) % attractionPool.length];
    
    const lunch = template.lunches[i % template.lunches.length];
    const dinner = template.dinners[i % template.dinners.length];

    // Determine some style specific activities
    let morningActs = [
      `Begin your morning with a refreshing walking tour towards the famous ${morningAttr}.`,
      `Arrive early to beat the main tourist crowds and secure beautiful panoramic photos.`,
      `Immerse yourself in the surrounding architectural layouts and vibrant local craft stalls.`
    ];

    let afternoonActs = [
      `Relish a highly recommended lunch of local favorites at ${lunch}.`,
      `Head over to the historic ${afternoonAttr} and enjoy guided historical commentaries.`,
      `Stroll through the scenic side streets, browsing local artisanal shops and cafes.`
    ];

    let eveningActs = [
      `Witness a spectacular sunset from a scenic overlook or nearby viewing bridge.`,
      `Gather for an exceptional and atmospheric dinner reservation at ${dinner}.`,
      `Conclude your day with a peaceful night walk to explore the lighted alleys and ambient streets.`
    ];

    // Tailor slightly based on travelStyle
    if (prefs.travelStyle.toLowerCase().includes("adventure")) {
      morningActs.push("Join a guided outdoor climbing or dynamic exploration trial.");
      afternoonActs.push("Engage in thrilling rental biking or local hiking tracks.");
    } else if (prefs.travelStyle.toLowerCase().includes("romantic")) {
      morningActs.push("Enjoy a private scenic garden stroll with fresh local coffee.");
      eveningActs.push("Relax with premium twilight views and fine dining.");
    } else if (prefs.travelStyle.toLowerCase().includes("family")) {
      afternoonActs.push("Participate in a highly interactive local hands-on craft workshop.");
      eveningActs.push("Enjoy family-friendly light shows or casual street foods.");
    }

    dayWiseItinerary.push({
      dayNumber: i,
      title: i === 1 ? `Arrival & Classic Explorations` :
             i === totalDays ? `Farewell & Heritage Shopping` :
             `Uncovering Hidden Local Treasures (Day ${i})`,
      morning: {
        activities: morningActs,
        attractions: [morningAttr]
      },
      afternoon: {
        lunchSuggestion: lunch,
        sightseeing: [afternoonAttr]
      },
      evening: {
        sunsetNightActivities: eveningActs,
        dinnerRecommendation: dinner
      },
      transportation: i % 2 === 0 ? "Utilized city subway pass with short walking loops" : "Scenic walk combined with local licensed ride-shares",
      estimatedDailyCost: Math.round((prefs.budget * 0.3) / totalDays) + 20,
      transitTimes: "15-25 mins between attractions to minimize travel overhead"
    });
  }

  // --- 2. Budget Breakdown Generator ---
  // Ensure we partition the budget realistically
  const totalBudget = prefs.budget || 2000;
  const travelers = prefs.travelers || 1;

  // Let's design a realistic budget allocation targeting ~88% of user's input budget so it shows "✅ Within Budget"
  const accommodationPct = 0.35;
  const transportPct = 0.18;
  const foodPct = 0.22;
  const attractionsPct = 0.10;
  const shoppingPct = 0.05;
  const miscPct = 0.03;

  const totalCost = Math.round(totalBudget * 0.9);
  const budgetBreakdown = {
    accommodation: Math.round(totalCost * accommodationPct),
    transportation: Math.round(totalCost * transportPct),
    food: Math.round(totalCost * foodPct),
    attractions: Math.round(totalCost * attractionsPct),
    shopping: Math.round(totalCost * shoppingPct),
    miscellaneous: Math.round(totalCost * miscPct),
    totalCost: totalCost,
    budgetStatus: (totalCost < totalBudget) ? "under_budget" : (totalCost === totalBudget) ? "within_budget" : "over_budget" as any,
    costSavingTips: [
      "Purchase a multi-day unlimited city transportation pass on Day 1 rather than single fares.",
      "Opt for the bakery or street food stalls for lunch to save your budget for premium dining options at night.",
      "Book tourist attraction tickets online in advance to bypass queues and secure direct-to-venue discounts.",
      "Travel with a reusable water bottle and fill it up at authorized city heritage fountains."
    ]
  };

  // --- 3. Hotel Recommendations ---
  const hotels: HotelRecommendation[] = [];
  const hotelPfx = [...template.hotelPrefixes];
  
  // Custom hotel stars and prices matching budget tier
  const pricingTier = totalBudget / (totalDays * travelers);
  const standardPrice = pricingTier > 250 ? 280 : pricingTier > 120 ? 140 : 75;

  hotels.push({
    name: hotelPfx[0] || "Premier Grand Hotel",
    pricePerNight: Math.round(standardPrice * 1.3),
    rating: 4.8,
    location: "City Center • 5 mins walk to major transit",
    whyRecommended: `Highly rated premium experience. Guests love the spacious rooms, outstanding panoramic views, and proximity to major restaurants.`
  });
  hotels.push({
    name: hotelPfx[1] || "Riverside Boutique Suites",
    pricePerNight: Math.round(standardPrice * 0.95),
    rating: 4.6,
    location: "Artisanal / Old Town Quarter",
    whyRecommended: `Perfect balance of comfort and local culture. Offers charming architecture, complimentary breakfast, and peaceful riverbank strolls.`
  });
  hotels.push({
    name: hotelPfx[2] || "Cozy Explorer Inn",
    pricePerNight: Math.round(standardPrice * 0.65),
    rating: 4.3,
    location: "Quiet Residential Hub • Near local subway",
    whyRecommended: `Outstanding budget-friendly hotel. Very clean amenities, friendly English-speaking staff, and excellent value for money.`
  });

  // --- 4. Restaurant Recommendations ---
  const restaurants: RestaurantRecommendation[] = [];
  for (let i = 0; i < 5; i++) {
    const isDietVeg = prefs.dietaryRestrictions.toLowerCase().includes("veg");
    const veggieDish = "Steamed local harvest with truffle oil & organic herb dipping sauces";
    
    restaurants.push({
      name: i === 0 ? template.breakfasts[0] : i === 1 ? template.lunches[0] : i === 2 ? template.dinners[0] : i === 3 ? template.lunches[1] : template.dinners[1],
      cuisine: template.cuisines[i % template.cuisines.length],
      avgPrice: i % 2 === 0 ? 18 : 35,
      signatureDish: isDietVeg ? veggieDish : template.dishes[i % template.dishes.length],
      recommendedFor: i === 0 ? "Breakfast" : (i === 1 || i === 3) ? "Lunch" : "Dinner"
    });
  }

  // --- 5. Packing Checklist ---
  const packingChecklist: any = {
    essentialDocuments: [
      { name: "Passport / National ID & Visas", status: "essential" },
      { name: "Printed Flight & Hotel Bookings", status: "essential" },
      { name: "Digital Travel Insurance Documents", status: "essential" },
      { name: "Emergency cash & debit cards", status: "essential" }
    ],
    clothing: [
      { name: "Lightweight layerable shirts & tees", status: "essential" },
      { name: "Versatile smart-casual trousers / jeans", status: "essential" },
      { name: "Light windbreaker jacket for evenings", status: "essential" },
      { name: "Elegant evening dinner attire", status: "optional" }
    ],
    footwear: [
      { name: "Highly comfortable running / walking shoes", status: "essential" },
      { name: "Breathable light socks (multiple pairs)", status: "essential" },
      { name: "Slip-on sandals / casual flats", status: "optional" }
    ],
    electronics: [
      { name: "Universal wall power plug adapter", status: "essential" },
      { name: "Smartphone high-capacity charger", status: "essential" },
      { name: "Portable power bank (10,000mAh+)", status: "essential" },
      { name: "Noise-cancelling headphones", status: "optional" }
    ],
    toiletries: [
      { name: "Travel-sized toothpaste & brush", status: "essential" },
      { name: "Hydrating moisturizer & SPF sunscreen", status: "essential" },
      { name: "Personal grooming kit", status: "optional" }
    ],
    medicines: [
      { name: "Personal prescription medications", status: "essential" },
      { name: "Motion sickness / headache pain relievers", status: "essential" },
      { name: "Blister protection plasters / band-aids", status: "essential" }
    ],
    accessories: [
      { name: "Polarized UV sunglasses", status: "optional" },
      { name: "Compact travel folding umbrella", status: "essential" },
      { name: "Secure RFID anti-theft waist pack", status: "optional" }
    ],
    weatherSpecific: [
      { name: "Ultra-compact dry rain jacket", status: "essential" },
      { name: "Breathable wide-brim sun hat", status: "optional" }
    ]
  };

  // --- 6. Local Travel Tips ---
  const localTips: LocalTips = {
    transportationOptions: [
      "City Subway Pass: Excellent coverage, punctual, and safe.",
      "Local Walking: Recommended for historic, narrow alleys where cars are banned.",
      "App-based Licensed Ride-Shares: Convenient for late nights after transit closes."
    ],
    currencyInfo: template.currency,
    localLanguage: template.language,
    emergencyContacts: template.emergency,
    safetyAdvice: [
      "Keep your wallets/purses secured on the front in crowded train stations.",
      "Ensure you use only officially branded city taxicabs with visible meters."
    ],
    etiquette: [
      "Tipping is generally not expected and can sometimes be considered impolite.",
      "Speak in soft, pleasant tones when inside buses, subway cars, and sacred shrines.",
      "Always ask for permission before taking photos of local shop owners or residents."
    ],
    weatherTips: template.weather,
    scamsToAvoid: template.scams,
    usefulApps: template.apps
  };

  // --- 7. Bonus Recommendations ---
  const bonusRecommendations: BonusRecommendations = {
    hiddenGems: template.hiddenGems,
    nearbyAttractions: [
      "Charming old country hills (30 mins train ride)",
      "Traditional hot spring bathhouses in the neighboring district"
    ],
    localMarkets: template.markets,
    shoppingAreas: ["Central High Street District", "Historical Souvenir Alleys"],
    nightlife: template.nightlife,
    adventureActivities: template.adventures,
    familyFriendly: [
      "Interactive digital playground & science exhibit",
      "Green central park with children picnic gardens"
    ],
    rainyDayAlternatives: [
      "Immerse yourself inside the local historical art museums",
      "Spend an afternoon participating in a traditional culinary class"
    ]
  };

  return {
    tripSummary: {
      destination: prefs.destination,
      departureCity: prefs.departureCity,
      dates: prefs.dates,
      duration: totalDays,
      travelers: travelers,
      budget: prefs.budget,
      travelStyle: prefs.travelStyle,
      interests: prefs.interests
    },
    dayWiseItinerary,
    budgetBreakdown,
    hotels,
    restaurants,
    packingChecklist,
    localTips,
    bonusRecommendations
  };
}
