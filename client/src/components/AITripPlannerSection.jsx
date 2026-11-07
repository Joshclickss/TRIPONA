import React from 'react';
import AdvancedAIPlanner from './AdvancedAIPlanner';

export default function AITripPlannerSection({ prefilledDestination = '', initialDestination = '' }) {
  const destination = prefilledDestination || initialDestination || '';

  return (
    <section id="ai-planner-section" className="py-20 bg-[#08090A] relative overflow-hidden border-t border-white/[0.06]">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-r from-[#A855F7]/12 to-[#06B6D4]/12 blur-[170px] rounded-full pointer-events-none" />

      {/* Render Full Advanced AI Planner Engine */}
      <AdvancedAIPlanner initialDestination={destination} />
    </section>
  );
}
