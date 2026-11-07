import React, { useState } from 'react';
import { Sparkles, Mic, Send, Heart, MapPin, Calendar, Check, Users, Compass, Sliders, Plane, ShieldCheck } from 'lucide-react';

export default function HowItWorksSection() {
  const [inputText, setInputText] = useState('5 days in Munnar & Alappuzha with private houseboat and tea valley walks...');

  return (
    <section id="how-it-works" className="relative py-28 bg-[#08090A] overflow-hidden border-t border-white/[0.06]">
      
      {/* Subtle atmospheric glow behind sections */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[#A855F7]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[60%] right-[-10%] w-[500px] h-[500px] bg-[#06B6D4]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.05] border border-white/10 mb-4">
            <span className="text-[11px] font-semibold tracking-[0.2em] text-[#06B6D4] uppercase font-mono">
              THE TRIPONA PROCESS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-heading">
            How It Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#A5A5A5] max-w-xl mx-auto">
            From your first travel thought to your final flight home — our AI streamlines every stage of journey planning.
          </p>
        </div>

        {/* ============================================================== */}
        {/* STEP 1: Tell TRIPONA where you want to go                      */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-28">
          
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] flex items-center justify-center text-xs font-bold text-white shadow-md">
              01
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug font-heading">
              1. Tell TRIPONA where you want to go.
            </h3>
            <p className="text-base text-[#A5A5A5] leading-relaxed">
              Describe your mood, dream destinations, travel dates, and pace. Whether you crave misty Western Ghats tea plantations or Swiss alpine lakes, our neural engine understands context and nuances.
            </p>
          </div>

          {/* Right Bento Collage + AI Input */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* 4-Image Bento Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
              <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 bg-[#111315] group shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                  alt="Mountain Hiking"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 bg-[#111315] group shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                  alt="Tropical Beach"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 bg-[#111315] group shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80"
                  alt="Roman Architecture"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 bg-[#111315] group shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80"
                  alt="Bali Temples"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* AI Prompt Capsule Bar below grid */}
            <div className="mt-4 w-full max-w-lg p-2.5 rounded-2xl glass-panel border border-white/15 shadow-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 pl-2">
                <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-ping" />
                <span className="text-xs text-white/80 font-medium truncate max-w-[280px]">
                  {inputText}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] flex items-center justify-center shrink-0 shadow-md">
                <Sparkles size={14} className="text-white" />
              </div>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* STEP 2: AI creates your personalized travel itinerary         */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-28">
          
          {/* Left Cards */}
          <div className="lg:col-span-7 flex justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-md">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] border border-white/10 bg-[#111315] shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
                  alt="Paris Twilight"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlapping Floating Itinerary Preview Card */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 w-64 sm:w-72 p-4 rounded-2xl glass-panel border border-white/15 shadow-2xl space-y-2 backdrop-blur-2xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Day 1 • Sunset Cruise</span>
                  <span className="text-[#06B6D4] font-mono font-semibold">05:30 PM</span>
                </div>
                <div className="text-[11px] text-[#A5A5A5]">Private canal boat with regional delicacies & acoustic music.</div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <Check size={11} />
                  <span>AI Route Optimized</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] flex items-center justify-center text-xs font-bold text-white shadow-md">
              02
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug font-heading">
              2. AI creates your personalized itinerary.
            </h3>
            <p className="text-base text-[#A5A5A5] leading-relaxed">
              Seconds later, TRIPONA delivers a complete day-by-day plan with smart pacing, morning excursions, afternoon hidden gems, curated dining, and optimized transit schedules.
            </p>
          </div>

        </div>

        {/* ============================================================== */}
        {/* STEP 3 & 4: Customize Your Journey & Book                     */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Step 3 Card */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] flex items-center justify-center text-xs font-bold text-white shadow-md">
                03
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white font-heading">
                3. Customize your journey.
              </h4>
              <p className="text-sm text-[#A5A5A5] leading-relaxed">
                Swap activities, adjust your budget slider, shift dates, or add group members with instant real-time re-synchronization. You remain in complete control.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-xs font-mono text-[#A855F7]">
              <Sliders size={14} />
              <span>Full Customization Freedom</span>
            </div>
          </div>

          {/* Step 4 Card */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] flex items-center justify-center text-xs font-bold text-white shadow-md">
                04
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white font-heading">
                4. Explore and book your trip.
              </h4>
              <p className="text-sm text-[#A5A5A5] leading-relaxed">
                Lock in verified hotels, boutique stays, flights, and curated experiences in one consolidated checkout. Store digital passes directly on your device.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-xs font-mono text-[#06B6D4]">
              <ShieldCheck size={14} />
              <span>Verified Bookings & Digital Passes</span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
