import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  Globe, 
  Sparkles,
  Play,
  Pause
} from 'lucide-react';

// Curated cinematic destinations with place name, country name, country flag, coordinates, and essential features
const HERO_VISUALS = [
  {
    id: 'switzerland',
    placeName: 'Matterhorn',
    country: 'Switzerland',
    flag: '🇨🇭',
    coordinates: '45.9763° N, 7.7491° E',
    essentialFeature: 'Alpine Glacial Peaks & Zermatt Chalets',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=2200&q=85',
  },
  {
    id: 'munnar',
    placeName: 'Munnar',
    country: 'India',
    region: 'Kerala',
    flag: '🇮🇳',
    coordinates: '10.0889° N, 77.0595° E',
    essentialFeature: 'Rolling Emerald Tea Highlands & Misty Valleys',
    image: 'https://images.unsplash.com/photo-1766671965039-8bc8687390ad?auto=format&fit=crop&w=2200&q=85',
  },
  {
    id: 'taj-mahal',
    placeName: 'Taj Mahal',
    country: 'India',
    region: 'Agra',
    flag: '🇮🇳',
    coordinates: '27.1751° N, 78.0421° E',
    essentialFeature: 'Mughal Marble Masterwork & Reflecting Water Pools',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2200&q=85',
  },
  {
    id: 'maldives',
    placeName: 'Maldives',
    country: 'Maldives',
    flag: '🇲🇻',
    coordinates: '3.2028° N, 73.2207° E',
    essentialFeature: 'Overwater Luxury Villas & Turquoise Coral Lagoons',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2200&q=85',
  },
  {
    id: 'paris',
    placeName: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    coordinates: '48.8566° N, 2.3522° E',
    essentialFeature: 'Haussmann Boulevards & Eiffel Tower Twilight',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2200&q=85',
  },
  {
    id: 'alappuzha',
    placeName: 'Alappuzha',
    country: 'India',
    region: 'Kerala',
    flag: '🇮🇳',
    coordinates: '9.4981° N, 76.3388° E',
    essentialFeature: 'Traditional Houseboats & Palm-Fringed Backwaters',
    image: 'https://images.unsplash.com/photo-1677700436033-92179d16a25f?auto=format&fit=crop&w=2200&q=85',
  },
  {
    id: 'tokyo',
    placeName: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    coordinates: '35.6762° N, 139.6503° E',
    essentialFeature: 'Shinjuku Neon Skylines & Historic Shinto Sanctuaries',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2200&q=85',
  },
  {
    id: 'bali',
    placeName: 'Bali',
    country: 'Indonesia',
    flag: '🇮🇩',
    coordinates: '8.3405° S, 115.0920° E',
    essentialFeature: 'Sacred Water Temples & Terraced Emerald Valleys',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2200&q=85',
  }
];

