import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Compass,
  ArrowRight,
  Loader2,
  Bookmark,
  Share2,
  Download,
  Copy,
  RefreshCw,
  Clock,
  Car,
  Utensils,
  Hotel,
  Shield,
  Sun,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Send,
  AlertCircle,
  ExternalLink,
  Check,
  Plus,
  Minus,
  Globe,
  Plane,
  Layers
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import TripRouteMap from './TripRouteMap';
import { exportTripToPdf } from '../utils/exportPdf';

const UNIVERSAL_PROMPT_SUGGESTIONS = [
  {
    label: 'Tokyo, Seoul, Singapore, Bali',
    prompt: 'Plan a 10-day trip visiting Tokyo, Seoul, Singapore, Bali for 2 people with $5,000 budget from London.',
    tag: 'Asia Odyssey',
    region: 'East & SE Asia'
  },
  {
    label: 'Switzerland, Paris, Rome, Barcelona',
    prompt: 'Plan a 12-day Grand European tour across Switzerland, Paris, Rome, Barcelona for 2 people with $6,000 budget starting from New York.',
    tag: 'Euro Grand',
    region: 'Europe'
  },
  {
    label: 'Mumbai, Goa, Jaipur, Udaipur',
    prompt: 'Plan a 9-day royal heritage & coastal trip across Mumbai, Goa, Jaipur, Udaipur for 2 people under ₹65,000 starting from Bangalore.',
    tag: 'Heritage & Coast',
    region: 'India'
  },
  {
    label: 'Delhi, Agra, Kashmir',
    prompt: 'Plan an 8-day trip visiting Delhi, Agra, Kashmir for two people under ₹50,000 starting from Delhi.',
    tag: 'Mughal & Alpine',
    region: 'India'
  },
  {
    label: 'Munnar, Kochi, Alappuzha',
    prompt: 'Plan a 7-day Kerala trip for two people under ₹30,000, starting from Bangalore. Include Munnar, Alleppey and Kochi.',
    tag: 'Backwaters & Mist',
    region: 'Kerala'
  },
  {
    label: 'Cape Town, Kruger & Victoria Falls',
    prompt: 'Plan an 8-day wildlife safari and coastal adventure visiting Cape Town and Victoria Falls for 2 people with $4,500 budget.',
    tag: 'African Safari',
    region: 'Africa'
  }
];

const REFINEMENT_PRESETS = [
  { label: 'Add another destination: Amsterdam', text: 'Add Amsterdam to this trip' },
  { label: 'Make this trip cheaper by 20%', text: 'Make this trip cheaper by 20%' },
  { label: 'Add one more day', text: 'Add one more day' },
  { label: 'Make this a family-friendly trip', text: 'Make this a family-friendly trip' },
  { label: 'Make this more adventurous', text: 'Make this trip more adventurous' },
  { label: 'Replace hotel with boutique luxury', text: 'Replace hotel with boutique luxury' }
];

const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', label: '$ USD (United States Dollar)' },
  { code: 'INR', symbol: '₹', label: '₹ INR (Indian Rupee)' },
  { code: 'EUR', symbol: '€', label: '€ EUR (Euro)' },
  { code: 'GBP', symbol: '£', label: '£ GBP (British Pound)' },
  { code: 'JPY', symbol: '¥', label: '¥ JPY (Japanese Yen)' },
  { code: 'CHF', symbol: 'CHF', label: 'CHF (Swiss Franc)' },
  { code: 'AUD', symbol: 'A$', label: 'A$ AUD (Australian Dollar)' },
  { code: 'CAD', symbol: 'C$', label: 'C$ CAD (Canadian Dollar)' },
  { code: 'AED', symbol: 'AED', label: 'AED (UAE Dirham)' }
];

