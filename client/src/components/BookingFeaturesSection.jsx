import React, { useState } from 'react';
import { 
  Bed, 
  Plane, 
  Utensils, 
  Compass, 
  Car, 
  Ship, 
  Mountain, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  Search, 
  CheckCircle2, 
  Star 
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function BookingFeaturesSection() {
  const { openExplorer } = useBooking();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchDestination, setSearchDestination] = useState('');

  const categories = [
    {
      id: 'hotels',
      icon: Bed,
      title: 'Hotels & Resorts',
      subtitle: 'PREMIUM STAYS',
      description: 'Book handpicked luxury hotels, heritage havelis, private villas, and verified scenic accommodations worldwide.',
      glowColor: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      tag: '5-Star & Heritage',
      perks: ['Verified Room Availability', 'Best Rate Guarantee', 'Complimentary Upgrades']
    },
    {
      id: 'flights',
      icon: Plane,
      title: 'Flights',
      subtitle: 'BEST ROUTES',
      description: 'Find direct connections, transparent multi-city routes, and live flight fare comparisons across 500+ global airlines.',
      glowColor: 'from-purple-500/20 via-pink-500/10 to-transparent',
      borderColor: 'group-hover:border-purple-500/40',
      iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      tag: 'Global GDS Verified',
      perks: ['Real-time Layover Tracking', 'Transparent Baggage Rules', 'Direct Airline Invoicing']
    },
    {
      id: 'dining',
      icon: Utensils,
      title: 'Dining & Food',
      subtitle: 'CULINARY GEMS',
      description: 'Discover Michelin-starred restaurants, historic cafés, and authentic local culinary secrets with guaranteed table reservations.',
      glowColor: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      borderColor: 'group-hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      tag: 'Michelin & Heritage',
      perks: ['Instant Table Confirmation', "Chef's Tasting Menus", 'Special Dietary Accommodations']
    },
    {
      id: 'experiences',
      icon: Compass,
      title: 'Curated Experiences',
      subtitle: 'CURATED TOURS',
      description: 'Unlock guided cultural walks, private boat excursions, and unforgettable wilderness expeditions led by certified storytellers.',
      glowColor: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'group-hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      tag: 'Small Group & Private',
      perks: ['Skip-The-Line Access', 'Licensed Local Historians', 'Flexible Cancellation']
    },
    {
      id: 'transportation',
      icon: Car,
      title: 'Seamless Transportation',
      subtitle: 'GROUND & RAIL',
      description: 'Chauffeured airport transfers, scenic panoramic trains, private car rentals, ferries, and traditional houseboats.',
      glowColor: 'from-sky-500/20 via-indigo-500/10 to-transparent',
      borderColor: 'group-hover:border-sky-500/40',
      iconBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      tag: 'Express & Scenic',
      perks: ['Flight Delay Meet & Greet', 'Zero Hidden Tolls', 'Premium Executive Fleet']
    },
    {
      id: 'cruises',
      icon: Ship,
      title: 'Cruises & Yacht Charters',
      subtitle: 'OCEAN ESCAPES',
      description: 'Ocean voyages, scenic river journeys, private sailing catamarans, and tranquil island-hopping charters with full crew.',
      glowColor: 'from-indigo-500/20 via-cyan-500/10 to-transparent',
      borderColor: 'group-hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      tag: 'Private Charters',
      perks: ['Dedicated Skipper & Chef', 'Custom Island Itineraries', 'Watersports Gear Included']
    },
    {
      id: 'adventures',
      icon: Mountain,
      title: 'Adventure & Activities',
      subtitle: 'THRILL SEEKERS',
      description: 'Trekking high-alpine peaks, glacial skiing, scuba diving coral reefs, wildlife safaris, and paragliding with certified guides.',
      glowColor: 'from-rose-500/20 via-pink-500/10 to-transparent',
      borderColor: 'group-hover:border-rose-500/40',
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      tag: 'Safety Certified',
      perks: ['UIAA / PADI Certified', 'Full Safety Gear Included', 'Emergency Heli-Evac Coverage']
    },
    {
      id: 'wellness',
      icon: Sparkles,
      title: 'Wellness & Retreats',
      subtitle: 'RELAX & RECHARGE',
      description: 'Holistic Ayurvedic retreats, thermal spring sanctuaries, daily yoga immersions, and restorative sound meditation in tranquil nature.',
      glowColor: 'from-teal-500/20 via-emerald-500/10 to-transparent',
      borderColor: 'group-hover:border-teal-500/40',
      iconBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
      tag: 'Holistic Sanctuaries',
      perks: ['Ayurvedic Doctor Consults', 'Organic Farm-to-Table', 'Silent Meditation Havens']
    },
    {
      id: 'essentials',
      icon: ShieldCheck,
      title: 'Travel Essentials',
      subtitle: 'TRAVEL MADE EASY',
      description: 'Instant global eSIMs, comprehensive international travel insurance, VIP airport lounges, and fast-track visa assistance.',
      glowColor: 'from-slate-400/20 via-blue-500/10 to-transparent',
      borderColor: 'group-hover:border-slate-400/40',
      iconBg: 'bg-slate-400/15 text-slate-300 border-slate-400/30',
      tag: 'Frictionless Travel',
      perks: ['180+ Country High-Speed eSIMs', 'Medical & Luggage Coverage', 'VIP Lounge Passes']
    }
  ];

  const filterTabs = [
    { id: 'all', label: 'All Services' },
    { id: 'hotels', label: 'Stays' },
    { id: 'flights', label: 'Flights' },
    { id: 'dining', label: 'Dining' },
    { id: 'experiences', label: 'Tours' },
    { id: 'transportation', label: 'Transit' },
    { id: 'cruises', label: 'Cruises' },
    { id: 'adventures', label: 'Adventures' },
    { id: 'wellness', label: 'Wellness' },
    { id: 'essentials', label: 'Essentials' }
  ];

  const filteredCategories = selectedFilter === 'all' 
    ? categories 
    : categories.filter(c => c.id === selectedFilter);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    openExplorer(selectedFilter === 'all' ? 'hotels' : selectedFilter, searchDestination);
  };

  return (
    <section id="features" className="relative py-24 md:py-32 bg-[#050505] overflow-hidden border-t border-white/[0.04]">
      
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-purple-900/15 via-pink-900/10 to-cyan-950/15 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header: Left Badge + Heading, Right Description */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-ping" />
              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#A9DDF0] uppercase">
                COMPLETE TRAVEL BOOKING MODULE
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-heading">
              One Place for Every Booking
            </h2>
          </div>
          
          <p className="max-w-md text-sm sm:text-base text-[#A5A5A5] leading-relaxed">
            From 5-star hotels and direct flights to Michelin dining, yacht charters, and eSIMs, TRIPONA unifies all 9 travel reservation pillars into one frictionless system.
          </p>
        </div>

        {/* Global Instant Inventory Search Bar */}
        <form 
          onSubmit={handleQuickSearch}
          className="mb-10 p-2 sm:p-2.5 rounded-2xl bg-[#0E1013]/90 border border-white/15 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
            <Search size={18} className="text-[#06B6D4] shrink-0" />
            <input 
              type="text"
              placeholder="Search hotels, flights, dining or experiences in Tokyo, Paris, Kerala, Zurich..."
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto px-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-[#15191E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/90 focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="all">All Categories</option>
              <option value="hotels">Hotels & Resorts</option>
              <option value="flights">Flights</option>
              <option value="dining">Dining & Food</option>
              <option value="experiences">Curated Tours</option>
              <option value="transportation">Ground & Rail</option>
              <option value="cruises">Yacht & Cruises</option>
              <option value="adventures">Adventure Sports</option>
              <option value="wellness">Wellness Retreats</option>
              <option value="essentials">Travel Essentials</option>
            </select>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-95 text-xs font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all shrink-0 active:scale-95"
            >
              Explore Inventory
            </button>
          </div>
        </form>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                selectedFilter === tab.id
                  ? 'bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feature Cards Grid (All 9 Categories) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCategories.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                onClick={() => openExplorer(feature.id, searchDestination)}
                className={`group relative rounded-3xl p-8 bg-[#0E1013]/80 border border-white/10 ${feature.borderColor} hover:bg-[#13161A] transition-all duration-500 overflow-hidden shadow-2xl backdrop-blur-xl cursor-pointer flex flex-col justify-between`}
              >
                {/* Subtle Card Atmospheric Background Glow */}
                <div
                  className={`absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br ${feature.glowColor} blur-[70px] rounded-full group-hover:scale-125 transition-transform duration-700 pointer-events-none`}
                />

                <div className="relative z-10 space-y-6">
                  {/* Top row: Icon & Tag */}
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={26} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold tracking-widest text-[#06B6D4] uppercase">
                        {feature.subtitle}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/80 mt-1">
                        {feature.tag}
                      </span>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A5A5A5] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Highlights Bullet Points */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    {feature.perks.map((perk, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                        <CheckCircle2 size={13} className="text-[#06B6D4] shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="relative z-10 pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#A9DDF0] group-hover:text-white transition-colors">
                    Explore & Book Live
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:bg-[#A855F7] group-hover:border-[#A855F7] group-hover:text-white transition-all duration-300">
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-purple-950/20 via-black to-cyan-950/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4] shrink-0">
              <Star size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">TRIPONA Live Guarantee & Zero Fabricated Availability</div>
              <div className="text-xs text-white/50">All prices and availability are dynamically checked against verified global networks (Amadeus, Hotelbeds, Viator, Duffel).</div>
            </div>
          </div>
          <button
            onClick={() => openExplorer('hotels')}
            className="px-6 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-white transition-all shrink-0 active:scale-95"
          >
            Open Universal Explorer
          </button>
        </div>

      </div>
    </section>
  );
}
