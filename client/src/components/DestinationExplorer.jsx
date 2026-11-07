import React, { useRef } from 'react';
import { Sparkles, MapPin, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { CINEMATIC_DESTINATIONS } from '../data/cinematicDestinations';

export default function DestinationExplorer({ onSelectDestination }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="destination-gallery" className="relative py-20 bg-[#061117] overflow-hidden border-t border-white/[0.06]">
      
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[700px] h-[350px] bg-[#123B4A]/25 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-6 flex items-center justify-between">
        
        {/* Minimal Identification Badge Only (NO marketing headings or promotional text) */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#A9DDF0] shadow-[0_0_10px_#A9DDF0]" />
          <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#A9DDF0] uppercase">
            DESTINATION ATLAS • {CINEMATIC_DESTINATIONS.length} SCENES
          </span>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full glass-panel-arctic flex items-center justify-center text-white/80 hover:text-white hover:border-[#A9DDF0]/50 transition-all active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full glass-panel-arctic flex items-center justify-center text-white/80 hover:text-white hover:border-[#A9DDF0]/50 transition-all active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontal Image-Only Gallery with Small Identification Labels */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto px-6 sm:px-8 pb-8 pt-2 scroll-smooth no-scrollbar"
      >
        {CINEMATIC_DESTINATIONS.map((dest) => (
          <div
            key={dest.id}
            onClick={() => onSelectDestination(dest.name)}
            className="group relative flex-none w-[300px] sm:w-[380px] lg:w-[440px] aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#A9DDF0]/60 transition-all duration-700 shadow-2xl bg-[#0c1c24]"
          >
            {/* Shot 1: Primary 4K Image */}
            <img
              src={dest.image}
              alt={dest.name}
              loading="lazy"
              className={`w-full h-full object-cover group-hover:scale-108 transition-all duration-700 ${
                dest.secondaryImage ? 'group-hover:opacity-0' : ''
              }`}
            />

            {/* Shot 2: Secondary Image animated on hover */}
            {dest.secondaryImage && (
              <img
                src={dest.secondaryImage}
                alt={`${dest.name} Alternate View`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-108 transition-all duration-700"
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#061117]/95 via-[#061117]/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

            {/* Top Scene Number Tag */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-[#A9DDF0] bg-[#061117]/70 border border-[#A9DDF0]/30 backdrop-blur-md">
                SCENE {dest.sceneNumber}
              </span>
            </div>

            {/* Bottom: Minimal Functional Identification Label (NO marketing copy) */}
            <div className="absolute bottom-5 left-5 right-5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#A9DDF0] font-mono">
                <MapPin size={12} />
                <span>{dest.coordinates}</span>
              </div>
              
              <div className="text-xl sm:text-2xl font-extrabold text-white font-heading group-hover:text-[#A9DDF0] transition-colors">
                {dest.name}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#F5F7F7]/60 font-medium">
                  {dest.vibe}
                </span>

                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-[#061117] bg-[#A9DDF0] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Sparkles size={12} />
                  <span>Plan</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