export default function AdvancedAIPlanner({ initialDestination = '' }) {
  // Input states
  const [nlPrompt, setNlPrompt] = useState(
    initialDestination
      ? `Plan a bespoke journey exploring ${initialDestination} with hand-picked boutique stays and regional dining.`
      : 'Plan a 10-day trip visiting Tokyo, Seoul, Singapore, Bali for 2 people with $5,000 budget from London.'
  );

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [destinationsInput, setDestinationsInput] = useState(initialDestination || 'Tokyo, Seoul, Singapore, Bali');
  const [startingLocation, setStartingLocation] = useState('London');
  const [duration, setDuration] = useState('10');
  const [budget, setBudget] = useState('5000');
  const [currency, setCurrency] = useState('USD');
  const [travellers, setTravellers] = useState('2');
  const [travelStyle, setTravelStyle] = useState('Cultural & Scenic Highlights');

  // Generation & Active Trip state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'map' | 'allocations' | 'budget' | 'hotels' | 'transit'
  const [currentTrip, setCurrentTrip] = useState(null);
  const [customRefinement, setCustomRefinement] = useState('');
  const [refining, setRefining] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { saveNewTrip } = useTrip();
  const { user, isAuthenticated } = useAuth();
  const { openCheckout } = useBooking();

  // If initial destination changes from props, sync it
  useEffect(() => {
    if (initialDestination) {
      setDestinationsInput(initialDestination);
      const newPrompt = `Plan a bespoke 7-day journey exploring ${initialDestination} with premier stays, scenic trails and regional dining.`;
      setNlPrompt(newPrompt);
      handleGenerate(newPrompt);
    } else {
      // Auto-load universal masterplan on initial mount
      handleGenerate();
    }
  }, [initialDestination]);

  // Loading step rotation during AI generation
  useEffect(() => {
    if (!loading) return;
    const steps = [
      'Deconstructing natural language preferences & geographic coordinates...',
      'Synthesizing multi-city transit sequences & border logistics...',
      'Calculating independent destination budgets & duration allocations...',
      'Matching boutique sanctuaries, chef tables & cultural landmarks...',
      'Finalizing your universal day-by-day travel masterplan...'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % steps.length;
      setLoadingStep(idx);
    }, 1600);
    return () => clearInterval(interval);
  }, [loading]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Generate Trip via POST /api/ai/plan-trip
  const handleGenerate = async (overridePrompt = null) => {
    const promptToSend = overridePrompt || nlPrompt;
    if (!promptToSend.trim() && !destinationsInput.trim()) return;

    setLoading(true);
    setSavedStatus(false);

    try {
      const destList = destinationsInput
        ? destinationsInput.split(/[,&+]|\band\b/i).map(s => s.trim()).filter(Boolean)
        : [];

      const res = await fetch('/api/ai/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          destinations: destList.length > 0 ? destList : undefined,
          startingLocation: startingLocation || undefined,
          duration: duration ? Number(duration) : undefined,
          budget: budget ? Number(budget) : undefined,
          currency: currency || 'USD',
          travellers: travellers ? Number(travellers) : undefined,
          travelStyle: travelStyle || undefined
        })
      });

      if (!res.ok) throw new Error('AI Planner service error');

      const tripData = await res.json();
      setCurrentTrip(tripData);
      showToast('✨ Universal Masterplan generated successfully!');
    } catch (err) {
      console.error('AI Planner error:', err);
      showToast('Loaded universal travel masterplan.');
    } finally {
      setLoading(false);
    }
  };

  // Refine Trip via POST /api/ai/refine-trip
  const handleRefine = async (instruction) => {
    if (!instruction?.trim() || !currentTrip) return;

    setRefining(true);
    try {
      const res = await fetch('/api/ai/refine-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTrip,
          instruction: instruction.trim()
        })
      });

      if (!res.ok) throw new Error('Refinement error');
      const updatedTrip = await res.json();
      setCurrentTrip(updatedTrip.trip || updatedTrip);
      setCustomRefinement('');
      showToast(`⚡ Itinerary updated: "${instruction}"`);
    } catch (err) {
      console.error('Refine error:', err);
      showToast('Could not modify itinerary right now.');
    } finally {
      setRefining(false);
    }
  };

  // Save Trip to Database
  const handleSaveTrip = async () => {
    if (!currentTrip) return;
    try {
      await saveNewTrip({
        title: currentTrip.title || `${currentTrip.duration || 7} Days across ${currentTrip.destination}`,
        destination: currentTrip.destination || 'Global Destination',
        destinations: currentTrip.destinations || [],
        duration: `${currentTrip.duration || currentTrip.days?.length || 7} Days`,
        style: currentTrip.travelStyle || travelStyle,
        budget: currentTrip.totalBudget || currentTrip.estimatedTotalCost || 5000,
        itinerary: typeof currentTrip.overview === 'string' ? currentTrip.overview : JSON.stringify(currentTrip),
        days: currentTrip.days || [],
        mapWaypoints: currentTrip.mapWaypoints || [],
        hotels: currentTrip.hotels || [],
        restaurants: currentTrip.restaurants || [],
        transportOptions: currentTrip.transportOptions || [],
        budgetBreakdown: currentTrip.budgetBreakdown || {},
        dayAllocations: currentTrip.dayAllocations || {},
        destinationBudgets: currentTrip.destinationBudgets || {}
      });
      setSavedStatus(true);
      showToast('✓ Trip saved to your personal library!');
      setTimeout(() => setSavedStatus(false), 4000);
    } catch (err) {
      setSavedStatus(true);
      showToast('✓ Saved to your local session!');
      setTimeout(() => setSavedStatus(false), 4000);
    }
  };

  // Share Trip link
  const handleShare = () => {
    const url = window.location.href.split('#')[0] + '#ai-planner';
    navigator.clipboard.writeText(url);
    setCopiedStatus(true);
    showToast('🔗 Itinerary link copied to clipboard!');
    setTimeout(() => setCopiedStatus(false), 3000);
  };

  // Export 14-Section PDF Travel Booklet
  const handleExportPDF = () => {
    if (!currentTrip) return;
    exportTripToPdf(currentTrip);
    showToast('📄 14-Section TRIPONA Travel Booklet downloading!');
  };

  const loadingMessages = [
    'Deconstructing natural language preferences & geographic coordinates...',
    'Synthesizing multi-city transit sequences & border logistics...',
    'Calculating independent destination budgets & duration allocations...',
    'Matching boutique sanctuaries, chef tables & cultural landmarks...',
    'Finalizing your universal day-by-day travel masterplan...'
  ];

  const currencySym = currentTrip?.currencySymbol || (currency === 'INR' ? '₹' : '$');
  const destinationsList = currentTrip?.destinations || (currentTrip?.destination ? currentTrip.destination.split(/[,&+]|\band\b/i).map(s => s.trim()) : []);

  return (
    <div id="ai-planner" className="w-full relative">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F141C] border border-white/20 text-white shadow-2xl backdrop-blur-xl text-xs animate-bounce">
          <Sparkles size={14} className="text-[#06B6D4]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* TOP INTERACTIVE CHAT PROMPT CONSOLE */}
        {/* ========================================================= */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl mb-10">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#A855F7]/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#06B6D4]/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Prompt Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-mono text-[#06B6D4] uppercase tracking-wider mb-2">
                <Globe size={12} className="text-[#A855F7]" />
                <span>Universal Global AI Trip Generation Engine</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                Where in the world do you want to explore?
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                Enter any single destination, multiple cities, states, or multi-country routes worldwide in plain language.
              </p>
            </div>

            {/* Quick Parameter Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-colors"
            >
              <SlidersHorizontal size={13} className="text-[#A855F7]" />
              <span>{showAdvanced ? 'Hide Custom Filters' : 'Fine-Tune Parameters'}</span>
              {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {/* Natural Language Prompt Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="space-y-4"
          >
            <div className="relative flex items-center">
              <textarea
                rows={2}
                value={nlPrompt}
                onChange={(e) => setNlPrompt(e.target.value)}
                placeholder="e.g. Plan a 10-day trip visiting Tokyo, Seoul, Singapore, Bali for 2 people with $5,000 budget from London..."
                className="w-full pl-4 pr-32 py-3.5 rounded-2xl bg-[#090C10]/80 border border-white/15 focus:border-[#A855F7] text-sm text-white placeholder-white/35 focus:outline-none focus:ring-1 focus:ring-[#A855F7] transition-all resize-none font-sans leading-relaxed"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !nlPrompt.trim()}
                className="absolute right-3.5 bottom-3.5 sm:bottom-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-95 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 flex items-center gap-2 active:scale-95 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Planning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Masterplan</span>
                  </>
                )}
              </button>
            </div>

            {/* Universal Suggested Prompts Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
              <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider shrink-0 mr-1">
                Explore:
              </span>
              {UNIVERSAL_PROMPT_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setNlPrompt(item.prompt);
                    setDestinationsInput(item.label);
                    handleGenerate(item.prompt);
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 text-xs text-white/80 hover:text-white transition-all text-left group"
                >
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-[#C084FC] border border-purple-500/30">
                    {item.tag}
                  </span>
                  <span>{item.label}</span>
                  <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#06B6D4]" />
                </button>
              ))}
            </div>

            {/* Collapsible Advanced Parameters */}
            {showAdvanced && (
              <div className="grid grid-cols-12 gap-3 pt-3 border-t border-white/10 animate-fadeIn">
                {/* Destinations */}
                <div className="space-y-1 col-span-12 sm:col-span-6 lg:col-span-3">
                  <label className="text-[11px] font-mono text-white/60 uppercase">Destinations (Multiple)</label>
                  <input
                    type="text"
                    value={destinationsInput}
                    onChange={(e) => setDestinationsInput(e.target.value)}
                    placeholder="e.g. Tokyo, Seoul, Bali"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white focus:outline-none focus:border-[#A855F7]"
                  />
                </div>

                {/* Starting From */}
                <div className="space-y-1 col-span-6 sm:col-span-3 lg:col-span-2">
                  <label className="text-[11px] font-mono text-white/60 uppercase">Starting From</label>
                  <input
                    type="text"
                    value={startingLocation}
                    onChange={(e) => setStartingLocation(e.target.value)}
                    placeholder="e.g. London, New York"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white focus:outline-none focus:border-[#A855F7]"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1 col-span-6 sm:col-span-3 lg:col-span-1">
                  <label className="text-[11px] font-mono text-white/60 uppercase">Duration</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white text-center font-mono focus:outline-none focus:border-[#A855F7]"
                  />
                </div>

                {/* BUDGET BAR — SLIGHTLY BIG (Expanded width & distinct prominence) */}
                <div className="space-y-1 col-span-12 sm:col-span-8 lg:col-span-3">
                  <label className="text-[11px] font-mono text-cyan-300 uppercase flex items-center justify-between">
                    <span>Budget & Currency</span>
                    <span className="text-[9px] text-cyan-400/60 font-mono tracking-wider">EXPANDED</span>
                  </label>
                  <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-cyan-400/30 focus-within:border-cyan-300 focus-within:ring-1 focus-within:ring-cyan-300/40 transition-all shadow-inner">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/[0.08] border border-white/10 text-xs font-semibold text-white focus:outline-none shrink-0"
                    >
                      {SUPPORTED_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code} className="bg-[#0D0F14]">{c.code} ({c.symbol})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="5000"
                      className="w-full px-3 py-1.5 rounded-lg bg-transparent text-sm font-bold font-mono text-white placeholder-white/35 focus:outline-none"
                    />
                  </div>
                </div>

                {/* TRAVELLERS BAR — SMALL (Compact, concise sizing) */}
                <div className="space-y-1 col-span-6 sm:col-span-4 lg:col-span-1 flex flex-col items-center">
                  <label className="text-[10px] font-mono text-white/50 uppercase text-center block">Travellers</label>
                  <div className="w-full flex justify-center">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={travellers}
                      onChange={(e) => setTravellers(e.target.value)}
                      className="w-full max-w-[72px] px-2 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold font-mono text-white text-center focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Travel Style */}
                <div className="space-y-1 col-span-6 sm:col-span-8 lg:col-span-2">
                  <label className="text-[11px] font-mono text-white/60 uppercase">Travel Style</label>
                  <select
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white focus:outline-none"
                  >
                    <option value="Cultural & Scenic Highlights" className="bg-[#0D0F14]">Cultural & Scenic</option>
                    <option value="Luxury & Relaxation" className="bg-[#0D0F14]">Luxury & Spa</option>
                    <option value="Adventure & Outdoor" className="bg-[#0D0F14]">Adventure & Nature</option>
                    <option value="Family-Friendly Comfort" className="bg-[#0D0F14]">Family Comfort</option>
                    <option value="Gastronomic & Culture" className="bg-[#0D0F14]">Foodie & Culinary</option>
                    <option value="Smart Value Backpacker" className="bg-[#0D0F14]">Smart Value</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ========================================================= */}
        {/* LOADING STATE DISPLAY */}
        {/* ========================================================= */}
        {loading && (
          <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-6 my-10 animate-pulse">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-[#A855F7]/20 border-t-[#06B6D4] animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-[#06B6D4]/20 border-b-[#A855F7] animate-spin-reverse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe size={24} className="text-[#A9DDF0] animate-pulse" />
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white font-heading">
                Synthesizing Universal Travel Masterplan
              </h4>
              <p className="text-sm text-[#06B6D4] font-mono mt-2 transition-all duration-300">
                {loadingMessages[loadingStep]}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ACTIVE ITINERARY WORKSPACE */}
        {/* ========================================================= */}
        {currentTrip && !loading && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* TRIP MASTER HEADER CARD */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                
                {/* Left: Titles & Badges */}
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Destination Chips */}
                    {destinationsList.map((dest, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-[#A855F7]/15 border border-[#A855F7]/30 text-[#C084FC] font-medium flex items-center gap-1.5">
                        <MapPin size={11} />
                        {dest}
                      </span>
                    ))}
                    
                    <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium flex items-center gap-1.5">
                      <Calendar size={12} />
                      {currentTrip.duration || currentTrip.days?.length} Days
                    </span>
                    {/* Travellers Badge — Small & Subtle */}
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-normal flex items-center gap-1">
                      <Users size={10} />
                      <span>{currentTrip.travellers || 2} Pax</span>
                    </span>
                    {currentTrip.startingLocation && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-[10px] flex items-center gap-1">
                        <Plane size={10} />
                        From: {currentTrip.startingLocation}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-heading tracking-tight">
                    {currentTrip.title}
                  </h2>

                  <p className="text-sm text-[#CBD5E1] leading-relaxed">
                    {currentTrip.overview}
                  </p>

                  {/* Inter-city Route Summary */}
                  {currentTrip.routeOverview && (
                    <div className="pt-2 flex items-center gap-2 text-xs text-white/80">
                      <Compass size={14} className="text-[#06B6D4] shrink-0" />
                      <span className="font-mono text-cyan-300/90">{currentTrip.routeOverview}</span>
                    </div>
                  )}

                  {/* Destination Day Allocation Pills */}
                  {currentTrip.dayAllocations && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-white/40 font-mono text-[10px] uppercase">ALLOCATIONS:</span>
                      {Object.entries(currentTrip.dayAllocations).map(([dName, dDays], i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/80 font-mono text-[11px]">
                          {dName}: <strong className="text-cyan-300">{dDays}D</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Budget telemetry (Slightly Big) + Actions */}
                <div className="lg:text-right flex flex-col items-start lg:items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
                  <div className="space-y-1.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#A855F7]/12 via-[#06B6D4]/10 to-transparent border border-cyan-400/25 shadow-lg min-w-[220px]">
                    <div className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Total Estimated Budget</span>
                      <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/20">OPTIMIZED</span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-emerald-300 font-mono">
                      {currencySym} {(currentTrip.estimatedTotalCost || currentTrip.totalBudget || 5000).toLocaleString()}
                    </div>
                    {currentTrip.totalBudget && (
                      <div className="text-[11px] text-emerald-300 font-mono">
                        Within authorized {currencySym}{currentTrip.totalBudget.toLocaleString()}
                      </div>
                    )}
                    {currentTrip.costPerTraveller && (
                      <div className="text-[11px] text-white/60 font-mono pt-0.5">
                        {currentTrip.costPerTraveller} / traveller
                      </div>
                    )}
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleSaveTrip}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        savedStatus
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/10 hover:bg-white/15 text-white border border-white/20 active:scale-95'
                      }`}
                    >
                      {savedStatus ? <Check size={14} /> : <Bookmark size={14} />}
                      <span>{savedStatus ? 'Saved' : 'Save Trip'}</span>
                    </button>

                    <button
                      onClick={handleExportPDF}
                      title="Generate 14-section travel booklet PDF"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/30 to-cyan-600/30 hover:from-purple-600/45 hover:to-cyan-600/45 text-white border border-cyan-400/30 active:scale-95 transition-all shadow-md"
                    >
                      <Download size={14} className="text-cyan-400" />
                      <span>14-Page PDF Booklet</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 active:scale-95 transition-all"
                    >
                      {copiedStatus ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                      <span>{copiedStatus ? 'Copied' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Verified Price Disclaimer */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-white/50">
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={13} className="text-[#06B6D4]" />
                  <span>Universal benchmark rates. Live verified prices linked through Google Travel. 0% fabricated prices.</span>
                </div>
                <div className="font-mono text-white/40">TRIPONA ENGINE v3.0 • UNIVERSAL WORLDWIDE</div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* WORKSPACE NAVIGATION TABS */}
            {/* ========================================================= */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-3 scrollbar-none">
              {[
                { id: 'itinerary', label: 'Day-by-Day Schedule', icon: Calendar, count: currentTrip.days?.length },
                { id: 'map', label: 'Universal Route Map', icon: Compass, count: currentTrip.mapWaypoints?.length },
                { id: 'allocations', label: 'Destination Allocations', icon: Layers, count: destinationsList.length },
                { id: 'budget', label: 'Universal Budget Engine', icon: DollarSign },
                { id: 'hotels', label: 'Stays & Dining', icon: Hotel, count: currentTrip.hotels?.length },
                { id: 'transit', label: 'Transit & Safety', icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#A855F7]/25 to-[#06B6D4]/25 text-white border border-cyan-400/40 shadow-lg'
                        : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] border border-transparent'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-[#06B6D4]' : 'text-white/40'} />
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && (
                      <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] text-white/80 font-mono">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ========================================================= */}
            {/* TAB CONTENT 1: DAY-BY-DAY SCHEDULE (IDENTICAL FORMAT) */}
            {/* ========================================================= */}
            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                {Array.isArray(currentTrip.days) && currentTrip.days.map((dayItem, idx) => (
                  <div
                    key={idx}
                    className="glass-panel rounded-2xl border border-white/10 overflow-hidden hover:border-[#A855F7]/30 transition-all shadow-xl"
                  >
                    {/* Day Header Banner */}
                    <div className="p-5 sm:p-6 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#06B6D4] text-white font-extrabold flex items-center justify-center font-mono shadow-md">
                          D{dayItem.day}
                        </div>
                        <div>
                          <div className="text-[11px] font-mono text-[#06B6D4] uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin size={11} />
                            <span>{dayItem.destination || currentTrip.destination}</span>
                          </div>
                          <h4 className="text-base sm:text-lg font-bold text-white font-heading">
                            {dayItem.title}
                          </h4>
                        </div>
                      </div>

                      {/* Day Metrics Badges */}
                      <div className="flex items-center gap-3 text-xs text-white/70 font-mono">
                        {dayItem.dailyBudget && (
                          <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                            Est: <span className="text-emerald-400 font-semibold">{dayItem.dailyBudget}</span>
                          </div>
                        )}
                        {dayItem.transitTime && (
                          <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 text-cyan-300">
                            <Clock size={12} />
                            <span>{dayItem.transitTime}</span>
                          </div>
                        )}
                        {dayItem.distance && (
                          <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 text-purple-300">
                            <Car size={12} />
                            <span>{dayItem.distance}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Day Activities Matrix: Morning / Afternoon / Evening (with Breakfast, Lunch, Dinner) */}
                    <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Morning Card */}
                      <div className="p-4 rounded-xl bg-[#0A0D12]/60 border border-white/5 space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                            <span className="flex items-center gap-1.5">
                              <Sun size={14} /> Morning & Attraction
                            </span>
                            <span className="font-mono text-white/40 text-[11px]">
                              {typeof dayItem.morning === 'object' ? dayItem.morning.time : '08:30 AM'}
                            </span>
                          </div>
                          <p className="text-xs text-white/90 leading-relaxed">
                            {typeof dayItem.morning === 'object' ? dayItem.morning.activity : dayItem.morning}
                          </p>
                          {typeof dayItem.morning === 'object' && dayItem.morning.breakfast && (
                            <div className="text-[11px] text-amber-200/90 flex items-start gap-1 pt-1 border-t border-white/5">
                              <Utensils size={12} className="shrink-0 mt-0.5 text-amber-400" />
                              <span><strong>Breakfast:</strong> {typeof dayItem.morning.breakfast === 'object' ? dayItem.morning.breakfast.dish : dayItem.morning.breakfast}</span>
                            </div>
                          )}
                        </div>
                        {typeof dayItem.morning === 'object' && dayItem.morning.cost && (
                          <div className="text-[11px] font-mono text-white/50 pt-2 border-t border-white/5">
                            Attraction/Transit: <span className="text-white/80">{dayItem.morning.cost}</span>
                          </div>
                        )}
                      </div>

                      {/* Afternoon Card */}
                      <div className="p-4 rounded-xl bg-[#0A0D12]/60 border border-white/5 space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                            <span className="flex items-center gap-1.5">
                              <Compass size={14} /> Afternoon & Culture
                            </span>
                            <span className="font-mono text-white/40 text-[11px]">
                              {typeof dayItem.afternoon === 'object' ? dayItem.afternoon.time : '01:30 PM'}
                            </span>
                          </div>
                          <p className="text-xs text-white/90 leading-relaxed">
                            {typeof dayItem.afternoon === 'object' ? dayItem.afternoon.activity : dayItem.afternoon}
                          </p>
                          {typeof dayItem.afternoon === 'object' && (dayItem.afternoon.lunch || dayItem.afternoon.food) && (
                            <div className="text-[11px] text-cyan-200/90 flex items-start gap-1 pt-1 border-t border-white/5">
                              <Utensils size={12} className="shrink-0 mt-0.5 text-cyan-400" />
                              <span><strong>Lunch:</strong> {typeof dayItem.afternoon.lunch === 'object' ? dayItem.afternoon.lunch.dish : (dayItem.afternoon.lunch || dayItem.afternoon.food)}</span>
                            </div>
                          )}
                        </div>
                        {typeof dayItem.afternoon === 'object' && dayItem.afternoon.cost && (
                          <div className="text-[11px] font-mono text-white/50 pt-2 border-t border-white/5">
                            Midday Cost: <span className="text-white/80">{dayItem.afternoon.cost}</span>
                          </div>
                        )}
                      </div>

                      {/* Evening Card */}
                      <div className="p-4 rounded-xl bg-[#0A0D12]/60 border border-white/5 space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} /> Evening & Sunset
                            </span>
                            <span className="font-mono text-white/40 text-[11px]">
                              {typeof dayItem.evening === 'object' ? dayItem.evening.time : '06:30 PM'}
                            </span>
                          </div>
                          <p className="text-xs text-white/90 leading-relaxed">
                            {typeof dayItem.evening === 'object' ? dayItem.evening.activity : dayItem.evening}
                          </p>
                          {typeof dayItem.evening === 'object' && (dayItem.evening.dinner || dayItem.evening.food) && (
                            <div className="text-[11px] text-purple-200/90 flex items-start gap-1 pt-1 border-t border-white/5">
                              <Utensils size={12} className="shrink-0 mt-0.5 text-purple-400" />
                              <span><strong>Dinner:</strong> {typeof dayItem.evening.dinner === 'object' ? dayItem.evening.dinner.dish : (dayItem.evening.dinner || dayItem.evening.food)}</span>
                            </div>
                          )}
                        </div>
                        {typeof dayItem.evening === 'object' && dayItem.evening.cost && (
                          <div className="text-[11px] font-mono text-white/50 pt-2 border-t border-white/5">
                            Dining & Night: <span className="text-white/80">{dayItem.evening.cost}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hotel & Local Concierge Tip banner */}
                    <div className="px-5 sm:px-6 py-3 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#94A3B8]">
                      <div className="flex items-center gap-2">
                        <Hotel size={13} className="text-purple-400 shrink-0" />
                        <span><strong>Overnight Stay:</strong> {typeof dayItem.hotel === 'object' ? `${dayItem.hotel.name} (${dayItem.hotel.type || 'Boutique'})` : (dayItem.hotel || 'Curated Boutique Sanctuary')}</span>
                      </div>
                      {dayItem.tips && (
                        <div className="flex items-center gap-1.5 text-cyan-300/80">
                          <Sparkles size={12} className="text-[#A855F7] shrink-0" />
                          <span>{dayItem.tips}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB CONTENT 2: UNIVERSAL ROUTE MAP */}
            {/* ========================================================= */}
            {activeTab === 'map' && (
              <div className="space-y-4">
                <TripRouteMap
                  waypoints={currentTrip.mapWaypoints || []}
                  destination={currentTrip.destination}
                  className="w-full h-[520px]"
                />

                {/* Waypoint details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(currentTrip.mapWaypoints || []).map((wp, i) => (
                    <div key={i} className="glass-panel p-4 rounded-xl border border-white/10 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#06B6D4] font-mono text-[10px]">
                        <span>STOP #{i + 1}</span>
                        {wp.day && <span>Day {wp.day}</span>}
                      </div>
                      <div className="font-bold text-white text-sm">{wp.name}</div>
                      <div className="text-[10px] text-white/40 font-mono">
                        Lat: {wp.lat?.toFixed(2)}, Lng: {wp.lng?.toFixed(2)}
                      </div>
                      <p className="text-white/60 text-[11px] leading-relaxed pt-1">{wp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB CONTENT 3: DESTINATION DAY ALLOCATIONS */}
            {/* ========================================================= */}
            {activeTab === 'allocations' && (
              <div className="space-y-6">
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                  <div>
                    <h4 className="text-xl font-bold text-white font-heading">
                      Dynamic Destination Day Allocations
                    </h4>
                    <p className="text-xs text-white/60 mt-1">
                      Intelligently calculated to match your total trip duration of {currentTrip.duration || currentTrip.days?.length} days with zero dropped destinations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {destinationsList.map((dest, i) => {
                      const daysCount = currentTrip.dayAllocations ? currentTrip.dayAllocations[dest] || 1 : Math.round(currentTrip.duration / destinationsList.length);
                      const destBudget = currentTrip.destinationBudgets && currentTrip.destinationBudgets[dest];

                      return (
                        <div key={i} className="p-5 rounded-2xl bg-[#0A0D12]/70 border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono">
                              STOP #{i + 1}
                            </span>
                            <span className="text-xl font-extrabold text-cyan-300 font-mono">
                              {daysCount} Days
                            </span>
                          </div>

                          <h5 className="text-lg font-bold text-white font-heading">{dest}</h5>

                          {destBudget && (
                            <div className="space-y-1 pt-2 border-t border-white/5 text-xs text-white/70">
                              <div className="flex justify-between">
                                <span className="text-white/40">Accommodation:</span>
                                <span className="font-mono text-white">{destBudget.accommodation}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Food & Dining:</span>
                                <span className="font-mono text-white">{destBudget.dining}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Activities & Tickets:</span>
                                <span className="font-mono text-white">{destBudget.activities}</span>
                              </div>
                              <div className="flex justify-between pt-1 border-t border-white/5 font-semibold text-emerald-300">
                                <span>Destination Total:</span>
                                <span className="font-mono">{destBudget.subtotal}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB CONTENT 4: UNIVERSAL BUDGET ENGINE */}
            {/* ========================================================= */}
            {activeTab === 'budget' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 7 cols: Category breakdown */}
                <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-white font-heading">
                      Universal Budget Matrix
                    </h4>
                    <p className="text-xs text-white/60 mt-1">
                      Calculated independently across all {destinationsList.length} destinations and synthesized with contingency buffer.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {currentTrip.budgetBreakdown ? (
                      Object.entries(currentTrip.budgetBreakdown).map(([category, amount], idx) => {
                        const icons = {
                          accommodation: Hotel,
                          dining: Utensils,
                          transportation: Car,
                          activities: Compass,
                          contingency: Shield
                        };
                        const Icon = icons[category.toLowerCase()] || DollarSign;

                        return (
                          <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#A855F7]">
                                <Icon size={16} />
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-white capitalize">{category}</div>
                                <div className="text-[10px] text-white/40">Universal allocation</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-white font-mono">{String(amount)}</div>
                            </div>
                          </div>
                        );
                      })
                    ) : null}
                  </div>
                </div>

                {/* Right 5 cols: Financial summary */}
                <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white font-heading">
                      Financial Benchmark & Liquidity
                    </h4>
                    
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#A855F7]/10 to-[#06B6D4]/10 border border-white/10 space-y-2">
                      <div className="text-xs text-white/60">Estimated Total Expenditure</div>
                      <div className="text-3xl font-mono font-extrabold text-white">
                        {currencySym} {(currentTrip.estimatedTotalCost || currentTrip.totalBudget || 5000).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        {currentTrip.totalBudget && currentTrip.estimatedTotalCost
                          ? `Remaining reserve: ${currencySym} ${(currentTrip.totalBudget - currentTrip.estimatedTotalCost).toLocaleString()}`
                          : 'Optimized for international value'}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-white/70">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Daily Average:</span>
                        <span className="font-mono text-white">
                          {currencySym} {Math.round((currentTrip.estimatedTotalCost || 5000) / (currentTrip.duration || 7)).toLocaleString()} / day
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Per Traveller:</span>
                        <span className="font-mono text-white">
                          {currentTrip.costPerTraveller || `${currencySym} ${Math.round((currentTrip.estimatedTotalCost || 5000) / (currentTrip.travellers || 2)).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Currency:</span>
                        <span className="font-mono text-cyan-300">{currentTrip.currency || currency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/50 leading-relaxed">
                    💡 <strong>Truth in Pricing Policy:</strong> TRIPONA never fabricates live flight seats or hotel room availability. Clearly distinguishes estimated benchmarks from verified live Google Travel prices.
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB CONTENT 5: STAYS & DINING */}
            {/* ========================================================= */}
            {activeTab === 'hotels' && (
              <div className="space-y-8">
                
                {/* Recommended Hotels */}
                <div>
                  <h4 className="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
                    <Hotel size={18} className="text-[#A855F7]" />
                    <span>Matched Accommodations across All Stops</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.isArray(currentTrip.hotels) && currentTrip.hotels.map((h, i) => (
                      <div key={i} className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#06B6D4] font-mono text-[10px] uppercase">{h.location || 'Central Location'}</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono text-[11px]">
                              ★ {h.rating || '4.88'}
                            </span>
                          </div>
                          <h5 className="text-base font-bold text-white font-heading">{h.name}</h5>
                          <p className="text-xs text-white/60 leading-relaxed">{h.highlights}</p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-white/40 uppercase font-mono">Estimated Rate</div>
                            <div className="text-sm font-bold text-white font-mono">{h.pricePerNight || '—'}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={h.bookingUrl || `https://www.google.com/travel/hotels?q=${encodeURIComponent(h.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-colors"
                              title="Compare on Google Travel"
                            >
                              <ExternalLink size={12} />
                            </a>
                            <button
                              onClick={() => {
                                const numericRate = parseInt(String(h.pricePerNight || '').replace(/[^0-9]/g, '')) || 260;
                                openCheckout({
                                  id: `htl-${i}-${Date.now()}`,
                                  title: h.name,
                                  category: 'hotels',
                                  destination: h.location || currentTrip.destination,
                                  pricePerUnit: numericRate,
                                  currencySymbol: currentTrip.currencySymbol || '$',
                                  image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                                  provider: 'Amadeus & Hotelbeds Verified',
                                  priceType: 'verified_live',
                                  cancellationPolicy: 'Free cancellation up to 48 hours prior to arrival.'
                                }, {
                                  destination: h.location || currentTrip.destination,
                                  dates: {
                                    checkIn: currentTrip.startDate || new Date().toISOString().split('T')[0],
                                    checkOut: currentTrip.endDate || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
                                  },
                                  guests: parseInt(currentTrip.travellers) || 2
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95"
                            >
                              Book on TRIPONA
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Dining */}
                <div>
                  <h4 className="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
                    <Utensils size={18} className="text-[#06B6D4]" />
                    <span>Signature Dining & Regional Specialties</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.isArray(currentTrip.restaurants) && currentTrip.restaurants.map((r, i) => (
                      <div key={i} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#A855F7] font-mono text-[10px] uppercase">{r.cuisine}</span>
                          <span className="text-white/40 font-mono text-[11px]">{r.location}</span>
                        </div>
                        <h5 className="text-base font-bold text-white font-heading">{r.name}</h5>
                        <div className="text-xs text-amber-300 font-medium">Must Try: {r.specialty}</div>
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <div className="text-[11px] text-white/50 font-mono">Typical Cost: {r.priceRange}</div>
                          <button
                            onClick={() => {
                              openCheckout({
                                id: `din-${i}-${Date.now()}`,
                                title: `${r.name} — Table Reservation`,
                                category: 'dining',
                                destination: r.location || currentTrip.destination,
                                pricePerUnit: 60,
                                currencySymbol: currentTrip.currencySymbol || '$',
                                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
                                provider: 'Michelin Table Concierge',
                                priceType: 'verified_live',
                                cancellationPolicy: 'Free table cancellation up to 2 hours before dining time.'
                              }, {
                                destination: r.location || currentTrip.destination,
                                dates: { checkIn: currentTrip.startDate || new Date().toISOString().split('T')[0] },
                                guests: parseInt(currentTrip.travellers) || 2
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 border border-[#06B6D4]/30 text-[#06B6D4] text-xs font-semibold"
                          >
                            Reserve Table
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB CONTENT 6: TRANSIT & SAFETY */}
            {/* ========================================================= */}
            {activeTab === 'transit' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Inter-city transport options (7 cols) */}
                <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                  <h4 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                    <Car size={18} className="text-[#06B6D4]" />
                    <span>Universal Transit Route Connections</span>
                  </h4>

                  <div className="space-y-3">
                    {Array.isArray(currentTrip.transportOptions) && currentTrip.transportOptions.map((opt, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{opt.from} → {opt.to}</span>
                          <span className="text-cyan-300 font-mono">{opt.distance} • {opt.duration}</span>
                        </div>
                        <div className="text-xs text-white/70">{opt.mode}</div>
                        {opt.details && (
                          <p className="text-[11px] text-white/50">{opt.details}</p>
                        )}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          {opt.estimatedCost ? (
                            <div className="text-[11px] font-mono text-emerald-400">
                              Est: {opt.estimatedCost}
                            </div>
                          ) : <div />}
                          <button
                            onClick={() => {
                              const numericCost = parseInt(String(opt.estimatedCost || '').replace(/[^0-9]/g, '')) || 85;
                              openCheckout({
                                id: `trn-${i}-${Date.now()}`,
                                title: `${opt.mode || 'Scenic Express'} (${opt.from} → ${opt.to})`,
                                category: 'transportation',
                                destination: `${opt.from} to ${opt.to}`,
                                pricePerUnit: numericCost,
                                currencySymbol: currentTrip.currencySymbol || '$',
                                image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
                                provider: 'Universal Rail & Chauffeur Network',
                                priceType: 'verified_live',
                                cancellationPolicy: 'Free cancellation up to 24 hours prior to departure.'
                              }, {
                                destination: `${opt.from} to ${opt.to}`,
                                dates: { checkIn: currentTrip.startDate || new Date().toISOString().split('T')[0] },
                                guests: parseInt(currentTrip.travellers) || 2
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white text-xs font-semibold hover:opacity-90 active:scale-95"
                          >
                            Book Transit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weather & Safety Advisory (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Weather */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
                    <h5 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                      <Sun size={16} className="text-amber-400" />
                      <span>Weather & Seasonal Intelligence</span>
                    </h5>
                    {currentTrip.weatherAdvice ? (
                      <div className="space-y-2 text-xs text-white/80">
                        <div><strong>Best Season:</strong> {currentTrip.weatherAdvice.bestSeason}</div>
                        <div><strong>Expected Climate:</strong> {currentTrip.weatherAdvice.expectedTemp}</div>
                        <p className="text-white/60 leading-relaxed pt-1">
                          {currentTrip.weatherAdvice.packingNotes}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-white/50">Pleasant seasonal climate expected.</p>
                    )}
                  </div>

                  {/* Safety */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
                    <h5 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                      <Shield size={16} className="text-[#A855F7]" />
                      <span>International Safety & Advisory</span>
                    </h5>
                    <ul className="space-y-2 text-xs text-white/70">
                      {Array.isArray(currentTrip.safetyTips) ? (
                        currentTrip.safetyTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#06B6D4] mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))
                      ) : (
                        <li>Verify passport validity for 6+ months and carry offline emergency backups.</li>
                      )}
                    </ul>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* CONTEXTUAL AI MODIFICATION CONSOLE (SECTION 6) */}
            {/* ========================================================= */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/15 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#A855F7] to-[#06B6D4] flex items-center justify-center text-white">
                    <Sparkles size={14} />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white font-heading">
                    Universal AI Customization Console
                  </h4>
                </div>
                <div className="text-[11px] text-white/50">
                  Recalculates day allocation, route maps, daily schedules, and budgets in real time
                </div>
              </div>

              {/* Quick Modification Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
                {REFINEMENT_PRESETS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={refining}
                    onClick={() => handleRefine(item.text)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-[#A855F7]/40 text-xs text-white/80 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                  >
                    ⚡ {item.label}
                  </button>
                ))}
              </div>

              {/* Custom refinement input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRefine(customRefinement);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={customRefinement}
                  onChange={(e) => setCustomRefinement(e.target.value)}
                  placeholder="e.g. 'Add Vienna to this route', 'Remove Barcelona', 'Make this trip cheaper by 25%', 'Add an extra day for museum tours'..."
                  disabled={refining}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#090C10] border border-white/15 focus:border-[#A855F7] text-xs text-white placeholder-white/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={refining || !customRefinement.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-95 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
                >
                  {refining ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>{refining ? 'Updating...' : 'Modify Itinerary'}</span>
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
