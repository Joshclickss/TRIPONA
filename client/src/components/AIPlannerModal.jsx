import React from 'react';
import { X, Sparkles } from 'lucide-react';
import AdvancedAIPlanner from './AdvancedAIPlanner';

export default function AIPlannerModal({ isOpen, onClose, initialDestination }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-3xl p-4 sm:p-6 md:p-8 bg-[#090B0E] border border-white/20 shadow-[0_25px_90px_rgba(0,0,0,0.98),0_0_50px_rgba(168,85,247,0.25)] my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Planner"
          className="sticky top-0 float-right z-30 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
        >
          <X size={18} />
        </button>

        <div className="clear-both">
          <AdvancedAIPlanner initialDestination={initialDestination} />
        </div>
      </div>
    </div>
  );
}
