import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client to prevent startup crashes when API key is not yet set
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please set your Gemini API key in the Secrets/Settings tab.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// -------------------------------------------------------------------------
// JSON Schemas for Gemini Enforced Responses
// -------------------------------------------------------------------------

const destinationSuggestionsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      destination: { type: Type.STRING },
      matchingReason: { type: Type.STRING },
      estimatedBudget: { type: Type.INTEGER },
      bestTimeToVisit: { type: Type.STRING },
      topAttractions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      recommendedActivities: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      idealDuration: { type: Type.STRING },
    },
    required: [
      "destination",
      "matchingReason",
      "estimatedBudget",
      "bestTimeToVisit",
      "topAttractions",
      "recommendedActivities",
      "idealDuration",
    ],
  },
};

const travelPlanSchema = {
  type: Type.OBJECT,
  properties: {
    tripSummary: {
      type: Type.OBJECT,
      properties: {
        destination: { type: Type.STRING },
        departureCity: { type: Type.STRING },
        dates: { type: Type.STRING },
        duration: { type: Type.INTEGER },
        travelers: { type: Type.INTEGER },
        budget: { type: Type.INTEGER },
        travelStyle: { type: Type.STRING },
        interests: { type: Type.STRING },
      },
      required: [
        "destination",
        "departureCity",
        "dates",
        "duration",
        "travelers",
        "budget",
        "travelStyle",
        "interests",
      ],
    },
    dayWiseItinerary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          morning: {
            type: Type.OBJECT,
            properties: {
              activities: { type: Type.ARRAY, items: { type: Type.STRING } },
              attractions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["activities", "attractions"],
          },
          afternoon: {
            type: Type.OBJECT,
            properties: {
              lunchSuggestion: { type: Type.STRING },
              sightseeing: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["lunchSuggestion", "sightseeing"],
          },
          evening: {
            type: Type.OBJECT,
            properties: {
              sunsetNightActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
              dinnerRecommendation: { type: Type.STRING },
            },
            required: ["sunsetNightActivities", "dinnerRecommendation"],
          },
          transportation: { type: Type.STRING },
          estimatedDailyCost: { type: Type.INTEGER },
          transitTimes: { type: Type.STRING },
        },
        required: [
          "dayNumber",
          "title",
          "morning",
          "afternoon",
          "evening",
          "transportation",
          "estimatedDailyCost",
          "transitTimes",
        ],
      },
    },
    budgetBreakdown: {
      type: Type.OBJECT,
      properties: {
        transportation: { type: Type.INTEGER },
        accommodation: { type: Type.INTEGER },
        food: { type: Type.INTEGER },
        attractions: { type: Type.INTEGER },
        shopping: { type: Type.INTEGER },
        miscellaneous: { type: Type.INTEGER },
        totalCost: { type: Type.INTEGER },
        budgetStatus: { type: Type.STRING },
        costSavingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        "transportation",
        "accommodation",
        "food",
        "attractions",
        "shopping",
        "miscellaneous",
        "totalCost",
        "budgetStatus",
        "costSavingTips",
      ],
    },
    hotels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          pricePerNight: { type: Type.INTEGER },
          rating: { type: Type.NUMBER },
          location: { type: Type.STRING },
          whyRecommended: { type: Type.STRING },
        },
        required: ["name", "pricePerNight", "rating", "location", "whyRecommended"],
      },
    },
    restaurants: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          cuisine: { type: Type.STRING },
          avgPrice: { type: Type.INTEGER },
          signatureDish: { type: Type.STRING },
          recommendedFor: { type: Type.STRING },
        },
        required: ["name", "cuisine", "avgPrice", "signatureDish", "recommendedFor"],
      },
    },
    packingChecklist: {
      type: Type.OBJECT,
      properties: {
        essentialDocuments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, status: { type: Type.STRING } },
            required: ["name", "status"],
          },
        },
        clothing: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, status: { type: Type.STRING } },
            required: ["name", "status"],
          },
        },
        footwear: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, status: { type: Type.STRING } },
            required: ["name", "status"],
          },
        },
        electronics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, status: { type: Type.STRING } },
            required: ["name", "status"],
          },
        },
        toiletries: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, status: { type: Type.STRING } },
            required: ["name", "status"],
          },
        },
        medicines: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, status: { type: Type.STRING } },
            required: ["name", "status"],
          },
        },
        accessories: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, status: { type: Type.STRING } },
            required: ["name", "status"],
          },
        },
        weatherSpecific: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, status: { type: Type.STRING } },
            required: ["name", "status"],
          },
        },
      },
      required: [
        "essentialDocuments",
        "clothing",
        "footwear",
        "electronics",
        "toiletries",
        "medicines",
        "accessories",
        "weatherSpecific",
      ],
    },
    localTips: {
      type: Type.OBJECT,
      properties: {
        transportationOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
        currencyInfo: { type: Type.STRING },
        localLanguage: { type: Type.STRING },
        emergencyContacts: { type: Type.ARRAY, items: { type: Type.STRING } },
        safetyAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
        etiquette: { type: Type.ARRAY, items: { type: Type.STRING } },
        weatherTips: { type: Type.STRING },
        scamsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
        usefulApps: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        "transportationOptions",
        "currencyInfo",
        "localLanguage",
        "emergencyContacts",
        "safetyAdvice",
        "etiquette",
        "weatherTips",
        "scamsToAvoid",
        "usefulApps",
      ],
    },
    bonusRecommendations: {
      type: Type.OBJECT,
      properties: {
        hiddenGems: { type: Type.ARRAY, items: { type: Type.STRING } },
        nearbyAttractions: { type: Type.ARRAY, items: { type: Type.STRING } },
        localMarkets: { type: Type.ARRAY, items: { type: Type.STRING } },
        shoppingAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
        nightlife: { type: Type.ARRAY, items: { type: Type.STRING } },
        adventureActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
        familyFriendly: { type: Type.ARRAY, items: { type: Type.STRING } },
        rainyDayAlternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        "hiddenGems",
        "nearbyAttractions",
        "localMarkets",
        "shoppingAreas",
        "nightlife",
        "adventureActivities",
        "familyFriendly",
        "rainyDayAlternatives",
      ],
    },
  },
  required: [
    "tripSummary",
    "dayWiseItinerary",
    "budgetBreakdown",
    "hotels",
    "restaurants",
    "packingChecklist",
    "localTips",
    "bonusRecommendations",
  ],
};

