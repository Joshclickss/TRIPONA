import React from 'react';
import { Apple, Play, Sparkles } from 'lucide-react';

export default function MobileAppSection() {
  return (
    <section id="about" className="relative py-12 sm:py-16 bg-[#050505] overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Compact Promotional Banner Container */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 md:p-10 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
          
          {/* Sunset Gradient & Blurred Landscape Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
              alt="Sunset Background"
              className="w-full h-full object-cover opacity-40 scale-105 filter blur-[1px]"
            />
            {/* Atmospheric Sunset Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#180e25]/95 via-[#231126]/85 to-[#2c1320]/90" />
            <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-gradient-to-bl from-orange-500/25 via-pink-600/25 to-purple-600/25 blur-[80px] pointer-events-none" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Content (6-7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span className="text-[10px] font-semibold tracking-[0.2em] text-white uppercase">
                  MOBILE APP
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight font-heading">
                Plan on the Go
              </h2>

              <p className="text-sm sm:text-[15px] text-white/80 leading-relaxed max-w-md">
                Your journey is always in your pocket. Plan, explore and manage your trips anywhere with offline sync, interactive maps, and live flight updates.
              </p>

              {/* App Store & Google Play Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                
                {/* Apple App Store */}
                <a
                  href="#download"
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-md transition-all duration-300 shadow-md active:scale-95 group"
                >
                  <Apple size={20} className="text-white group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-semibold text-white/60 tracking-wider">Download on the</div>
                    <div className="text-xs font-bold text-white tracking-wide">App Store</div>
                  </div>
                </a>

                {/* Google Play */}
                <a
                  href="#download"
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-md transition-all duration-300 shadow-md active:scale-95 group"
                >
                  <Play size={18} className="text-white fill-white group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-semibold text-white/60 tracking-wider">Get it on</div>
                    <div className="text-xs font-bold text-white tracking-wide">Google Play</div>
                  </div>
                </a>

              </div>

            </div>

            {/* Right: Resized & Balanced Overlapping Smartphone Mockups (5 Cols) */}
            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[290px] sm:min-h-[330px]">
              
              {/* Back Phone: Login Screen */}
              <div className="relative w-44 sm:w-48 rounded-[28px] p-2 bg-gradient-to-b from-[#352542] via-[#1b1424] to-[#0e0a14] border border-white/25 shadow-xl z-10 -rotate-6 hover:rotate-0 transition-transform duration-500">
                <div className="relative rounded-[22px] overflow-hidden bg-[#0c0812] border border-white/10 p-3 space-y-2">
                  <div className="w-10 h-2.5 bg-black rounded-full mx-auto" />
                  <div className="text-center pt-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 mx-auto mb-1.5 flex items-center justify-center p-[1px]">
                      <div className="w-full h-full rounded-full bg-[#0c0812] flex items-center justify-center">
                        <Sparkles size={10} className="text-pink-300" />
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-white">Log In</div>
                    <div className="text-[8px] text-white/50">Welcome to TRIPONA</div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="p-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-[9px] text-white/50">
                      traveler@tripona.ai
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-[9px] text-white/50">
                      ••••••••••••
                    </div>
                    <div className="py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-center text-[9px] font-bold text-white shadow-sm">
                      Sign In
                    </div>
                  </div>
                </div>
              </div>

              {/* Front Phone: AI Travel Planner with Glowing Purple Orb */}
              <div className="absolute right-1 sm:right-4 bottom-0 w-48 sm:w-52 rounded-[30px] p-2 bg-gradient-to-b from-[#422240] via-[#201026] to-[#0c0710] border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-20 rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="relative rounded-[24px] overflow-hidden bg-[#0e0717] border border-white/10 p-3 space-y-2.5">
                  <div className="w-12 h-2.5 bg-black rounded-full mx-auto" />
                  
                  {/* Glowing AI Orb */}
                  <div className="flex flex-col items-center text-center pt-0.5">
                    <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#9333EA] via-[#EC4899] to-[#F97316] p-[1.5px] shadow-[0_0_20px_rgba(192,38,211,0.6)] animate-orb mb-1">
                      <div className="w-full h-full rounded-full bg-[#170a2a] flex items-center justify-center">
                        <Sparkles size={13} className="text-pink-200" />
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-white">AI Itinerary Ready</div>
                    <div className="text-[8px] text-[#A5A5A5]">Tokyo • 5 Days Custom Plan</div>
                  </div>

                  {/* Destination Card Preview */}
                  <div className="rounded-lg overflow-hidden aspect-[16/9] relative border border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80"
                      alt="Tokyo Night"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-1 left-1.5 right-1.5 text-[8px] font-bold text-white line-clamp-1">
                      Shinjuku & Shibuya Crossing
                    </div>
                  </div>

                  <div className="py-1.5 rounded-lg bg-white/10 text-center text-[9px] font-semibold text-white border border-white/15">
                    View Schedule
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
