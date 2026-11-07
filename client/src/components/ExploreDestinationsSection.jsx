import React, { useState } from 'react';
import { Search, Sparkles, MapPin, Star, Compass, Filter } from 'lucide-react';
import { ALL_AUTO_SCROLL_DESTINATIONS } from '../data/autoScrollDestinations';

export default function ExploreDestinationsSection({ onSelectDestination }) {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['All', 'Trending', 'Kerala', 'India', 'International'];

  const filtered = ALL_AUTO_SCROLL_DESTINATIONS.filter((dest) => {
    // Tab filter
    if (activeTab === 'Trending') {
      if (parseFloat(dest.rating) < 4.95) return false;
    } else if (activeTab === 'Kerala') {
      if (dest.category !== 'Kerala') return false;
    } else if (activeTab === 'India') {
      if (dest.category !== 'India') return false;
    } else if (activeTab === 'International') {
      if (dest.category !== 'International') return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = dest.name.toLowerCase().includes(q);
      const matchTag = dest.tagline.toLowerCase().includes(q);
      const matchCat = dest.category.toLowerCase().includes(q);
      return matchName || matchTag || matchCat;
    }

    return true;
  });

  return (
    <section id="explore-destinations" className="py-24 bg-[#08090A] relative overflow-hidden border-t border-white/[0.06]">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[350px] bg-[#A855F7]/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-mono text-[#A855F7] uppercase tracking-widest mb-3">
              <Compass size={12} />
              <span>Global Destination Directory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-heading">
              Explore Destinations
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#A5A5A5] max-w-xl">
              Curated global wonders across Kerala backwaters, Indian heritage sanctuaries, and international capitals.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination, city, vibe..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/[0.06] border border-white/15 focus:border-[#A855F7]/60 text-sm text-white placeholder-white/40 focus:outline-none transition-colors backdrop-blur-xl"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : 'glass-panel text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Destination Image Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((dest) => (
            <div
              key={dest.id}
              onClick={() => onSelectDestination && onSelectDestination(dest.name)}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-[#111315] border border-white/10 hover:border-[#A855F7]/60 transition-all duration-500 shadow-2xl cursor-pointer"
            >
              {/* Full-Bleed Photography */}
              <img
                src={dest.image}
                alt={dest.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090A] via-[#08090A]/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

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

              {/* Bottom Card Content */}
              <div className="absolute bottom-4 left-4 right-4 space-y-1.5 pointer-events-none">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#06B6D4]">
                  <MapPin size={11} />
                  <span>{dest.duration}</span>
                </div>
                <div className="text-lg font-bold text-white group-hover:text-[#A855F7] transition-colors leading-tight font-heading">
                  {dest.name}
                </div>
                <p className="text-xs text-[#A5A5A5] line-clamp-2 leading-relaxed">
                  {dest.tagline}
                </p>

                {/* Plan Trip Button */}
                <div className="pt-2 flex justify-end">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-[#08090A] bg-white group-hover:bg-[#A855F7] group-hover:text-white transition-all duration-300 shadow-lg">
                    <Sparkles size={12} />
                    <span>Plan Journey</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#A5A5A5]">
            <p>No destinations found matching your search.</p>
          </div>
        )}

      </div>

    </section>
  );
}