// -------------------------------------------------------------------------
// Express Routes
// -------------------------------------------------------------------------

// API: Suggest destinations
app.post("/api/suggest-destinations", async (req, res) => {
  try {
    const { departureCity, budget, travelStyle, interests, duration } = req.body;
    
    const client = getGeminiClient();
    
    const prompt = `You are a travel expert planning assistant. The user wants 5 destination recommendations.
    Departure City: ${departureCity || "Anywhere"}
    Total Budget: $${budget || "Flexible"}
    Travel Style: ${travelStyle || "General"}
    Interests: ${interests || "None specified"}
    Duration: ${duration || "Flexible"} days
    
    Please suggest five suitable destinations. For each destination, you must include:
    - Why it matches the user's preferences (interests, budget, travel style)
    - Estimated total budget for the trip (realistic, budget-conscious)
    - Best time to visit
    - Top attractions
    - Recommended activities
    - Ideal trip duration
    
    Make the suggestions highly personalized and appealing.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: destinationSuggestionsSchema,
        systemInstruction: "You are TravelVerse, a professional AI travel assistant. Always provide authentic, beautiful, and realistic recommendations. Match the requested budget strictly.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Error in suggest-destinations:", error);
    res.status(500).json({ error: error.message || "Failed to generate suggestions" });
  }
});

// API: Generate full itinerary
app.post("/api/generate-itinerary", async (req, res) => {
  try {
    const preferences = req.body;
    
    const client = getGeminiClient();

    const prompt = `You are TravelVerse, an intelligent travel planning assistant. Provide a complete, fully detailed travel plan based on these user preferences:
    
    - Departure City: ${preferences.departureCity}
    - Destination: ${preferences.destination}
    - Travel Dates: ${preferences.dates || "Flexible"}
    - Trip Duration: ${preferences.duration} days
    - Number of Travelers: ${preferences.travelers}
    - Budget: $${preferences.budget}
    - Travel Style: ${preferences.travelStyle}
    - Interests: ${preferences.interests || "General sightseeing"}
    - Accommodation Preference: ${preferences.accommodation || "Standard"}
    - Preferred Transportation: ${preferences.transportation || "Public transit"}
    - Dietary Restrictions: ${preferences.dietaryRestrictions || "None"}
    - Must-visit Places: ${preferences.mustVisitPlaces || "None specified"}
    
    Create a detailed plan conforming EXACTLY to the requested JSON schema.
    Ensure:
    1. Day-wise Itinerary:
       - Provide detailed plans for EXACTLY ${preferences.duration} days (from Day 1 to Day ${preferences.duration}).
       - Activities must be detailed, geographically grouped to minimize travel times, with realistic morning, afternoon, and evening timelines.
       - Include estimated daily costs and transit time descriptions.
    2. Budget Breakdown:
       - Provide detailed estimates for Transportation, Accommodation, Food, Attractions, Shopping, and Miscellaneous.
       - Check if the total cost is under_budget, within_budget, or over_budget. If over budget, provide helpful cost saving tips.
    3. Hotels:
       - Recommend exactly 3 hotels fitting their accommodation style and budget level.
    4. Restaurants:
       - Recommend exactly 5 restaurants, matching dietary restrictions (${preferences.dietaryRestrictions || "None"}). Tag each as Breakfast, Lunch, or Dinner.
    5. Packing Checklist:
       - Structured by category, clearly labeling each item's status as 'essential' or 'optional'.
    6. Local Travel Tips and Bonus Recommendations:
       - Include hidden gems, weather warnings, emergency numbers, scam notices, app suggestions, and specific rules.
       
    Be realistic about pricing, transit times, and attraction selections. Do not repeat attractions.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: travelPlanSchema,
        systemInstruction: "You are TravelVerse, an intelligent travel expert. You provide comprehensive, high-fidelity travel itineraries that exactly fit the requested JSON schema.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Error in generate-itinerary:", error);
    res.status(500).json({ error: error.message || "Failed to generate travel plan" });
  }
});

// -------------------------------------------------------------------------
// Serve Client (Vite middleware in dev, static files in prod)
// -------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
