import React, { useRef } from 'react';
import { Sparkles, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  KERALA_DESTINATIONS, 
  INDIA_DESTINATIONS, 
  INTERNATIONAL_DESTINATIONS 
} from '../data/autoScrollDestinations';

export default function DestinationAutoScroll({ onSelectDestination }) {
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const row3Ref = useRef(null);

  // Duplicate items for seamless infinite looping
  const row1Items = [...KERALA_DESTINATIONS, ...INDIA_DESTINATIONS.slice(0, 3)];
  const row1Full = [...row1Items, ...row1Items];

  const row2Items = [...INDIA_DESTINATIONS, ...KERALA_DESTINATIONS.slice(0, 2)];
  const row2Full = [...row2Items, ...row2Items];

  const row3Items = [...INTERNATIONAL_DESTINATIONS];
  const row3Full = [...row3Items, ...row3Items];

  const scrollManual = (ref, distance) => {
    if (ref.current) {
      ref.current.scrollBy({ left: distance, behavior: 'smooth' });
    }
  };

  const renderCard = (dest, keyPrefix) => (
    <div
      key={`${keyPrefix}-${dest.id}`}
      onClick={() => onSelectDestination && onSelectDestination(dest.name)}
      className="group relative flex-none w-[260px] sm:w-[320px] aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer bg-[#111315] border border-white/[0.08] hover:border-[#A855F7]/60 transition-all duration-500 shadow-2xl select-none"
    >
      {/* Destination High-Resolution Photography */}
      <img
        src={dest.image}
        alt={dest.name}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
      />

      {/* Atmospheric Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08090A] via-[#08090A]/35 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

      {/* Top Floating Badge */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider text-white bg-black/60 border border-white/10 backdrop-blur-md">
          {dest.category}
        </span>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-semibold text-amber-300">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span>{dest.rating}</span>
        </div>
      </div>

      {/* Bottom Content & Direct Action */}
      <div className="absolute bottom-4 left-4 right-4 space-y-1.5 pointer-events-none">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#06B6D4]">
          <MapPin size={11} />
          <span>{dest.duration}</span>
        </div>
        <div className="text-base sm:text-lg font-bold text-white group-hover:text-[#A855F7] transition-colors leading-tight font-heading">
          {dest.name}
        </div>
        <p className="text-[11px] text-[#A5A5A5] line-clamp-1 leading-snug">
          {dest.tagline}
        </p>

        {/* Floating Quick Plan Action */}
        <div className="pt-1 flex justify-end">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-[#08090A] bg-white group-hover:bg-[#A855F7] group-hover:text-white transition-all duration-300 shadow-md">
            <Sparkles size={11} />
            <span>Plan Trip</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="auto-scroll-gallery" className="relative py-24 bg-[#08090A] overflow-hidden border-t border-white/[0.06]">
      
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[300px] bg-[#A855F7]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[500px] h-[300px] bg-[#06B6D4]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-mono text-[#06B6D4] uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-ping" />
            <span>Infinite Destination Atlas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight font-heading">
            Explore 24+ Global Destinations
          </h2>
        </div>

        {/* Manual Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              scrollManual(row1Ref, -340);
              scrollManual(row2Ref, 340);
              scrollManual(row3Ref, -340);
            }}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white/70 hover:text-white border border-white/10 hover:border-white/30 transition-all active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => {
              scrollManual(row1Ref, 340);
              scrollManual(row2Ref, -340);
              scrollManual(row3Ref, 340);
            }}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white/70 hover:text-white border border-white/10 hover:border-white/30 transition-all active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Row 1: Kerala & Coastal Wonders (Auto-Scroll Left)             */}
      {/* ============================================================== */}
      <div className="mb-6 marquee-container relative overflow-hidden">
        <div
          ref={row1Ref}
          className="flex gap-5 w-max animate-marquee-left hover-pause no-scrollbar overflow-x-auto px-4"
        >
          {row1Full.map((dest, i) => renderCard(dest, `row1-${i}`))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* Row 2: Indian Heritage & Alpine Peaks (Auto-Scroll Right)       */}
      {/* ============================================================== */}
      <div className="mb-6 marquee-container relative overflow-hidden">
        <div
          ref={row2Ref}
          className="flex gap-5 w-max animate-marquee-right hover-pause no-scrollbar overflow-x-auto px-4"
        >
          {row2Full.map((dest, i) => renderCard(dest, `row2-${i}`))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* Row 3: Iconic International Metropolises (Auto-Scroll Left)    */}
      {/* ============================================================== */}
      <div className="marquee-container relative overflow-hidden">
        <div
          ref={row3Ref}
          className="flex gap-5 w-max animate-marquee-left-fast hover-pause no-scrollbar overflow-x-auto px-4"
        >
          {row3Full.map((dest, i) => renderCard(dest, `row3-${i}`))}
        </div>
      </div>

    </section>
  );
}
