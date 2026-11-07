import React, { useState } from 'react';
import { Send, Twitter, Instagram, Linkedin, Youtube, ArrowRight, Check } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="relative bg-[#050505] text-[#A5A5A5] pt-20 pb-12 overflow-hidden border-t border-white/[0.06]">
      
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-purple-950/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Top Row: Tagline Left, Newsletter Right */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-16 border-b border-white/[0.08]">
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              Travel smarter. Discover more.
            </h3>
            <p className="text-sm text-[#A5A5A5]">
              Get curated travel inspiration, new AI features and private member offers.
            </p>
          </div>

          {/* Newsletter Input Form */}
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-full bg-white/[0.05] border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-400/50 backdrop-blur-md"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-white/15 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
            >
              {subscribed ? (
                <>
                  <Check size={16} className="text-emerald-400" />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <span>Subscribe</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Middle Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 py-16">
          
          {/* Brand Info (4 Cols) */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <a href="#" className="flex items-center">
              <img
                src="/tripona_logo.png"
                alt="TRIPONA"
                className="h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.35)]"
              />
            </a>
            
            <p className="text-xs sm:text-sm text-[#A5A5A5] leading-relaxed max-w-xs">
              AI-powered trip planner with one-click unified booking. Designing extraordinary journeys around the globe.
            </p>

            <div className="flex items-center gap-3 pt-2 text-white/60">
              <a href="#" className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] hover:text-white flex items-center justify-center transition-colors">
                <Twitter size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] hover:text-white flex items-center justify-center transition-colors">
                <Instagram size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] hover:text-white flex items-center justify-center transition-colors">
                <Linkedin size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] hover:text-white flex items-center justify-center transition-colors">
                <Youtube size={14} />
              </a>
            </div>
          </div>

          {/* EXPLORE (2 Cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-widest uppercase">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><a href="#explore" className="hover:text-white transition-colors">Destinations</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Hotels</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Flights</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Experiences</a></li>
            </ul>
          </div>

          {/* COMPANY (3 Cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-widest uppercase">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#partner" className="hover:text-white transition-colors">Partners</a></li>
            </ul>
          </div>

          {/* SUPPORT (3 Cols) */}
          <div className="col-span-2 md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-widest uppercase">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><a href="#faq" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright line */}
        <div className="pt-8 pb-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} TRIPONA.in Inc. All rights reserved.</p>
          <p>Designed for the next generation of global travelers.</p>
        </div>

      </div>

      {/* ============================================================== */}
      {/* Massive Oversized Watermark Brand Typography "tripona" at bottom */}
      {/* ============================================================== */}
      <div className="w-full overflow-hidden text-center select-none pointer-events-none pt-4 opacity-[0.07] leading-none">
        <span className="font-brand font-black text-[20vw] tracking-tighter text-white inline-block transform translate-y-[20%] uppercase">
          tripona
        </span>
      </div>

    </footer>
  );
}
