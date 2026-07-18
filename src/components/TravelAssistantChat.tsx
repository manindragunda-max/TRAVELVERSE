import React, { useState, useEffect, useRef } from "react";
import { UserPreferences, DestinationSuggestion, TravelPlan } from "../types";
import { suggestClientDestinations, generateClientItinerary } from "../utils/staticPlanner";
import { 
  Send, 
  HelpCircle, 
  Compass, 
  Sparkles, 
  RefreshCw, 
  Plus, 
  Minus, 
  Plane, 
  Check, 
  AlertCircle,
  Clock,
  MapPin,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
  suggestions?: DestinationSuggestion[];
}

interface TravelAssistantChatProps {
  onPlanGenerated: (plan: TravelPlan) => void;
}

export default function TravelAssistantChat({ onPlanGenerated }: TravelAssistantChatProps) {
  // 12 core preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    departureCity: "",
    destination: "",
    dates: "",
    duration: 5,
    travelers: 1,
    budget: 2000,
    travelStyle: "Solo",
    interests: "",
    accommodation: "Boutique hotels",
    transportation: "Public transit",
    dietaryRestrictions: "None",
    mustVisitPlaces: ""
  });

  // Current questioning state
  // Steps list: 
  // 1: departureCity
  // 2: destination
  // 3: dates
  // 4: duration
  // 5: travelers
  // 6: budget
  // 7: travelStyle
  // 8: interests
  // 9: accommodation
  // 10: transportation
  // 11: dietaryRestrictions
  // 12: mustVisitPlaces
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "👋 Hello there! I am TravelVerse, your personal intelligent AI travel companion. I am here to design a custom, budget-checked, day-by-day travel itinerary for you.\n\nLet's get started! To begin, which city are you departing from?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Unsure Destination branch states
  const [isSuggestingDestinations, setIsSuggestingDestinations] = useState(false);
  const [suggestionStep, setSuggestionStep] = useState<"budget" | "style" | "interests" | "choosing" | null>(null);
  const [suggestedDestinations, setSuggestedDestinations] = useState<DestinationSuggestion[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle immediate preset sample trip
  const handleLoadSample = async (preset: "tokyo" | "paris" | "kyoto") => {
    setIsLoading(true);
    setApiError(null);
    try {
      let samplePrefs: UserPreferences;
      if (preset === "kyoto") {
        samplePrefs = {
          departureCity: "Los Angeles (LAX)",
          destination: "Kyoto, Japan",
          dates: "Oct 12 - Oct 18, 2026",
          duration: 6,
          travelers: 2,
          budget: 3500,
          travelStyle: "Cultural / Romantic",
          interests: "historic temples, bamboo gardens, traditional tea ceremonies, and local ramen",
          accommodation: "Traditional Ryokans & Boutique hotels",
          transportation: "Kyoto Subway Pass & Walking",
          dietaryRestrictions: "None",
          mustVisitPlaces: "Fushimi Inari Shrine, Arashiyama Bamboo Grove, Kinkaku-ji"
        };
      } else if (preset === "paris") {
        samplePrefs = {
          departureCity: "London St. Pancras",
          destination: "Paris, France",
          dates: "Sep 5 - Sep 10, 2026",
          duration: 5,
          travelers: 1,
          budget: 2200,
          travelStyle: "Solo Explorer",
          interests: "art museums, cozy street cafes, gothic architecture, Seine sunset walking tours",
          accommodation: "Boutique hotels in Latin Quarter",
          transportation: "Metro & Walking",
          dietaryRestrictions: "Gluten-free",
          mustVisitPlaces: "Louvre Museum, Eiffel Tower, Sainte-Chapelle, Montmartre"
        };
      } else {
        samplePrefs = {
          departureCity: "San Francisco (SFO)",
          destination: "Tokyo, Japan",
          dates: "Nov 3 - Nov 10, 2026",
          duration: 7,
          travelers: 3,
          budget: 5000,
          travelStyle: "Family & Tech",
          interests: "anime, high-tech arcades, neon skylines, sushi, traditional gardens",
          accommodation: "Modern family hotels in Shinjuku",
          transportation: "JR Pass & Subway",
          dietaryRestrictions: "None",
          mustVisitPlaces: "teamLab Borderless, Shibuya Crossing, Senso-ji Temple"
        };
      }

      setMessages(prev => [
        ...prev,
        {
          sender: "user",
          text: `🚀 Load Preset Sample: ${samplePrefs.destination}`,
          timestamp: new Date()
        },
        {
          sender: "bot",
          text: `Setting preferences for ${samplePrefs.destination} and formulating a comprehensive travel blueprint...`,
          timestamp: new Date()
        }
      ]);

      // Simulate network processing delay for a more realistic and premium AI feel
      await new Promise(resolve => setTimeout(resolve, 800));

      const data = generateClientItinerary(samplePrefs);
      onPlanGenerated(data);
    } catch (err: any) {
      setApiError(err.message);
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: `⚠️ Error: ${err.message}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Main flow router for next step or branched suggestion steps
  const advanceFlow = async (textInput: string) => {
    if (!textInput.trim()) return;

    // 1. Add user message to log
    const userMsg = textInput.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg, timestamp: new Date() }]);
    setInputValue("");

    // 2. Branch: If in Suggesting Destinations sub-workflow
    if (isSuggestingDestinations) {
      await handleSuggestionFlowStep(userMsg);
      return;
    }

    // 3. Standard Step Router
    const currentPreferences = { ...preferences };

    switch (currentStep) {
      case 1: // Departure City
        currentPreferences.departureCity = userMsg;
        setPreferences(currentPreferences);
        setCurrentStep(2);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `Got it! Departing from ${userMsg}.\n\nWhere is your dream destination? Or, if you aren't sure yet, click "Help Me Choose" below so I can curate 5 custom suggestions for you!`,
          timestamp: new Date()
        }]);
        break;

      case 2: // Destination
        currentPreferences.destination = userMsg;
        setPreferences(currentPreferences);
        setCurrentStep(3);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `Wonderful! ${userMsg} is a spectacular choice.\n\nWhen are you planning to travel? (e.g. "Oct 10 - Oct 17, 2026" or "Flexible")`,
          timestamp: new Date()
        }]);
        break;

      case 3: // Dates
        currentPreferences.dates = userMsg;
        setPreferences(currentPreferences);
        setCurrentStep(4);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `Noted. What is your preferred trip duration in days? (Enter a number, e.g. 5)`,
          timestamp: new Date()
        }]);
        break;

      case 4: // Duration
        const days = parseInt(userMsg) || 5;
        currentPreferences.duration = days;
        setPreferences(currentPreferences);
        setCurrentStep(5);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `Awesome, a ${days}-day adventure!\n\nHow many travelers will be on this trip?`,
          timestamp: new Date()
        }]);
        break;

      case 5: // Travelers
        const people = parseInt(userMsg) || 1;
        currentPreferences.travelers = people;
        setPreferences(currentPreferences);
        setCurrentStep(6);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `Perfect, planning for ${people} traveler(s).\n\nWhat is your estimated total budget in USD? (e.g. 2500)`,
          timestamp: new Date()
        }]);
        break;

      case 6: // Budget
        const money = parseInt(userMsg.replace(/[^0-9]/g, "")) || 2000;
        currentPreferences.budget = money;
        setPreferences(currentPreferences);
        setCurrentStep(7);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `Superb! Budget set to $${money}.\n\nWhat is your preferred travel style? (Choose from below or write your own: e.g. Adventure, Family, Romantic, Solo, Luxury, Backpacking, Business)`,
          timestamp: new Date()
        }]);
        break;

      case 7: // Style
        currentPreferences.travelStyle = userMsg;
        setPreferences(currentPreferences);
        setCurrentStep(8);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `Lovely, a ${userMsg} getaway!\n\nWhat are your top interests or hobbies? (e.g., historical temples, food touring, beaches, art museums, hiking)`,
          timestamp: new Date()
        }]);
        break;

      case 8: // Interests
        currentPreferences.interests = userMsg;
        setPreferences(currentPreferences);
        setCurrentStep(9);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `Fabulous. Let's talk comfort. What is your lodging or accommodation preference? (e.g., Hostels, Budget hotels, Boutique hotels, Luxury resorts)`,
          timestamp: new Date()
        }]);
        break;

      case 9: // Accommodation
        currentPreferences.accommodation = userMsg;
        setPreferences(currentPreferences);
        setCurrentStep(10);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `Great. How do you prefer to get around? (e.g., Public transit, Walking, Rental car, Ride-shares)`,
          timestamp: new Date()
        }]);
        break;

      case 10: // Transportation
        currentPreferences.transportation = userMsg;
        setPreferences(currentPreferences);
        setCurrentStep(11);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `Understood! Transit preference is ${userMsg}.\n\nDo you have any dietary restrictions? (e.g., Vegetarian, Vegan, Gluten-free, Halal, or None)`,
          timestamp: new Date()
        }]);
        break;

      case 11: // Dietary
        currentPreferences.dietaryRestrictions = userMsg;
        setPreferences(currentPreferences);
        setCurrentStep(12);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `Noted.\n\nLastly, are there any specific must-visit places or landmarks you definitely want to see? (Or type "None" to skip)`,
          timestamp: new Date()
        }]);
        break;

      case 12: // Must-visit
        currentPreferences.mustVisitPlaces = userMsg;
        setPreferences(currentPreferences);
        setIsLoading(true);
        setApiError(null);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `🎉 Marvelous! I have collected all your travel details.\n\nI am now synthesizing your personalized itinerary, cost breakdown, packing list, and local tips... Hold tight!`,
          timestamp: new Date()
        }]);

        try {
          // Simulate dynamic processing delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          const planData = generateClientItinerary(currentPreferences);
          onPlanGenerated(planData);
        } catch (err: any) {
          setApiError(err.message);
          setMessages(prev => [...prev, {
            sender: "bot",
            text: `⚠️ Something went wrong: ${err.message}. Please verify your Gemini API Key in secrets, or try again.`,
            timestamp: new Date()
          }]);
        } finally {
          setIsLoading(false);
        }
        break;
    }
  };

  // Branch flow: Gathering suggestions
  const startSuggestionWorkflow = () => {
    setIsSuggestingDestinations(true);
    setSuggestionStep("budget");
    setMessages(prev => [
      ...prev,
      {
        sender: "user",
        text: "🔍 Help Me Choose",
        timestamp: new Date()
      },
      {
        sender: "bot",
        text: "Wonderful! No problem at all, let's explore 5 perfect options for you. First, what is your total budget for this trip? (e.g. 1500)",
        timestamp: new Date()
      }
    ]);
  };

  const handleSuggestionFlowStep = async (userMsg: string) => {
    const currentPrefs = { ...preferences };

    if (suggestionStep === "budget") {
      const money = parseInt(userMsg.replace(/[^0-9]/g, "")) || 2000;
      currentPrefs.budget = money;
      setPreferences(currentPrefs);
      setSuggestionStep("style");
      setMessages(prev => [...prev, {
        sender: "bot",
        text: "Got it! And what is your travel style? (Choose one: e.g. Adventure, Family, Romantic, Solo, Luxury, Backpacking, Business)",
        timestamp: new Date()
      }]);
    } else if (suggestionStep === "style") {
      currentPrefs.travelStyle = userMsg;
      setPreferences(currentPrefs);
      setSuggestionStep("interests");
      setMessages(prev => [...prev, {
        sender: "bot",
        text: "Excellent. Finally, what are your main interests? (e.g. food, history, nature, shopping, museum)",
        timestamp: new Date()
      }]);
    } else if (suggestionStep === "interests") {
      currentPrefs.interests = userMsg;
      setPreferences(currentPrefs);
      setSuggestionStep("choosing");
      setIsLoading(true);
      setApiError(null);
      setMessages(prev => [...prev, {
        sender: "bot",
        text: "Perfect! Querying our AI travel guide database to compile 5 custom-tailored matches for you...",
        timestamp: new Date()
      }]);

      try {
        // Simulate dynamic processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const suggestions = suggestClientDestinations(
          currentPrefs.departureCity,
          currentPrefs.budget,
          currentPrefs.travelStyle,
          currentPrefs.interests
        );
        setSuggestedDestinations(suggestions);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `✨ I have curated these 5 destinations that match your budget of $${currentPrefs.budget} and ${currentPrefs.travelStyle} style perfectly! Take a look below and select the one you love:`,
          timestamp: new Date(),
          suggestions: suggestions
        }]);
      } catch (err: any) {
        setApiError(err.message);
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `⚠️ Failed to fetch suggestions: ${err.message}. Let's try manually. What destination do you choose?`,
          timestamp: new Date()
        }]);
        // Revert to manual destination selection
        setIsSuggestingDestinations(false);
        setSuggestionStep(null);
        setCurrentStep(2);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const selectSuggestedDestination = (dest: DestinationSuggestion) => {
    const currentPrefs = { ...preferences, destination: dest.destination };
    setPreferences(currentPrefs);
    setIsSuggestingDestinations(false);
    setSuggestionStep(null);
    setSuggestedDestinations([]);
    setCurrentStep(3); // Go directly to Dates
    setMessages(prev => [
      ...prev,
      {
        sender: "user",
        text: `📍 I choose ${dest.destination}!`,
        timestamp: new Date()
      },
      {
        sender: "bot",
        text: `Spectacular choice! ${dest.destination} is truly amazing.\n\nMatching details: ${dest.matchingReason}\nBest time to visit: ${dest.bestTimeToVisit}\nTop attractions: ${dest.topAttractions.slice(0, 3).join(", ")}\n\nNow, when are you planning to travel? (e.g. "Oct 10 - Oct 17, 2026" or "Flexible")`,
        timestamp: new Date()
      }
    ]);
  };

  // Skip helper for optional must-visit
  const handleSkipMustVisit = () => {
    advanceFlow("None");
  };

  // Helpers to increment/decrement numbers
  const changeNumberPreference = (key: "duration" | "travelers", delta: number) => {
    setPreferences(prev => {
      const val = Math.max(1, prev[key] + delta);
      return { ...prev, [key]: val };
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-[calc(100vh-80px)] min-h-[600px]">
      
      {/* Intro/Preset Sidebar (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
          <Plane className="w-48 h-48 text-white" />
        </div>

        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-display tracking-tight text-white">TravelVerse</h2>
              <p className="text-xs text-sky-300 font-medium">Smart AI Itinerary Planner</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-light">
            I am your personal itinerary builder. Provide your travel departure, destination, budget, style, and interests, and I will instantly tailor-make your optimal travel experience.
          </p>

          <div className="border-t border-slate-800 pt-5 space-y-4">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Instant Presets
            </h3>
            <p className="text-[10px] text-slate-400">Want to skip step-by-step and experience the full-featured dashboard immediately? Load one of our beautiful pre-audited presets:</p>
            
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: "kyoto", label: "Kyoto Heritage", country: "Japan ⛩️", desc: "Temples & Tea Rituals" },
                { id: "paris", label: "Paris Romantique", country: "France 🗼", desc: "Art Museums & Cafes" },
                { id: "tokyo", label: "Tokyo Tech", country: "Japan ⚡", desc: "Anime & Neon Skyline" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadSample(preset.id as any)}
                  disabled={isLoading}
                  className="w-full text-left bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 p-3.5 rounded-xl transition-all flex items-center justify-between group disabled:opacity-50"
                >
                  <div>
                    <span className="text-xs font-bold font-display block text-white group-hover:text-sky-400 transition-colors">{preset.label}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{preset.country} • {preset.desc}</span>
                  </div>
                  <Check className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-4 mt-6">
          Powered by Gemini 3.5 Flash & Antigravity Agent.
        </div>
      </div>

      {/* Main Chat Area (lg:col-span-8) */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-xs overflow-hidden">
        
        {/* Chat Messages Logs */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-slate-50/50">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={index} className="space-y-4">
                  {/* Chat bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs whitespace-pre-line ${
                      isBot 
                        ? "bg-white text-slate-800 border border-slate-150 rounded-tl-xs" 
                        : "bg-sky-600 text-white rounded-tr-xs font-medium"
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>

                  {/* Render suggestions if embedded in bot message */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                    >
                      {msg.suggestions.map((dest, i) => (
                        <div 
                          key={i} 
                          className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-sky-500 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-1.5">
                            <h4 className="font-bold text-slate-900 font-display flex items-center gap-1.5 text-sm">
                              <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                              {dest.destination}
                            </h4>
                            <p className="text-xs text-slate-500 italic leading-relaxed">
                              "{dest.matchingReason}"
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {dest.topAttractions.slice(0, 2).map((a, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Est. Cost</span>
                              <strong className="text-sm font-bold font-mono text-slate-900">${dest.estimatedBudget}</strong>
                            </div>
                            <button
                              onClick={() => selectSuggestedDestination(dest)}
                              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-xs"
                            >
                              Select Destination
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 text-sm flex items-center gap-3">
                  <span className="flex gap-1">
                    <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  <span>Synthesizing travel plans...</span>
                </div>
              </motion.div>
            )}

            {apiError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-semibold block">API Communication Error</strong>
                  <p className="leading-relaxed">{apiError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Interactive Panel */}
        <div className="bg-white border-t border-slate-150 p-4 space-y-4">
          
          {/* Custom quick-helpers relative to current step */}
          <div className="flex flex-wrap gap-2 justify-center no-print">
            {/* Step 2 (Destination) options */}
            {currentStep === 2 && !isSuggestingDestinations && (
              <>
                <button
                  onClick={startSuggestionWorkflow}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <HelpCircle className="w-4 h-4 text-amber-500" /> Help Me Choose (AI Suggestions)
                </button>
                {["Kyoto, Japan", "Paris, France", "Rome, Italy", "Bali, Indonesia"].map(c => (
                  <button
                    key={c}
                    onClick={() => { advanceFlow(c); }}
                    className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all"
                  >
                    📍 {c}
                  </button>
                ))}
              </>
            )}

            {/* Step 4 (Duration) Slider/Plus-Minus */}
            {currentStep === 4 && (
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 p-2.5 rounded-xl">
                <span className="text-xs text-slate-500 font-medium px-2">Duration:</span>
                <button 
                  onClick={() => changeNumberPreference("duration", -1)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <strong className="text-base font-bold font-mono text-slate-800 w-8 text-center">{preferences.duration}</strong>
                <button 
                  onClick={() => changeNumberPreference("duration", 1)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => advanceFlow(`${preferences.duration}`)}
                  className="bg-sky-600 text-white text-xs font-semibold px-4 py-2 rounded-lg ml-2 hover:bg-sky-700 transition-colors"
                >
                  Confirm {preferences.duration} Days
                </button>
              </div>
            )}

            {/* Step 5 (Travelers) Selector */}
            {currentStep === 5 && (
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 p-2.5 rounded-xl">
                <span className="text-xs text-slate-500 font-medium px-2">Travelers:</span>
                <button 
                  onClick={() => changeNumberPreference("travelers", -1)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <strong className="text-base font-bold font-mono text-slate-800 w-8 text-center">{preferences.travelers}</strong>
                <button 
                  onClick={() => changeNumberPreference("travelers", 1)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => advanceFlow(`${preferences.travelers}`)}
                  className="bg-sky-600 text-white text-xs font-semibold px-4 py-2 rounded-lg ml-2 hover:bg-sky-700 transition-colors"
                >
                  Confirm {preferences.travelers} {preferences.travelers === 1 ? "Traveler" : "Travelers"}
                </button>
              </div>
            )}

            {/* Step 7 (Travel Style) or Suggestion Branch Style options */}
            {((currentStep === 7 && !isSuggestingDestinations) || (isSuggestingDestinations && suggestionStep === "style")) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg mt-2">
                {["Solo", "Adventure", "Family", "Romantic", "Luxury", "Backpacking", "Business", "Relaxing"].map((style) => (
                  <button
                    key={style}
                    onClick={() => advanceFlow(style)}
                    className="bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50/20 text-slate-700 text-xs font-semibold p-2.5 rounded-xl transition-all shadow-3xs text-center"
                  >
                    ✨ {style}
                  </button>
                ))}
              </div>
            )}

            {/* Accommodation Selection Helpers */}
            {currentStep === 9 && (
              <>
                {["Boutique hotels", "Luxury resorts", "Ryokan (Traditional Japanese)", "Youth Hostels", "Budget hotels", "Airbnbs / Apartments"].map(acc => (
                  <button
                    key={acc}
                    onClick={() => advanceFlow(acc)}
                    className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all"
                  >
                    🏨 {acc}
                  </button>
                ))}
              </>
            )}

            {/* Transit selection helpers */}
            {currentStep === 10 && (
              <>
                {["Public transit (Subways, trains)", "Walking & Metro", "Rental Car", "Ride-shares / Taxis", "Cycling", "Bullet trains & Regional rail"].map(trans => (
                  <button
                    key={trans}
                    onClick={() => advanceFlow(trans)}
                    className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all"
                  >
                    🚆 {trans}
                  </button>
                ))}
              </>
            )}

            {/* Dietary Restriction Helpers */}
            {currentStep === 11 && (
              <>
                {["None", "Vegetarian", "Vegan", "Gluten-free", "Halal", "Pescatarian"].map(diet => (
                  <button
                    key={diet}
                    onClick={() => advanceFlow(diet)}
                    className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all"
                  >
                    🥗 {diet}
                  </button>
                ))}
              </>
            )}

            {/* Must-visit skip button */}
            {currentStep === 12 && (
              <button
                onClick={handleSkipMustVisit}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              >
                ⏩ Skip & Generate Itinerary
              </button>
            )}
          </div>

          {/* Standard Chat Entry Row */}
          {/* Hide textbox for fixed numeric steps to guarantee clean type inputs */}
          {currentStep !== 4 && currentStep !== 5 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                advanceFlow(inputValue);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  currentStep === 1 ? "e.g., Los Angeles (LAX)" :
                  currentStep === 2 && isSuggestingDestinations && suggestionStep === "budget" ? "e.g., 2000" :
                  currentStep === 2 && isSuggestingDestinations && suggestionStep === "interests" ? "e.g., ancient temples, sushi, food touring" :
                  currentStep === 2 ? "e.g., Kyoto, Japan or click Help Me Choose" :
                  currentStep === 3 ? "e.g., October 12 - October 18, 2026" :
                  currentStep === 6 ? "e.g., 1500" :
                  currentStep === 8 ? "e.g., historical sites, hiking, coffee, museums" :
                  currentStep === 11 ? "e.g., Gluten-free, none" :
                  "Type your answer..."
                }
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 px-4 py-3 rounded-xl text-sm transition-all focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-xl transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
