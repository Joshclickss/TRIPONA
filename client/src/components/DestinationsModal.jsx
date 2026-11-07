import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, DollarSign, Star, Compass, Sparkles, Loader2 } from 'lucide-react';

export default function DestinationsModal({ isOpen, onClose, onSelectDestination }) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContinent, setActiveContinent] = useState('All');

  useEffect(() => {
    if (!isOpen) return;
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/destinations');
        if (res.ok) {
          const data = await res.json();
          setDestinations(data);
        }
      } catch (err) {
        console.error('Failed to fetch destinations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, [isOpen]);

  if (!isOpen) return null;

  const continents = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania'];

  const filtered = destinations.filter((dest) => {
    const matchesSearch = 
      (dest.name && dest.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dest.country && dest.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dest.tagline && dest.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesContinent = 
      activeContinent === 'All' || 
      (dest.continent && dest.continent.toLowerCase() === activeContinent.toLowerCase());
    return matchesSearch && matchesContinent;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-3xl p-6 sm:p-8 bg-[#0c0c14] border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(34,211,238,0.25)] max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Compass size={13} />
              <span>TRIPONA Global Atlas</span>
            </div>
            <h3 className="text-2xl font-bold text-white font-heading">
              Explore Destinations
            </h3>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country, city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
          {continents.map((continent) => (
            <button
              key={continent}
              onClick={() => setActiveContinent(continent)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                activeContinent === continent
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {continent}
            </button>
          ))}
        </div>

        {/* Destination Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/50 space-y-3">
              <Loader2 size={32} className="animate-spin text-cyan-400" />
              <p className="text-xs">Loading world destinations from database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center text-white/40 text-sm">
              No destinations found matching your criteria.
            </div>
          ) : (
            filtered.map((dest) => (
              <div
                key={dest._id || dest.name}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] border border-white/10 hover:border-cyan-400/50 bg-[#14141c] transition-all duration-300 shadow-xl flex flex-col justify-end p-4"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Floating continent tag */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
                    {dest.continent || dest.country}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                    <MapPin size={11} className="text-cyan-400" />
                    <span>{dest.country}</span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors font-heading leading-tight">
                    {dest.name}
                  </h4>
                  <p className="text-[11px] text-[#A5A5A5] line-clamp-2 leading-relaxed">
                    {dest.tagline || dest.description}
                  </p>
                  
                  <button
                    onClick={() => {
                      onSelectDestination(dest.name);
                      onClose();
                    }}
                    className="w-full mt-2 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-2 border border-white/15 active:scale-95"
                  >
                    <Sparkles size={13} />
                    <span>Plan Trip Here</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
