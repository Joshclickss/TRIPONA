import React from 'react';
import { Sparkles, ArrowRight, Handshake } from 'lucide-react';

export default function PartnerCTASection({ onPartnerClick }) {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden flex items-center justify-center text-center">
      
      {/* Cinematic Sunset Mountain Landscape Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=85"
          alt="Sunset Mountains"
          className="w-full h-full object-cover opacity-35 scale-105 filter blur-[0.5px]"
        />
        {/* Dark Purple & Twilight Overlays matching the reference */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#120822]/85 to-[#050505]" />
        
        {/* Soft atmospheric gradient glow behind orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-purple-600/30 via-pink-600/25 to-teal-500/20 blur-[110px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 flex flex-col items-center space-y-6">
        
        {/* Glowing Center Orb Emblem */}
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#7E22CE] via-[#C026D3] to-[#14B8A6] p-[2.5px] shadow-[0_0_40px_rgba(168,85,247,0.7)] animate-orb mb-2">
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#18082e] to-[#071318] flex items-center justify-center">
            <Sparkles size={24} className="text-pink-300 animate-pulse" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-heading leading-tight">
          Partner With TRIPONA Today
        </h2>

        {/* Supporting text */}
        <p className="text-base sm:text-lg text-[#A5A5A5] max-w-xl leading-relaxed">
          Join us in creating smarter, more personalized travel experiences. Connect your airline, hotel chain, or experience platform to our AI network.
        </p>

        {/* CTA Button */}
        <div className="pt-2">
          <button
            onClick={onPartnerClick}
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[14px] sm:text-[15px] font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/25 hover:border-white/50 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_45px_rgba(168,85,247,0.65)] transition-all duration-300 active:scale-95"
          >
            <span>Become a Partner</span>
            <ArrowRight size={16} className="text-purple-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

    </section>
  );
}
