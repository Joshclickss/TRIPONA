import React, { useState, useEffect } from 'react';
import { Sparkles, Bookmark, User, LogOut, Menu, X, Settings, Heart, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  onOpenPlanner, 
  onOpenMyTrips, 
  onOpenBookings,
  onOpenAuth 
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 pointer-events-none ${
        isScrolled
          ? 'py-3.5 bg-[#08090A]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
          : 'py-5 sm:py-6 bg-gradient-to-b from-[#08090A]/80 via-[#08090A]/30 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between pointer-events-auto">
        
        {/* Left: TRIPONA.in Logo with Glowing Cyan / Purple Accent */}
        <a
          href="#"
          className="flex items-center transition-all duration-300 group"
        >
          <img
            src="/tripona_logo.png"
            alt="TRIPONA"
            className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all duration-300"
          />
        </a>

        {/* Right: The 3 Primary Hero Navigation Actions */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Action 1: AI Trip Planner */}
          <button
            onClick={onOpenPlanner}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#A855F7]/25 to-[#06B6D4]/20 hover:from-[#A855F7]/40 hover:to-[#06B6D4]/35 border border-[#A855F7]/40 hover:border-[#A855F7]/70 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:shadow-[0_0_35px_rgba(168,85,247,0.45)] backdrop-blur-xl active:scale-95"
            aria-label="Open AI Trip Planner"
          >
            <Sparkles size={14} className="text-[#A855F7] group-hover:rotate-12 transition-transform duration-300" />
            <span className="tracking-wide">AI Trip Planner</span>
          </button>

          {/* Action 2: My Trips */}
          <button
            onClick={onOpenMyTrips}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel hover:bg-white/[0.08] text-xs font-medium text-white/90 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl backdrop-blur-xl active:scale-95"
            aria-label="View My Trips"
          >
            <Bookmark size={13} className="text-[#06B6D4] group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">My Trips</span>
          </button>

          {/* Action 2.5: My Bookings */}
          <button
            onClick={onOpenBookings}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel hover:bg-white/[0.08] text-xs font-medium text-white/90 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl backdrop-blur-xl active:scale-95"
            aria-label="View My Bookings"
          >
            <Ticket size={13} className="text-[#A855F7] group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">Bookings</span>
          </button>

          {/* Action 3: My Profile */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full glass-panel hover:border-[#A855F7]/40 transition-all duration-300 border border-white/10 shadow-xl"
                aria-label="User Profile"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#A855F7] to-[#06B6D4] flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                  {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0) || 'U'}
                </div>
                <span className="text-xs font-medium text-white max-w-[80px] truncate">
                  {user.displayName?.split(' ')[0] || 'Profile'}
                </span>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-panel shadow-2xl p-2 z-50 backdrop-blur-2xl border border-white/10">
                  <div className="px-3 py-2 border-b border-white/10 text-xs">
                    <div className="font-semibold text-white truncate">{user.displayName || 'Traveler'}</div>
                    <div className="text-[10px] text-white/50 truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenMyTrips();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 mt-1"
                  >
                    <Bookmark size={13} className="text-[#06B6D4]" />
                    <span>Saved Trips & Plans</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenBookings && onOpenBookings();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Ticket size={13} className="text-[#A855F7]" />
                    <span>My Bookings & Vouchers</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel hover:bg-white/[0.08] text-xs font-medium text-white/90 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl backdrop-blur-xl active:scale-95"
              aria-label="My Profile"
            >
              <User size={13} className="text-[#A855F7]" />
              <span className="tracking-wide">My Profile</span>
            </button>
          )}

        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white/80 hover:text-white backdrop-blur-xl border border-white/10"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 mx-4 rounded-3xl glass-panel p-5 shadow-2xl space-y-3 backdrop-blur-2xl border border-white/15 pointer-events-auto">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPlanner();
            }}
            className="w-full py-3 rounded-full text-center text-xs font-bold text-white bg-gradient-to-r from-[#A855F7] to-[#06B6D4] shadow-lg flex items-center justify-center gap-2"
          >
            <Sparkles size={15} />
            <span>AI Trip Planner</span>
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMyTrips();
              }}
              className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1.5"
            >
              <Bookmark size={14} className="text-[#06B6D4]" />
              <span>My Trips</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBookings && onOpenBookings();
              }}
              className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1.5"
            >
              <Ticket size={14} className="text-[#A855F7]" />
              <span>Bookings</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="text-xs font-semibold text-[#A855F7] hover:text-white flex items-center gap-1"
              >
                <User size={13} />
                <span>My Profile</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
