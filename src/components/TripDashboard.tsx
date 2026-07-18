import React, { useState } from "react";
import { 
  TravelPlan, 
  PackingItem 
} from "../types";
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Compass, 
  Clock, 
  Briefcase, 
  Utensils, 
  Hotel, 
  CheckSquare, 
  Square, 
  Info, 
  Sparkles, 
  ArrowLeft, 
  Printer, 
  Share2, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Navigation,
  Activity,
  Award,
  Shield,
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";

interface TripDashboardProps {
  plan: TravelPlan;
  onReset: () => void;
}

export default function TripDashboard({ plan, onReset }: TripDashboardProps) {
  const [activeTab, setActiveTab] = useState<"itinerary" | "budget" | "hotels" | "checklist" | "tips" | "bonus">("itinerary");
  const [checklist, setChecklist] = useState<typeof plan.packingChecklist>(() => {
    // Add checked/packed boolean to packing items
    const initCategory = (items: any[]) => 
      items.map(item => ({ ...item, packed: false }));
    
    return {
      essentialDocuments: initCategory(plan.packingChecklist.essentialDocuments),
      clothing: initCategory(plan.packingChecklist.clothing),
      footwear: initCategory(plan.packingChecklist.footwear),
      electronics: initCategory(plan.packingChecklist.electronics),
      toiletries: initCategory(plan.packingChecklist.toiletries),
      medicines: initCategory(plan.packingChecklist.medicines),
      accessories: initCategory(plan.packingChecklist.accessories),
      weatherSpecific: initCategory(plan.packingChecklist.weatherSpecific)
    };
  });

  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Toggle checklist item packed status
  const toggleItem = (category: keyof typeof checklist, index: number) => {
    setChecklist(prev => {
      const updatedCategory = [...prev[category]];
      updatedCategory[index] = {
        ...updatedCategory[index],
        packed: !updatedCategory[index].packed
      };
      return {
        ...prev,
        [category]: updatedCategory
      };
    });
  };

  // Calculate packed statistics
  const getPackStats = () => {
    let total = 0;
    let packed = 0;
    Object.keys(checklist).forEach(cat => {
      const items = checklist[cat as keyof typeof checklist] as PackingItem[];
      total += items.length;
      packed += items.filter(i => i.packed).length;
    });
    return { total, packed, percent: total > 0 ? Math.round((packed / total) * 100) : 0 };
  };

  const packStats = getPackStats();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `My Travel Itinerary to ${plan.tripSummary.destination}`,
        text: `Check out my personalized trip itinerary for ${plan.tripSummary.destination}!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: Copy summary to clipboard
      const text = `Trip to ${plan.tripSummary.destination} from ${plan.tripSummary.departureCity}\nDuration: ${plan.tripSummary.duration} Days\nBudget Status: ${plan.budgetBreakdown.budgetStatus.replace('_', ' ').toUpperCase()}`;
      navigator.clipboard.writeText(text);
      alert("Itinerary summary copied to clipboard!");
    }
  };

  // Convert budgetStatus to friendly text and colors
  const getBudgetBadge = (status: string) => {
    switch (status) {
      case "under_budget":
        return {
          text: "✅ Under Budget",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          desc: "Great news! Your estimated expenses are well below your budget limit."
        };
      case "within_budget":
        return {
          text: "✅ Within Budget",
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          desc: "Perfect! Your itinerary is perfectly aligned with your financial expectations."
        };
      case "over_budget":
        return {
          text: "⚠️ Over Budget",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          desc: "Heads up! The total cost exceeds your desired budget limit. Check out our cost-saving suggestions."
        };
      default:
        return {
          text: "Within Budget",
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          desc: "Budget estimated successfully."
        };
    }
  };

  const budgetInfo = getBudgetBadge(plan.budgetBreakdown.budgetStatus);

  // SVG-based responsive pie/donut chart for budget categories
  const categories = [
    { label: "Accommodation", value: plan.budgetBreakdown.accommodation, color: "#38bdf8" }, // Sky
    { label: "Transportation", value: plan.budgetBreakdown.transportation, color: "#0284c7" }, // Sky Dark
    { label: "Food & Dining", value: plan.budgetBreakdown.food, color: "#f59e0b" }, // Amber
    { label: "Attractions", value: plan.budgetBreakdown.attractions, color: "#10b981" }, // Emerald
    { label: "Shopping", value: plan.budgetBreakdown.shopping, color: "#ec4899" }, // Pink
    { label: "Miscellaneous", value: plan.budgetBreakdown.miscellaneous, color: "#8b5cf6" }, // Violet
  ].filter(c => c.value > 0);

  const totalBudget = categories.reduce((sum, c) => sum + c.value, 0);

  // Calculation for SVG circular donut segments
  let cumulativePercent = 0;
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium self-start"
          id="btn-back-to-planner"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Planner
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium shadow-xs hover:shadow-sm transition-all"
            id="btn-print-itinerary"
          >
            <Printer className="w-4 h-4" /> Export / Print
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium shadow-xs hover:shadow-sm transition-all"
            id="btn-share-itinerary"
          >
            <Share2 className="w-4 h-4" /> Share Itinerary
          </button>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-10 mb-8 relative overflow-hidden shadow-xl" id="dashboard-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-800/30 via-slate-900/10 to-slate-900/0 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs px-3 py-1 rounded-full font-semibold tracking-wider uppercase font-display">
              {plan.tripSummary.travelStyle} Trip
            </span>
            <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-medium">
              {plan.tripSummary.duration} Days
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-display mb-2 text-white">
            {plan.tripSummary.destination}
          </h1>
          <p className="text-slate-300 text-lg mb-6 flex items-center gap-2 max-w-2xl font-light">
            <MapPin className="w-5 h-5 text-sky-400 shrink-0" />
            Departing from <strong className="font-semibold text-white">{plan.tripSummary.departureCity}</strong> 
            {plan.tripSummary.dates && <> on <strong className="font-semibold text-white">{plan.tripSummary.dates}</strong></>}
          </p>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
            <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-0.5 uppercase tracking-wider font-semibold">Travelers</span>
              <strong className="text-lg text-white font-semibold flex items-center gap-1.5 font-display">
                <Users className="w-4 h-4 text-sky-400" />
                {plan.tripSummary.travelers} {plan.tripSummary.travelers === 1 ? "Person" : "People"}
              </strong>
            </div>
            <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-0.5 uppercase tracking-wider font-semibold">Budget Limit</span>
              <strong className="text-lg text-white font-semibold flex items-center gap-1.5 font-display">
                <DollarSign className="w-4 h-4 text-sky-400" />
                {plan.tripSummary.budget.toLocaleString()}
              </strong>
            </div>
            <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50 col-span-2">
              <span className="text-xs text-slate-400 block mb-0.5 uppercase tracking-wider font-semibold">Interests & Vibes</span>
              <strong className="text-sm text-white font-medium block truncate" title={plan.tripSummary.interests}>
                {plan.tripSummary.interests}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (lg:col-span-3) - Hidden when printing */}
        <div className="lg:col-span-3 space-y-3 no-print bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Itinerary Explorer</p>
          {[
            { id: "itinerary", label: "Day Itinerary", icon: Calendar },
            { id: "budget", label: "Budget Breakdown", icon: DollarSign },
            { id: "hotels", label: "Hotels & Restaurants", icon: Hotel },
            { id: "checklist", label: "Packing Checklist", icon: Briefcase, badge: packStats.percent > 0 ? `${packStats.percent}%` : null },
            { id: "tips", label: "Local Travel Tips", icon: Info },
            { id: "bonus", label: "Bonus Gems", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isSelected 
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/10 translate-x-1" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                id={`sidebar-tab-${tab.id}`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-400"}`} />
                  {tab.label}
                </span>
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isSelected ? "bg-sky-700 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Panel (lg:col-span-9) */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs">
          
          {/* TAB 1: ITINERARY */}
          {activeTab === "itinerary" && (
            <div id="tab-content-itinerary" className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">Day-by-Day Journey</h2>
                  <p className="text-xs text-slate-500">Perfectly orchestrated daily schedules to maximize your exploration.</p>
                </div>
                <button 
                  onClick={() => setExpandedDay(expandedDay === null ? 1 : null)}
                  className="text-xs text-sky-600 hover:text-sky-800 font-semibold"
                >
                  {expandedDay === null ? "Expand First Day" : "Collapse All"}
                </button>
              </div>

              <div className="relative border-l border-slate-200 ml-4 md:ml-6 pl-6 md:pl-8 py-2 space-y-8">
                {plan.dayWiseItinerary.map((day, idx) => {
                  const isExpanded = expandedDay === day.dayNumber;
                  return (
                    <div key={day.dayNumber} className="relative group">
                      {/* Timeline Dot/Icon */}
                      <span className="absolute -left-[37px] md:-left-[45px] top-1 bg-white border-2 border-sky-600 text-sky-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-xs font-display">
                        {day.dayNumber}
                      </span>

                      {/* Header */}
                      <div 
                        onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                        className="cursor-pointer hover:bg-slate-50/80 p-3 rounded-xl -m-3 transition-colors flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <h3 className="text-base md:text-lg font-bold font-display text-slate-900 group-hover:text-sky-600 transition-colors">
                            Day {day.dayNumber}: {day.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-mono">
                              <DollarSign className="w-3 h-3 text-slate-400" /> Daily Cost: ${day.estimatedDailyCost}
                            </span>
                            <span className="flex items-center gap-1">
                              <Navigation className="w-3 h-3 text-slate-400" /> Transit: {day.transitTimes}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-sky-600 font-medium">
                          {isExpanded ? "Hide Details" : "Show Details"}
                        </span>
                      </div>

                      {/* Expandable Details */}
                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 pt-4 border-t border-slate-100 space-y-5 text-sm overflow-hidden"
                        >
                          {/* MORNING */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
                            <div className="md:col-span-3 flex items-center gap-2 text-amber-600 font-bold font-display tracking-wide uppercase text-xs pt-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                              🌅 Morning
                            </div>
                            <div className="md:col-span-9 bg-amber-50/30 p-4 rounded-xl border border-amber-100/50 space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                {day.morning.attractions.map((attr, i) => (
                                  <span key={i} className="bg-amber-100/50 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                    📍 {attr}
                                  </span>
                                ))}
                              </div>
                              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                                {day.morning.activities.map((act, i) => (
                                  <li key={i} className="leading-relaxed">{act}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* AFTERNOON */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
                            <div className="md:col-span-3 flex items-center gap-2 text-sky-600 font-bold font-display tracking-wide uppercase text-xs pt-1">
                              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                              ☀️ Afternoon
                            </div>
                            <div className="md:col-span-9 bg-sky-50/30 p-4 rounded-xl border border-sky-100/50 space-y-3">
                              <div className="bg-white px-3 py-1.5 rounded-lg border border-sky-100 flex items-center gap-2 text-xs font-medium text-slate-700">
                                <Utensils className="w-3.5 h-3.5 text-sky-500" /> Lunch: {day.afternoon.lunchSuggestion}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {day.afternoon.sightseeing.map((attr, i) => (
                                  <span key={i} className="bg-sky-100/50 text-sky-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                    📍 {attr}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* EVENING */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
                            <div className="md:col-span-3 flex items-center gap-2 text-indigo-600 font-bold font-display tracking-wide uppercase text-xs pt-1">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                              🌌 Evening
                            </div>
                            <div className="md:col-span-9 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50 space-y-3">
                              <div className="bg-white px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-2 text-xs font-medium text-slate-700">
                                <Utensils className="w-3.5 h-3.5 text-indigo-500" /> Dinner: {day.evening.dinnerRecommendation}
                              </div>
                              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                                {day.evening.sunsetNightActivities.map((act, i) => (
                                  <li key={i} className="leading-relaxed">{act}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* TRANSIT & TRANSIT TIPS */}
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
                            <span className="flex items-center gap-2">
                              <Navigation className="w-4 h-4 text-slate-400 shrink-0" />
                              <strong>Transportation Details:</strong> {day.transportation}
                            </span>
                            <span className="text-slate-500">
                              ⏱️ Transit overhead: {day.transitTimes}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BUDGET BREAKDOWN */}
          {activeTab === "budget" && (
            <div id="tab-content-budget" className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold font-display text-slate-900 font-semibold">Budget Analyzer</h2>
                <p className="text-xs text-slate-500">Honest and carefully audited estimates for standard expenditures.</p>
              </div>

              {/* Budget Alert Box */}
              <div className={`p-5 rounded-2xl border flex flex-col md:flex-row gap-4 items-start md:items-center ${budgetInfo.bg}`}>
                <div className="p-3 bg-white rounded-xl shadow-xs shrink-0 text-slate-800">
                  <Activity className="w-6 h-6 text-sky-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-display">{budgetInfo.text}</h3>
                  <p className="text-xs opacity-90 leading-relaxed">{budgetInfo.desc}</p>
                </div>
                <div className="md:ml-auto text-right">
                  <span className="text-xs block uppercase font-bold tracking-wider opacity-70">Total Estimated Cost</span>
                  <strong className="text-2xl font-extrabold font-mono text-slate-900">${plan.budgetBreakdown.totalCost.toLocaleString()}</strong>
                </div>
              </div>

              {/* Budget Breakdown Visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                {/* SVG Donut Chart */}
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-56 h-56 transform -rotate-90" viewBox="-1.2 -1.2 2.4 2.4">
                    {/* Background Ring */}
                    <circle cx="0" cy="0" r="0.8" fill="none" stroke="#e2e8f0" strokeWidth="0.3" />
                    
                    {/* Render Segments */}
                    {(() => {
                      let currentAngle = 0;
                      return categories.map((cat, i) => {
                        const percent = cat.value / totalBudget;
                        const strokeDasharray = `${percent * 2 * Math.PI * 0.8} ${2 * Math.PI * 0.8}`;
                        const strokeDashoffset = -currentAngle * 2 * Math.PI * 0.8;
                        currentAngle += percent;
                        return (
                          <circle
                            key={i}
                            cx="0"
                            cy="0"
                            r="0.8"
                            fill="none"
                            stroke={cat.color}
                            strokeWidth="0.3"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-500 hover:stroke-[0.35] cursor-pointer"
                          />
                        );
                      });
                    })()}

                    {/* Center text */}
                    <g transform="rotate(90 0 0)">
                      <text x="0" y="-0.15" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 font-sans text-[0.25px] uppercase font-bold tracking-widest">Spent</text>
                      <text x="0" y="0.15" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 font-mono font-extrabold text-[0.35px]">${plan.budgetBreakdown.totalCost}</text>
                    </g>
                  </svg>
                </div>

                {/* Legend list */}
                <div className="space-y-3">
                  {categories.map((cat, i) => {
                    const percent = Math.round((cat.value / totalBudget) * 100);
                    return (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-600 font-medium">
                          <span className="w-3.5 h-3.5 rounded-full inline-block shrink-0" style={{ backgroundColor: cat.color }} />
                          {cat.label}
                        </span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900">${cat.value.toLocaleString()}</span>
                          <span className="text-xs text-slate-400 font-mono ml-2">({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cost Saving Tips */}
              {plan.budgetBreakdown.costSavingTips.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-sky-600" /> Cost-Saving Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.budgetBreakdown.costSavingTips.map((tip, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex gap-3">
                        <span className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HOTELS & RESTAURANTS */}
          {activeTab === "hotels" && (
            <div id="tab-content-hotels" className="space-y-10">
              {/* Hotel Suggestions */}
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold font-display text-slate-900 font-semibold">Lodging Recommendations</h2>
                  <p className="text-xs text-slate-500">Three hand-picked hotels matching your selected comfort level.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plan.hotels.map((hotel, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col">
                      <div className="bg-slate-900 text-white p-4 relative h-24 flex flex-col justify-end">
                        <div className="absolute top-3 right-3 bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ⭐️ {hotel.rating} / 5
                        </div>
                        <h3 className="font-bold font-display text-sm truncate pr-12">{hotel.name}</h3>
                        <p className="text-[10px] text-slate-300 truncate">{hotel.location}</p>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          "{hotel.whyRecommended}"
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Est. Cost</span>
                          <span className="text-sm font-extrabold font-mono text-slate-900">${hotel.pricePerNight} <span className="text-[10px] text-slate-400 font-normal">/ night</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dining Suggestions */}
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold font-display text-slate-900 font-semibold">Local Culinary Spots</h2>
                  <p className="text-xs text-slate-500">Top-rated restaurants suited to your style and food preferences.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {plan.restaurants.map((rest, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors">
                      <div className="space-y-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block ${
                          rest.recommendedFor === "Breakfast" ? "bg-amber-100 text-amber-800" :
                          rest.recommendedFor === "Lunch" ? "bg-sky-100 text-sky-800" : "bg-indigo-100 text-indigo-800"
                        }`}>
                          {rest.recommendedFor}
                        </span>
                        <h3 className="font-bold font-display text-slate-900 text-xs truncate" title={rest.name}>{rest.name}</h3>
                        <p className="text-[10px] text-slate-500 font-medium truncate">{rest.cuisine}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest block font-semibold mb-0.5">Signature Dish</p>
                          <strong className="text-[10px] text-slate-700 block truncate" title={rest.signatureDish}>✨ {rest.signatureDish}</strong>
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-medium">Avg Cost</span>
                          <span className="font-bold font-mono text-slate-800">${rest.avgPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INTERACTIVE CHECKLIST */}
          {activeTab === "checklist" && (
            <div id="tab-content-checklist" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900 font-semibold">Interactive Packing Companion</h2>
                  <p className="text-xs text-slate-500">Cross off items to track your luggage packing readiness.</p>
                </div>
                {/* Visual Progress ring/bar */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    {packStats.percent}%
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Luggage Status</span>
                    <strong className="text-xs text-slate-700 block font-semibold">{packStats.packed} / {packStats.total} Items Packed</strong>
                  </div>
                </div>
              </div>

              {/* Grid of Checklist Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: "essentialDocuments", label: "📄 Essential Documents" },
                  { key: "clothing", label: "👕 Clothing & Attire" },
                  { key: "footwear", label: "👟 Footwear" },
                  { key: "electronics", label: "🔋 Electronics & Power" },
                  { key: "toiletries", label: "🧼 Toiletries & Skincare" },
                  { key: "medicines", label: "💊 Medicines & First-Aid" },
                  { key: "accessories", label: "🕶 Accessories" },
                  { key: "weatherSpecific", label: "🌦 Weather-Specific Items" }
                ].map((category) => {
                  const items = checklist[category.key as keyof typeof checklist] as PackingItem[];
                  if (!items || items.length === 0) return null;
                  
                  return (
                    <div key={category.key} className="border border-slate-100 p-5 rounded-2xl bg-slate-50/30">
                      <h3 className="font-bold text-sm text-slate-800 font-display border-b border-slate-100 pb-2 mb-3">
                        {category.label}
                      </h3>
                      <div className="space-y-2">
                        {items.map((item, idx) => (
                          <div 
                            key={idx}
                            onClick={() => toggleItem(category.key as keyof typeof checklist, idx)}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 cursor-pointer select-none transition-all"
                          >
                            <span className="flex items-center gap-3">
                              {item.packed ? (
                                <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 shrink-0" />
                              )}
                              <span className={`text-xs ${item.packed ? "line-through text-slate-400" : "text-slate-700 font-medium"}`}>
                                {item.name}
                              </span>
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                              item.status === "essential" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: LOCAL TIPS */}
          {activeTab === "tips" && (
            <div id="tab-content-tips" className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold font-display text-slate-900 font-semibold">Local Travel Advisories</h2>
                <p className="text-xs text-slate-500">Crucial tips on transport, safety, scams, and apps to browse like a local.</p>
              </div>

              {/* General Country Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-sky-50/40 border border-sky-100/50 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-sky-600 uppercase font-bold tracking-wider">Currency Unit</span>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">💰 {plan.localTips.currencyInfo}</p>
                </div>
                <div className="bg-sky-50/40 border border-sky-100/50 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-sky-600 uppercase font-bold tracking-wider">Local Language</span>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">🗣️ {plan.localTips.localLanguage}</p>
                </div>
                <div className="bg-sky-50/40 border border-sky-100/50 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-sky-600 uppercase font-bold tracking-wider">Weather Notes</span>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">🌦️ {plan.localTips.weatherTips}</p>
                </div>
              </div>

              {/* Detailed Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Safety & Etiquette */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-sky-600" /> General Safety & Etiquette
                  </h3>
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Safety Advice</span>
                      <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                        {plan.localTips.safetyAdvice.map((sa, i) => <li key={i}>{sa}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Local Etiquette</span>
                      <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                        {plan.localTips.etiquette.map((et, i) => <li key={i}>{et}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Scams & Apps */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-sky-600" /> Scams & Tourist Warnings
                  </h3>
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 block mb-1">Common Scams to Avoid</span>
                      <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                        {plan.localTips.scamsToAvoid.map((scam, i) => <li key={i}>{scam}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Highly Useful Mobile Apps</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {plan.localTips.usefulApps.map((app, i) => (
                          <span key={i} className="bg-white border border-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-medium">
                            📱 {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Public Transport Options */}
                <div className="space-y-4 col-span-1 md:col-span-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-sky-600" /> Public Transportation Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plan.localTips.transportationOptions.map((opt, idx) => (
                      <div key={idx} className="bg-white border border-slate-150 p-4 rounded-xl flex items-start gap-3 shadow-2xs">
                        <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{opt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BONUS RECOMMENDATIONS */}
          {activeTab === "bonus" && (
            <div id="tab-content-bonus" className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold font-display text-slate-900 font-semibold">Traveler's Vault & Secrets</h2>
                <p className="text-xs text-slate-500">Uncover hidden trails, offbeat neighborhood markets, and alternate guides.</p>
              </div>

              {/* Grid of Bonus categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hidden Gems & offbeat spots */}
                <div className="bg-emerald-50/20 border border-emerald-150 p-5 rounded-2xl space-y-3">
                  <h3 className="font-bold font-display text-sm text-emerald-800 flex items-center gap-2 mb-1">
                    🍀 Hidden Gems (Skip the Crowds)
                  </h3>
                  <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                    {plan.bonusRecommendations.hiddenGems.map((gem, idx) => <li key={idx}>{gem}</li>)}
                  </ul>
                </div>

                {/* Shopping & Nightlife */}
                <div className="bg-fuchsia-50/20 border border-fuchsia-150 p-5 rounded-2xl space-y-3">
                  <h3 className="font-bold font-display text-sm text-fuchsia-800 flex items-center gap-2 mb-1">
                    🛍️ Shopping, Markets & Nightlife
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Local Markets</span>
                      <p className="text-xs text-slate-600 font-medium">{plan.bonusRecommendations.localMarkets.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Nightlife Districts</span>
                      <p className="text-xs text-slate-600 font-medium">{plan.bonusRecommendations.nightlife.join(", ")}</p>
                    </div>
                  </div>
                </div>

                {/* Family Friendly & Rainy Days */}
                <div className="bg-indigo-50/20 border border-indigo-150 p-5 rounded-2xl space-y-3">
                  <h3 className="font-bold font-display text-sm text-indigo-800 flex items-center gap-2 mb-1">
                    🏠 All-Weather & Group Activities
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Family-Friendly Centers</span>
                      <p className="text-xs text-slate-600 font-medium">{plan.bonusRecommendations.familyFriendly.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Rainy-Day Alternatives</span>
                      <p className="text-xs text-slate-600 font-medium">{plan.bonusRecommendations.rainyDayAlternatives.join(", ")}</p>
                    </div>
                  </div>
                </div>

                {/* Adventure Trails */}
                <div className="bg-amber-50/20 border border-amber-150 p-5 rounded-2xl space-y-3">
                  <h3 className="font-bold font-display text-sm text-amber-800 flex items-center gap-2 mb-1">
                    🧗 Action & Adventure Guides
                  </h3>
                  <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                    {plan.bonusRecommendations.adventureActivities.map((adv, idx) => <li key={idx}>{adv}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Closing Action Picker */}
      <div className="mt-12 bg-slate-100 border border-slate-200 p-6 rounded-2xl text-center space-y-4 no-print">
        <h3 className="text-base font-bold font-display text-slate-900">What would you like to do next?</h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={handlePrint}
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            1. Export this itinerary as a PDF
          </button>
          <button 
            onClick={() => setActiveTab("checklist")}
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            2. Create printable packing checklist
          </button>
          <button 
            onClick={() => setActiveTab("itinerary")}
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            3. Generate calendar-friendly schedule
          </button>
          <button 
            onClick={onReset}
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            4. Suggest alternative destinations
          </button>
        </div>
      </div>
    </div>
  );
}
