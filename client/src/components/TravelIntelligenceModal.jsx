import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { 
  X, 
  Search, 
  Globe, 
  ShieldCheck, 
  ExternalLink, 
  DollarSign, 
  Clock, 
  MapPin, 
  Send, 
  Loader2, 
  Info, 
  TrendingUp,
  Building,
  Plane,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function TravelIntelligenceModal({ isOpen, onClose, initialDestination = 'Tokyo' }) {
  const [searchQuery, setSearchQuery] = useState(initialDestination);
  const [activeCity, setActiveCity] = useState(initialDestination);
  const [activeCurrency, setActiveCurrency] = useState('USD');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'budget' | 'ai' | 'bookings'
  
  // Data states
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState(null);
  const [error, setError] = useState(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Budget Calculator state
  const [travellerGroup, setTravellerGroup] = useState('couple');
  const [travelStyle, setTravelStyle] = useState('mid-range');
  const [durationDays, setDurationDays] = useState(7);
  const [calculatedBudget, setCalculatedBudget] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  // AI Grounded Q&A state
  const [userQuestion, setUserQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch Destination Dossier
  const fetchDossier = async (cityName, currency = activeCurrency) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/api/intelligence/destination?city=${encodeURIComponent(cityName)}&currency=${currency}`);
      setDossier(data);
      setCalculatedBudget(data.calculatedBudget);
      setActiveCity(data.destination.name);
    } catch (err) {
      console.error('Error fetching destination dossier:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDossier(initialDestination || 'Tokyo', activeCurrency);
    }
  }, [isOpen, initialDestination]);

  // Recalculate budget when controls change
  useEffect(() => {
    if (!dossier) return;
    const recalculate = async () => {
      setBudgetLoading(true);
      try {
        const res = await fetch('/api/intelligence/calculate-budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: dossier.destination.name,
            country: dossier.destination.country,
            durationDays: Number(durationDays),
            travellerGroup,
            travelStyle,
            targetCurrency: activeCurrency
          })
        });
        if (res.ok) {
          const data = await res.json();
          setCalculatedBudget(data);
        }
      } catch (err) {
        console.error('Recalculate budget error:', err);
      } finally {
        setBudgetLoading(false);
      }
    };
    recalculate();
  }, [travellerGroup, travelStyle, durationDays, activeCurrency]);

  // Handle City Autocomplete Search
  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(`/api/destinations/search-cities?q=${encodeURIComponent(val.trim())}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      }
    } catch (e) {}
  };

  const handleSelectCity = (cityObj) => {
    const query = `${cityObj.city}, ${cityObj.country}`;
    setSearchQuery(query);
    setShowDropdown(false);
    fetchDossier(cityObj.city, activeCurrency);
  };

  // Handle Grounded AI Question
  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!userQuestion.trim() || aiLoading) return;
    setAiLoading(true);
    setAiAnswer(null);
    try {
      const res = await fetch('/api/intelligence/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuestion.trim(),
          destination: activeCity
        })
      });
      if (!res.ok) throw new Error('AI query failed');
      const data = await res.json();
      setAiAnswer(data);
    } catch (err) {
      setAiAnswer({ answer: `Failed to retrieve verified answer: ${err.message}` });
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#090b10] border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Top Header & Search Bar */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-[#0d1117] via-[#10141f] to-[#0d1117]">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#A855F7] to-[#06B6D4] p-0.5 flex items-center justify-center shadow-lg shadow-[#06B6D4]/20">
                <div className="w-full h-full rounded-[14px] bg-[#090b10] flex items-center justify-center">
                  <Globe size={18} className="text-[#06B6D4] animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    Real-Time Global Travel Intelligence
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/30">
                    <ShieldCheck size={10} /> Verified Ground Truth
                  </span>
                </div>
                <p className="text-[11px] text-white/50">
                  Source-backed factual data, live foreign exchange & verified destination dossiers
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search + Currency Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 50,000+ World Cities Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search any destination worldwide (e.g. Tokyo, Munich, Munnar, Paris, Cairo)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#06B6D4] transition-all"
              />

              {/* Suggestions Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-[#0d121c] border border-white/20 shadow-2xl backdrop-blur-2xl max-h-56 overflow-y-auto divide-y divide-white/10">
                  {suggestions.map((c, idx) => (
                    <button
                      key={c.cityId || idx}
                      type="button"
                      onClick={() => handleSelectCity(c)}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-[#06B6D4]/15 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-white">{c.city}</span>
                        {c.adminName && c.adminName !== c.city && (
                          <span className="text-white/40 text-[10px] ml-1">({c.adminName})</span>
                        )}
                        <span className="text-[#06B6D4] text-[11px] ml-1.5">{c.country}</span>
                      </div>
                      {c.population > 0 && (
                        <span className="text-[10px] font-mono text-white/40">
                          {c.population > 1000000 ? (c.population / 1000000).toFixed(1) + 'M' : (c.population / 1000).toFixed(0) + 'k'} pop
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Currency Selector */}
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-mono text-white/60">Currency:</label>
              <select
                value={activeCurrency}
                onChange={(e) => {
                  setActiveCurrency(e.target.value);
                  if (dossier) fetchDossier(dossier.destination.name, e.target.value);
                }}
                className="px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-[#A855F7]"
              >
                <option value="USD" className="bg-[#0c0f16]">USD ($)</option>
                <option value="EUR" className="bg-[#0c0f16]">EUR (€)</option>
                <option value="INR" className="bg-[#0c0f16]">INR (₹)</option>
                <option value="GBP" className="bg-[#0c0f16]">GBP (£)</option>
                <option value="JPY" className="bg-[#0c0f16]">JPY (¥)</option>
                <option value="CHF" className="bg-[#0c0f16]">CHF</option>
                <option value="AUD" className="bg-[#0c0f16]">AUD (A$)</option>
                <option value="CAD" className="bg-[#0c0f16]">CAD (C$)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-4">
            <Loader2 size={32} className="text-[#06B6D4] animate-spin" />
            <p className="text-xs text-white/60 font-mono">
              Retrieving verified ground truth, OpenStreetMap venues & live FX rates...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle size={32} className="text-rose-400 mx-auto" />
            <p className="text-sm text-white/80">{error}</p>
            <button
              onClick={() => fetchDossier(activeCity)}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
            >
              Retry
            </button>
          </div>
        ) : dossier ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Destination Highlight Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 p-5 flex flex-col sm:flex-row gap-5 items-start">
              {dossier.verifiedSummary.imageUrl && (
                <img
                  src={dossier.verifiedSummary.imageUrl}
                  alt={dossier.destination.name}
                  className="w-full sm:w-44 h-32 object-cover rounded-xl shadow-lg border border-white/10"
                />
              )}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {dossier.destination.fullName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/80 border border-white/15">
                    {dossier.destination.coordinates.lat.toFixed(4)}°, {dossier.destination.coordinates.lng.toFixed(4)}°
                  </span>
                  {dossier.destination.population > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/30">
                      Pop: {(dossier.destination.population / 1000000).toFixed(1)}M
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/70 leading-relaxed line-clamp-3">
                  {dossier.verifiedSummary.overview}
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-white/50">
                  <span className="flex items-center gap-1 text-[#06B6D4]">
                    <CheckCircle2 size={12} />
                    Source: {dossier.verifiedSummary.source?.name}
                  </span>
                  <a
                    href={dossier.verifiedSummary.source?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-0.5 text-white/60 hover:text-white"
                  >
                    View Original <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              {[
                { id: 'overview', label: 'Verified Sights & Details', icon: Compass },
                { id: 'budget', label: 'Real-Time Budget Engine', icon: DollarSign },
                { id: 'ai', label: 'Fact-Checked AI Q&A', icon: ShieldCheck },
                { id: 'bookings', label: 'Official Booking Direct Links', icon: ExternalLink }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white shadow-lg shadow-[#A855F7]/25' 
                        : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: SIGHTS & ATTRACTIONS */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    OpenStreetMap Verified Landmarks & Venues ({dossier.verifiedAttractions.length})
                  </h4>
                  <span className="text-[10px] text-white/40 font-mono">
                    No fabricated venues or opening hours
                  </span>
                </div>

                {dossier.verifiedAttractions.length === 0 ? (
                  <p className="text-xs text-white/50 italic py-4">No verified public venues logged for this specific administrative boundary.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dossier.verifiedAttractions.map((place, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-white/[0.03] border border-white/10 p-3.5 space-y-2 hover:border-[#06B6D4]/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-white block">{place.name}</span>
                            <span className="text-[10px] text-[#06B6D4] uppercase font-mono">{place.category}</span>
                          </div>
                          {place.officialWebsite ? (
                            <a
                              href={place.officialWebsite}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold text-[#06B6D4] bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 border border-[#06B6D4]/30 flex items-center gap-1"
                            >
                              Official Portal <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] text-white/40 bg-white/5">
                              Public Landmark
                            </span>
                          )}
                        </div>

                        {place.openingHours && (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                            <Clock size={11} />
                            <span>{place.openingHours}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-white/50">
                          <span>{place.feeRequired}</span>
                          <span className="text-white/30">{place.coordinates.lat.toFixed(4)}°, {place.coordinates.lng.toFixed(4)}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LIVE BUDGET ENGINE */}
            {activeTab === 'budget' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Budget Parameters Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/60 uppercase">Party Size</label>
                    <select
                      value={travellerGroup}
                      onChange={(e) => setTravellerGroup(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white"
                    >
                      <option value="solo" className="bg-[#090b10]">Solo Explorer (1 person)</option>
                      <option value="couple" className="bg-[#090b10]">Couple / 2 Travellers</option>
                      <option value="family" className="bg-[#090b10]">Family (2 adults + 2 kids)</option>
                      <option value="group" className="bg-[#090b10]">Group (5 travellers)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/60 uppercase">Travel Style</label>
                    <select
                      value={travelStyle}
                      onChange={(e) => setTravelStyle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white"
                    >
                      <option value="budget" className="bg-[#090b10]">Smart Budget (Hostels & Public Transit)</option>
                      <option value="mid-range" className="bg-[#090b10]">Comfort Mid-Range (Boutique & Express)</option>
                      <option value="luxury" className="bg-[#090b10]">Luxury Escape (5-Star & Private Chauffeur)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/60 uppercase">Trip Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Budget Results */}
                {calculatedBudget && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-black border border-[#A855F7]/30 text-center">
                        <span className="text-[10px] font-mono text-white/60 uppercase">Total Trip Cost</span>
                        <div className="text-2xl font-bold text-white font-mono mt-1">
                          {calculatedBudget.totals.totalTripBudget.toLocaleString()} {activeCurrency}
                        </div>
                        <span className="text-[10px] text-white/40">{durationDays} days • {calculatedBudget.travelParameters.travellersCount} travellers</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-black border border-[#06B6D4]/30 text-center">
                        <span className="text-[10px] font-mono text-white/60 uppercase">Cost Per Traveller</span>
                        <div className="text-2xl font-bold text-[#06B6D4] font-mono mt-1">
                          {calculatedBudget.totals.costPerPerson.toLocaleString()} {activeCurrency}
                        </div>
                        <span className="text-[10px] text-white/40">all inclusions + emergency reserve</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                        <span className="text-[10px] font-mono text-white/60 uppercase">Daily Spend / Person</span>
                        <div className="text-2xl font-bold text-white font-mono mt-1">
                          {calculatedBudget.totals.dailyCostPerPerson.toLocaleString()} {activeCurrency}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">FX Rate: 1 USD = {dossier.liveExchangeRates.currentRate} {activeCurrency}</span>
                      </div>
                    </div>

                    {/* Category Breakdown Table */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 font-mono text-white/50 text-[10px] uppercase">
                          <tr>
                            <th className="px-4 py-2.5">Category</th>
                            <th className="px-4 py-2.5">Amount ({activeCurrency})</th>
                            <th className="px-4 py-2.5">Details & Conditions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white/80">
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-white">Stays & Accommodation</td>
                            <td className="px-4 py-2.5 font-mono text-[#A855F7] font-bold">
                              {calculatedBudget.breakdown.accommodation.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-white/50">{calculatedBudget.breakdown.accommodation.note}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-white">Food & Dining</td>
                            <td className="px-4 py-2.5 font-mono text-[#A855F7] font-bold">
                              {calculatedBudget.breakdown.foodAndDining.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-white/50">{calculatedBudget.breakdown.foodAndDining.note}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-white">Local Transportation</td>
                            <td className="px-4 py-2.5 font-mono text-[#A855F7] font-bold">
                              {calculatedBudget.breakdown.localTransportation.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-white/50">{calculatedBudget.breakdown.localTransportation.note}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-white">Attractions & Activities</td>
                            <td className="px-4 py-2.5 font-mono text-[#A855F7] font-bold">
                              {calculatedBudget.breakdown.activitiesAndTickets.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-white/50">{calculatedBudget.breakdown.activitiesAndTickets.note}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-white">Shopping & Souvenirs</td>
                            <td className="px-4 py-2.5 font-mono text-[#A855F7] font-bold">
                              {calculatedBudget.breakdown.shoppingAndSouvenirs.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-white/50">{calculatedBudget.breakdown.shoppingAndSouvenirs.note}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-emerald-400">10% Emergency Reserve</td>
                            <td className="px-4 py-2.5 font-mono text-emerald-400 font-bold">
                              {calculatedBudget.breakdown.emergencyReserve.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-white/50">{calculatedBudget.breakdown.emergencyReserve.note}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FACT-CHECKED AI Q&A */}
            {activeTab === 'ai' && (
              <div className="space-y-4 animate-fadeIn">
                <form onSubmit={handleAskAI} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder={`Ask any factual travel question about ${activeCity} (e.g. transport passes, peak hours, dining etiquette)...`}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#06B6D4]"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-[#06B6D4]/20 disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>Ask AI</span>
                    </button>
                  </div>
                </form>

                {aiAnswer && (
                  <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#06B6D4]">
                      <ShieldCheck size={14} />
                      <span>Verified Ground Truth Answer</span>
                    </div>
                    <div className="text-xs text-white/90 leading-relaxed whitespace-pre-line">
                      {aiAnswer.answer}
                    </div>

                    {aiAnswer.sources && aiAnswer.sources.length > 0 && (
                      <div className="pt-3 border-t border-white/10 space-y-1">
                        <span className="text-[10px] font-mono text-white/50 uppercase">Verified Sources Cited:</span>
                        <div className="flex flex-wrap gap-2">
                          {aiAnswer.sources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg text-[10px] text-white/80 bg-white/10 hover:bg-white/20 border border-white/15 flex items-center gap-1"
                            >
                              {s.name} <ExternalLink size={9} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: OFFICIAL BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                <a
                  href={dossier.verifiedBookingLinks.officialTourismPortal}
                  target="_blank"
                  rel="noreferrer"
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#06B6D4] transition-all group flex items-start justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-[#06B6D4]" />
                      <span className="text-sm font-bold text-white group-hover:text-[#06B6D4] transition-colors">
                        Official Tourism Portal & Guide
                      </span>
                    </div>
                    <p className="text-xs text-white/50">Verified government & encyclopedic heritage reference.</p>
                  </div>
                  <ExternalLink size={15} className="text-white/40 group-hover:text-white transition-colors" />
                </a>

                <a
                  href={dossier.verifiedBookingLinks.verifiedHotelsSearch}
                  target="_blank"
                  rel="noreferrer"
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#A855F7] transition-all group flex items-start justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-[#A855F7]" />
                      <span className="text-sm font-bold text-white group-hover:text-[#A855F7] transition-colors">
                        Live Hotel Direct Inventory
                      </span>
                    </div>
                    <p className="text-xs text-white/50">Real-time room availability directly from property managers.</p>
                  </div>
                  <ExternalLink size={15} className="text-white/40 group-hover:text-white transition-colors" />
                </a>

                <a
                  href={dossier.verifiedBookingLinks.verifiedFlightsSearch}
                  target="_blank"
                  rel="noreferrer"
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#06B6D4] transition-all group flex items-start justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Plane size={16} className="text-[#06B6D4]" />
                      <span className="text-sm font-bold text-white group-hover:text-[#06B6D4] transition-colors">
                        Live Flight Routes & Carrier Fares
                      </span>
                    </div>
                    <p className="text-xs text-white/50">Official airline route maps with zero markup direct reservation.</p>
                  </div>
                  <ExternalLink size={15} className="text-white/40 group-hover:text-white transition-colors" />
                </a>

                <a
                  href={dossier.verifiedBookingLinks.verifiedAttractionsSearch}
                  target="_blank"
                  rel="noreferrer"
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#A855F7] transition-all group flex items-start justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Ticket size={16} className="text-[#A855F7]" />
                      <span className="text-sm font-bold text-white group-hover:text-[#A855F7] transition-colors">
                        Authorized Landmark Box Offices
                      </span>
                    </div>
                    <p className="text-xs text-white/50">Official ticket desks to avoid fraudulent third-party scams.</p>
                  </div>
                  <ExternalLink size={15} className="text-white/40 group-hover:text-white transition-colors" />
                </a>
              </div>
            )}

            {/* Source Verification Footer */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/50 font-mono">
              <div className="flex items-center gap-2 text-[#06B6D4]">
                <ShieldCheck size={14} />
                <span>Verification Policy: Factual Ground Truth with Live FX Synchronization</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Refreshed: {new Date(dossier.timestamp).toLocaleTimeString()}</span>
                <span className="text-emerald-400">Status: VERIFIED</span>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}