export default function HeroSection({ 
  onOpenPlanner, 
  onOpenDestinations,
  onExploreClick, 
  onPlanClick 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  // Automatic image transition every 6.5 seconds (pauseable via Auto toggle)
  useEffect(() => {
    if (!isAutoScroll) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_VISUALS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isAutoScroll]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERO_VISUALS.length) % HERO_VISUALS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_VISUALS.length);
  };

  const currentDest = HERO_VISUALS[currentIndex] || HERO_VISUALS[0];

  const handleTriggerPlanner = () => {
    if (onOpenPlanner) {
      onOpenPlanner({
        destination: `${currentDest.placeName}, ${currentDest.country}`,
      });
    } else if (onPlanClick) {
      onPlanClick(currentDest);
    }
  };

  const handleScrollExplore = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById('explore-destinations');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-screen min-h-[620px] overflow-hidden bg-[#050809] select-none">
      
      {/* ============================================================== */}
      {/* 1. Full-Screen Cinematic Destination Photography               */}
      {/* ============================================================== */}
      <div className="absolute inset-0 z-0">
        {HERO_VISUALS.map((dest, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={dest.id}
              className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={dest.image}
                alt={`${dest.placeName}, ${dest.country}`}
                loading={idx < 2 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover object-center animate-subtleKenBurns"
              />
              {/* Natural dark vignette for high contrast cinematic text */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050809]/80 via-[#050809]/20 to-transparent pointer-events-none z-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050809]/75 via-transparent to-transparent pointer-events-none z-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#050809]/45 via-transparent to-transparent pointer-events-none z-20" />
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 2. Left Bottom: LAT/LONG TOP -> PLACE NAME -> COUNTRY & FLAG   */}
      {/* Clean, reasonably proportioned cinematic stack                 */}
      {/* ============================================================== */}
      <div className="absolute bottom-6 sm:bottom-8 lg:bottom-10 left-6 sm:left-10 lg:left-14 z-30 pointer-events-none max-w-xl">
        <div key={currentDest.id} className="animate-fadeIn space-y-1 sm:space-y-1.5">
          
          {/* Top: Longitude & Latitude Telemetry */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-[#A9DDF0]/25 text-[#A9DDF0] text-[10px] sm:text-[11px] font-mono tracking-wider shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A9DDF0] animate-pulse" />
            <span>{currentDest.coordinates}</span>
          </div>

          {/* Middle: Cinematic Place Name (Reasonable Size) */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white font-heading drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)] leading-tight">
            {currentDest.placeName}
          </h1>

          {/* Bottom of Text: Country Name & Flag */}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="text-lg sm:text-xl filter drop-shadow">
              {currentDest.flag}
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-[0.18em] text-white uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              {currentDest.country}
              {currentDest.region && (
                <span className="text-white/60 font-medium ml-1.5 font-sans normal-case tracking-normal text-xs">
                  ({currentDest.region})
                </span>
              )}
            </span>
          </div>

          {/* Essential Feature Line */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="w-4 h-[1.5px] bg-[#A9DDF0] rounded-full shadow-[0_0_6px_rgba(169,221,240,0.8)]" />
            <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.14em] text-[#A9DDF0] uppercase drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              {currentDest.essentialFeature}
            </p>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. REASONABLY SHORT UNIFIED RIGHT-ALIGNED CINEMATIC BAR:       */}
      {/*    [ Explore ] [ Destinations ] [ AI Planner ✨ ]              */}
      {/*    [ ⏸ ] [ < 01/08 > ]                                         */}
      {/* ============================================================== */}
      <div className="absolute bottom-6 sm:bottom-8 right-5 sm:right-8 lg:right-12 z-40 pointer-events-auto">
        <div className="inline-flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-black/55 hover:bg-black/70 backdrop-blur-2xl border border-white/15 shadow-[0_12px_35px_rgba(0,0,0,0.8)] transition-all">
          
          {/* 1. Explore Button */}
          <button
            onClick={handleScrollExplore}
            className="group inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium text-white/85 hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
            aria-label="Explore Destinations"
          >
            <Compass size={13} className="text-[#06B6D4] group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">Explore</span>
          </button>

          <span className="hidden sm:block w-[1px] h-3 bg-white/15" />

          {/* 2. Destinations Button */}
          <button
            onClick={onOpenDestinations}
            className="group inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium text-white/85 hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
            aria-label="View Destinations"
          >
            <Globe size={13} className="text-[#A9DDF0] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Destinations</span>
          </button>

          <span className="w-[1px] h-3 bg-white/15" />

          {/* 3. AI Planner Button (Short, Compact Luxury Accent) */}
          <button
            onClick={handleTriggerPlanner}
            className="group inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:from-[#9333EA] hover:to-[#0891B2] border border-white/20 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all active:scale-95 flex-shrink-0"
            aria-label="Open AI Planner"
          >
            <Sparkles size={13} className="text-white group-hover:rotate-12 transition-transform animate-pulse" />
            <span>AI Planner</span>
          </button>

          <span className="w-[1px] h-3 bg-white/15" />

          {/* 4. Compact Auto Scroll Toggle */}
          <button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`group inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono transition-all active:scale-95 ${
              isAutoScroll 
                ? 'bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4]' 
                : 'bg-white/[0.05] border border-white/10 text-white/50 hover:text-white/80'
            }`}
            aria-label="Toggle Auto Scroll"
            title={isAutoScroll ? 'Pause Auto Scroll' : 'Resume Auto Scroll'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAutoScroll ? 'bg-[#06B6D4] animate-pulse' : 'bg-white/40'}`} />
            {isAutoScroll ? <Pause size={10} /> : <Play size={10} />}
          </button>

          <span className="w-[1px] h-3 bg-white/15" />

          {/* 5. Compact Scroll Navigation Controls */}
          <div className="flex items-center gap-0.5 pl-0.5">
            <button
              onClick={handlePrev}
              className="w-6 h-6 rounded-full bg-white/[0.05] hover:bg-white/[0.15] border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all active:scale-95"
              aria-label="Previous scene"
            >
              <ChevronLeft size={13} />
            </button>

            <span className="px-1 text-[10px] font-mono text-white/80 whitespace-nowrap">
              <span className="text-[#A9DDF0] font-semibold">{String(currentIndex + 1).padStart(2, '0')}</span>
              <span className="text-white/30 mx-0.5">/</span>
              <span>{String(HERO_VISUALS.length).padStart(2, '0')}</span>
            </span>

            <button
              onClick={handleNext}
              className="w-6 h-6 rounded-full bg-white/[0.05] hover:bg-white/[0.15] border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all active:scale-95"
              aria-label="Next scene"
            >
              <ChevronRight size={13} />
            </button>
          </div>

        </div>
      </div>

    </section>
  );
}
