import React, { useState } from "react";
import TravelAssistantChat from "./components/TravelAssistantChat";
import TripDashboard from "./components/TripDashboard";
import { TravelPlan } from "./types";
import { Compass, Globe } from "lucide-react";

export default function App() {
  const [generatedPlan, setGeneratedPlan] = useState<TravelPlan | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors">
      {/* Sleek navigation header */}
      <header className="bg-white border-b border-slate-250 py-4 px-6 shrink-0 no-print shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => setGeneratedPlan(null)}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <span className="p-2 bg-sky-600 text-white rounded-lg group-hover:bg-sky-700 transition-colors">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </span>
            <div>
              <span className="font-extrabold font-display tracking-tight text-slate-900 text-base">TravelVerse</span>
              <span className="text-[10px] text-sky-600 font-bold tracking-widest uppercase ml-2 select-none">AI Studio</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              Global Curator Enabled
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center items-center">
        {generatedPlan ? (
          <TripDashboard 
            plan={generatedPlan} 
            onReset={() => setGeneratedPlan(null)} 
          />
        ) : (
          <TravelAssistantChat 
            onPlanGenerated={(plan) => setGeneratedPlan(plan)} 
          />
        )}
      </main>
    </div>
  );
}

