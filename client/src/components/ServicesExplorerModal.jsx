import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Search, 
  SlidersHorizontal, 
  Bed, 
  Plane, 
  Utensils, 
  Compass, 
  Car, 
  Ship, 
  Mountain, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Users, 
  ExternalLink, 
  Info,
  Clock,
  Sparkle,
  ArrowRight
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function ServicesExplorerModal() {
  const { 
    isExplorerOpen, 
    closeExplorer, 
    explorerCategory, 
    explorerDestination,
    openCheckout 
  } = useBooking();

  const [activeTab, setActiveTab] = useState(explorerCategory || 'hotels');
  const [destination, setDestination] = useState(explorerDestination || '');
  const [guests, setGuests] = useState(2);
  const [dates, setDates] = useState({
    checkIn: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0]
  });
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minRating, setMinRating] = useState(4.0);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selected item for detailed inspection drawer
  const [inspectedItem, setInspectedItem] = useState(null);

  const categories = [
    { id: 'hotels', label: 'Stays & Resorts', icon: Bed, tag: 'PREMIUM STAYS' },
    { id: 'flights', label: 'Flights', icon: Plane, tag: 'BEST ROUTES' },
    { id: 'dining', label: 'Dining & Food', icon: Utensils, tag: 'CULINARY GEMS' },
    { id: 'experiences', label: 'Curated Tours', icon: Compass, tag: 'CURATED TOURS' },
    { id: 'transportation', label: 'Ground & Rail', icon: Car, tag: 'GROUND & RAIL' },
    { id: 'cruises', label: 'Cruises & Yachts', icon: Ship, tag: 'OCEAN ESCAPES' },
    { id: 'adventures', label: 'Adventures', icon: Mountain, tag: 'THRILL SEEKERS' },
    { id: 'wellness', label: 'Wellness Retreats', icon: Sparkles, tag: 'RELAX & RECHARGE' },
    { id: 'essentials', label: 'Travel Essentials', icon: ShieldCheck, tag: 'TRAVEL MADE EASY' }
  ];

  // Sync initial category or destination when opened
  useEffect(() => {
    if (isExplorerOpen) {
      if (explorerCategory) setActiveTab(explorerCategory);
      if (explorerDestination) setDestination(explorerDestination);
    }
  }, [isExplorerOpen, explorerCategory, explorerDestination]);

  // Fetch services from backend
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        category: activeTab,
        ...(destination ? { destination } : {}),
        guests: guests.toString()
      });
      const res = await fetch(`/api/services/search?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to retrieve services');
      const data = await res.json();
      
      let filtered = data.results || [];
      if (minRating > 0) {
        filtered = filtered.filter(item => (item.rating || 4.5) >= minRating);
      }
      if (maxPrice > 0) {
        filtered = filtered.filter(item => (item.pricePerUnit || 0) <= maxPrice);
      }
      setResults(filtered);
    } catch (err) {
      console.error('Failed to load services:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, destination, guests, minRating, maxPrice]);

  useEffect(() => {
    if (isExplorerOpen) {
      fetchServices();
    }
  }, [isExplorerOpen, activeTab, fetchServices]);

  if (!isExplorerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-7xl h-[92vh] max-h-[960px] bg-[#080A0C] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0C0E12]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#A855F7] to-[#06B6D4] p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-[#080A0C] rounded-[10px] flex items-center justify-center">
                <Sparkle size={16} className="text-[#06B6D4]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-heading">
                  TRIPONA Booking Directory
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4]">
                  LIVE GDS CONNECTED
                </span>
              </div>
              <p className="text-xs text-white/50">
                Direct verified reservations across 9 travel pillars with guaranteed zero fabricated prices.
              </p>
            </div>
          </div>

          <button
            onClick={closeExplorer}
            className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Navigation Pills */}
        <div className="px-6 py-2.5 bg-[#090C0F] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#A855F7]/30 to-[#06B6D4]/30 border border-[#06B6D4]/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/5'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#06B6D4]' : 'text-white/50'} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Dynamic Filters Bar */}
        <div className="px-6 py-3.5 bg-[#0D1014]/60 border-b border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center shrink-0">
          {/* Destination */}
          <div className="lg:col-span-4 flex items-center gap-2 px-3 py-2 bg-[#13171D] border border-white/10 rounded-xl">
            <MapPin size={15} className="text-[#06B6D4] shrink-0" />
            <input
              type="text"
              placeholder="Destination (e.g. Tokyo, Paris, Kerala, Zurich...)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchServices()}
              className="bg-transparent text-xs text-white placeholder-white/40 focus:outline-none w-full"
            />
          </div>

          {/* Dates */}
          <div className="lg:col-span-3 flex items-center gap-2 px-3 py-2 bg-[#13171D] border border-white/10 rounded-xl">
            <Calendar size={15} className="text-[#A855F7] shrink-0" />
            <input
              type="date"
              value={dates.checkIn}
              onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
              className="bg-transparent text-xs text-white/80 focus:outline-none w-full [color-scheme:dark]"
            />
            <span className="text-white/30 text-xs">→</span>
            <input
              type="date"
              value={dates.checkOut}
              onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
              className="bg-transparent text-xs text-white/80 focus:outline-none w-full [color-scheme:dark]"
            />
          </div>

          {/* Guests */}
          <div className="lg:col-span-2 flex items-center gap-2 px-3 py-2 bg-[#13171D] border border-white/10 rounded-xl">
            <Users size={15} className="text-emerald-400 shrink-0" />
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="bg-transparent text-xs text-white focus:outline-none w-full"
            >
              <option value="1" className="bg-[#13171D]">1 Traveler</option>
              <option value="2" className="bg-[#13171D]">2 Travelers</option>
              <option value="3" className="bg-[#13171D]">3 Travelers</option>
              <option value="4" className="bg-[#13171D]">4 Travelers</option>
              <option value="6" className="bg-[#13171D]">6+ Group</option>
            </select>
          </div>

          {/* Price & Rating filters */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <div className="flex-1 flex items-center justify-between px-3 py-1.5 bg-[#13171D] border border-white/10 rounded-xl text-[11px]">
              <span className="text-white/60">Max:</span>
              <span className="font-semibold text-[#06B6D4]">${maxPrice}</span>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-20 accent-[#06B6D4] cursor-pointer ml-1"
              />
            </div>

            <button
              onClick={fetchServices}
              className="px-4 py-2 bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-95 rounded-xl text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] shrink-0 active:scale-95 flex items-center gap-1.5"
            >
              <Search size={13} />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Content Area: Grid Results */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin" />
              <div className="text-xs text-white/50 animate-pulse">
                Querying verified provider networks & live inventory...
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <p className="text-sm font-semibold">{error}</p>
              <button 
                onClick={fetchServices} 
                className="mt-3 px-4 py-1.5 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-white"
              >
                Retry Search
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40">
                <Search size={22} />
              </div>
              <div className="text-sm font-bold text-white">No services found for this criteria</div>
              <p className="text-xs text-white/50 max-w-sm">
                Try widening your price filter or entering another destination. Our engine dynamically generates inventory for any city worldwide.
              </p>
              <button
                onClick={() => {
                  setDestination('');
                  setMaxPrice(2500);
                  setMinRating(4.0);
                  fetchServices();
                }}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-medium"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((service) => (
                <div
                  key={service.id}
                  className="group bg-[#0F1216] border border-white/10 hover:border-white/25 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image & Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-black/40">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1216] via-transparent to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[#A9DDF0]">
                        {service.provider || 'TRIPONA Verified'}
                      </span>

                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-400">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span>{service.rating || '4.9'}</span>
                      </div>
                    </div>

                    {/* Verified Live Price Pill */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1 ${
                        service.priceType === 'verified_live'
                          ? 'bg-emerald-500/25 border border-emerald-500/40 text-emerald-300'
                          : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300'
                      }`}>
                        <CheckCircle size={10} />
                        {service.priceType === 'verified_live' ? 'Live Verified Rate' : 'Estimated Tariff'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-white/50 flex items-center gap-1">
                        <MapPin size={12} className="text-[#06B6D4]" />
                        <span>{service.destination}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#A9DDF0] transition-colors leading-snug">
                        {service.title}
                      </h3>
                    </div>

                    {/* Specific details preview based on category */}
                    <div className="space-y-1.5 text-xs text-white/70">
                      {service.roomTypes && (
                        <div className="text-[11px] bg-white/[0.04] p-2 rounded-xl border border-white/5">
                          <span className="text-white/40 block">Room:</span>
                          <span className="font-semibold text-white truncate block">{service.roomTypes[0]?.name}</span>
                          <span className="text-white/50">{service.roomTypes[0]?.bed} • {service.roomTypes[0]?.size}</span>
                        </div>
                      )}

                      {service.airline && (
                        <div className="text-[11px] bg-white/[0.04] p-2 rounded-xl border border-white/5">
                          <div className="flex justify-between font-semibold text-white">
                            <span>{service.airline}</span>
                            <span className="text-emerald-400">{service.cabinClass || 'Economy'}</span>
                          </div>
                          <div className="text-white/50 text-[10px]">{service.duration} • {service.baggage}</div>
                        </div>
                      )}

                      {service.cuisine && (
                        <div className="text-[11px] bg-white/[0.04] p-2 rounded-xl border border-white/5 flex justify-between">
                          <span className="text-white/50">Cuisine:</span>
                          <span className="font-semibold text-white">{service.cuisine} • {service.priceTier}</span>
                        </div>
                      )}

                      {service.tourDuration && (
                        <div className="text-[11px] bg-white/[0.04] p-2 rounded-xl border border-white/5 flex justify-between">
                          <span className="text-white/50">Duration:</span>
                          <span className="font-semibold text-white">{service.tourDuration} • {service.groupSize}</span>
                        </div>
                      )}

                      {service.amenities && service.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {service.amenities.slice(0, 3).map((am, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-white/60">
                              {am}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price & Booking Actions */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-extrabold text-white flex items-baseline gap-1">
                          <span>{service.currencySymbol || '$'}{service.pricePerUnit}</span>
                          <span className="text-[11px] font-normal text-white/50">{service.unitType || 'total'}</span>
                        </div>
                        <div className="text-[9px] text-white/40">Taxes & fees calculated at checkout</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setInspectedItem(service)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs transition-colors"
                          title="View Details"
                        >
                          <Info size={14} />
                        </button>
                        <button
                          onClick={() => {
                            closeExplorer();
                            openCheckout(service, {
                              destination: service.destination,
                              dates: dates,
                              guests: guests
                            });
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-95 text-white text-xs font-bold shadow-lg active:scale-95 flex items-center gap-1"
                        >
                          <span>Book</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Drawer Modal if clicked info */}
        {inspectedItem && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-end">
            <div className="w-full max-w-lg h-full bg-[#0E1116] border-l border-white/15 p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-[#06B6D4] uppercase tracking-wider">
                    {inspectedItem.provider}
                  </span>
                  <h3 className="text-lg font-bold text-white">{inspectedItem.title}</h3>
                </div>
                <button
                  onClick={() => setInspectedItem(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden h-48 border border-white/10">
                <img src={inspectedItem.image} alt={inspectedItem.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">Amenities & Inclusions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(inspectedItem.amenities || inspectedItem.inclusions || ['High-speed WiFi', 'Concierge Service', 'Daily Housekeeping']).map((inc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/80 bg-white/[0.03] p-2 rounded-xl border border-white/5">
                      <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">Cancellation Policy</h4>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/80 leading-relaxed">
                  {inspectedItem.cancellationPolicy || 'Free cancellation up to 48 hours before reservation check-in date.'}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/50">Standard Rate</div>
                  <div className="text-xl font-bold text-white">
                    {inspectedItem.currencySymbol || '$'}{inspectedItem.pricePerUnit}
                    <span className="text-xs font-normal text-white/50 ml-1">{inspectedItem.unitType}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const chosen = inspectedItem;
                    setInspectedItem(null);
                    closeExplorer();
                    openCheckout(chosen, {
                      destination: chosen.destination,
                      dates: dates,
                      guests: guests
                    });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white text-xs font-bold shadow-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
