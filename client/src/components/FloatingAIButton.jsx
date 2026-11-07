import React from 'react';
import { Sparkles } from 'lucide-react';

export default function FloatingAIButton({ onClick }) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        className="group relative flex items-center gap-2.5 px-5 py-3 rounded-full text-xs font-bold text-[#061117] bg-[#A9DDF0] hover:bg-white shadow-[0_0_35px_rgba(169,221,240,0.5)] transition-all duration-300 active:scale-95 border border-white/40"
        aria-label="Open AI Trip Planner"
      >
        <div className="relative">
          <Sparkles size={16} className="text-[#061117] group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#123B4A] animate-ping" />
        </div>
        <span className="tracking-wide">AI Trip Planner</span>
      </button>
    </div>
  );
}
