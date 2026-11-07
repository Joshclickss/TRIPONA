import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Star, Sparkles } from 'lucide-react';

export default function DestinationInspirationSection() {
  const destinations = [
    {
      id: 'toronto',
      name: 'Toronto, Canada',
      tagline: 'Modern skyline, lake breezes & multicultural culinary scene',
      image: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=1000&q=80',
      tag: 'Featured',
      rating: '4.9',
      duration: '4-6 Days',
      season: 'Spring / Summer',
    },
    {
      id: 'paris',
      name: 'Paris, France',
      tagline: 'Romantic boulevards, world-class art & haute cuisine',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      tag: 'Cultural',
      rating: '4.95',
      duration: '5-7 Days',
      season: 'Autumn / Spring',
    },
    {
      id: 'agra',
      name: 'Agra, India',
      tagline: 'Mughal architectural masterworks and timeless love',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
      tag: 'UNESCO Heritage',
      rating: '4.92',
      duration: '3-4 Days',
      season: 'Winter',
    },
    {
      id: 'bali',
      name: 'Bali, Indonesia',
      tagline: 'Emerald terraced valleys, sacred temples & coastal waves',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      tag: 'Island Retreat',
      rating: '4.88',
      duration: '7-10 Days',
      season: 'Year-round',
    },
    {
      id: 'switzerland',
      name: 'Zermatt, Switzerland',
      tagline: 'Iconic Matterhorn peaks, alpine railways & pristine air',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      tag: 'Alpine Luxury',
      rating: '4.97',
      duration: '5-8 Days',
      season: 'Winter / Summer',
    },
  ];

  const [featuredIndex, setFeaturedIndex] = useState(0);

  const featured = destinations[featuredIndex];
  const sideCards = destinations.filter((_, idx) => idx !== featuredIndex);

  const handleNext = () => {
    setFeaturedIndex((prev) => (prev + 1) % destinations.length);
  };

  const handlePrev = () => {
    setFeaturedIndex((prev) => (prev - 1 + destinations.length) % destinations.length);
  };

  return (
    <section id="explore" className="relative py-24 md:py-32 bg-[#050505] overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[30%] left-[20%] w-[600px] h-[400px] bg-purple-900/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header with Navigation Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10">
              <span className="text-[11px] font-semibold tracking-[0.2em] text-white/80 uppercase">
                DESTINATION SHOWCASE
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-heading">
              Inspire Your Adventure
            </h2>
            <p className="text-sm sm:text-base text-[#A5A5A5] max-w-lg">
              Explore handpicked international destinations dynamically tailored to your travel mood.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="w-11 h-11 rounded-full glass-panel hover:bg-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
              aria-label="Previous destination"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="w-11 h-11 rounded-full glass-panel hover:bg-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
              aria-label="Next destination"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Gallery Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Large Featured Card (Left 5-6 Cols) */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden aspect-[3/4] sm:aspect-[4/5] lg:aspect-auto lg:h-[480px] border border-white/15 shadow-2xl group">
            <img
              src={featured.image}
              alt={featured.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold text-purple-300 border border-purple-500/30">
                {featured.tag}
              </span>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-amber-300 border border-amber-500/30">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span>{featured.rating}</span>
              </div>
            </div>

            {/* Bottom Details */}
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                <MapPin size={13} className="text-purple-400" />
                <span>{featured.duration} • {featured.season}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                {featured.name}
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed line-clamp-2">
                {featured.tagline}
              </p>
            </div>
          </div>

          {/* Right Smaller Destination Cards (7 Cols, 3 Columns Grid) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:h-[480px]">
            {sideCards.slice(0, 3).map((item) => {
              const originalIdx = destinations.findIndex((d) => d.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setFeaturedIndex(originalIdx)}
                  className="group relative rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-auto lg:h-full border border-white/10 hover:border-purple-400/50 bg-[#121218] cursor-pointer transition-all duration-300 shadow-lg"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  
                  {/* Floating Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-white/80 border border-white/10">
                      {item.tag}
                    </span>
                  </div>

                  {/* Destination Info */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-1">
                    <div className="text-[14px] font-bold text-white group-hover:text-purple-200 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-[#A5A5A5] line-clamp-1">
                      {item.tagline}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </section>
  );
}
