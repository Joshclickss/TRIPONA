import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { BookingProvider, useBooking } from './context/BookingContext';

// Navigation & Modals
import Navbar from './components/Navbar';
import AIPlannerModal from './components/AIPlannerModal';
import DestinationsModal from './components/DestinationsModal';
import MyTripsModal from './components/MyTripsModal';
import AuthModal from './components/AuthModal';
import ServicesExplorerModal from './components/ServicesExplorerModal';
import BookingCheckoutModal from './components/BookingCheckoutModal';
import MyBookingsModal from './components/MyBookingsModal';
import TravelIntelligenceModal from './components/TravelIntelligenceModal';

// Page Sections (Strict master layout order)
import HeroSection from './components/HeroSection';
import ExploreDestinationsSection from './components/ExploreDestinationsSection';
import AITripPlannerSection from './components/AITripPlannerSection';
import BookingFeaturesSection from './components/BookingFeaturesSection';
import DestinationInspirationSection from './components/DestinationInspirationSection';
import MobileAppSection from './components/MobileAppSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';

function AppContent() {
  const { openMyBookings } = useBooking();

  // Modal states
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [tripsOpen, setTripsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);

  // Selected destination state when clicking "Plan Trip" anywhere
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Helper to open AI Planner with a pre-filled destination
  const handleOpenPlanner = (dest = null) => {
    if (dest) {
      setSelectedDestination(dest);
    }
    setPlannerOpen(true);
  };

  const handleDestinationSelect = (dest) => {
    setSelectedDestination(dest);
    setDestinationsOpen(false);
    setPlannerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050809] text-white selection:bg-[#A9DDF0]/30 selection:text-white relative">
      
      {/* ========================================================= */}
      {/* 1. FLOATING MINIMAL NAVIGATION */}
      {/* Primary actions: AI Trip Planner, My Trips, Bookings, Profile */}
      {/* ========================================================= */}
      <Navbar
        onOpenPlanner={() => handleOpenPlanner()}
        onOpenMyTrips={() => setTripsOpen(true)}
        onOpenBookings={() => openMyBookings()}
        onOpenIntelligence={() => setIntelligenceOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenDestinations={() => setDestinationsOpen(true)}
      />

      <main className="relative">
        {/* ========================================================= */}
        {/* 2. FULL-SCREEN IMAGE-ONLY HERO */}
        {/* Pure destination photography. ZERO hero text/headings.    */}
        {/* Ken Burns zoom, smooth carousel transitions, dark glow.  */}
        {/* ========================================================= */}
        <HeroSection
          onOpenPlanner={(quickInputs) => {
            if (quickInputs?.destination) {
              setSelectedDestination({ name: quickInputs.destination });
            }
            setPlannerOpen(true);
          }}
          onOpenDestinations={() => setDestinationsOpen(true)}
          onOpenTrips={() => setTripsOpen(true)}
          onOpenSaved={() => setTripsOpen(true)}
          onOpenProfile={() => setAuthOpen(true)}
          onExploreClick={() => {
            const el = document.getElementById('explore-destinations');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onPlanClick={(dest) => handleOpenPlanner(dest)}
        />

        {/* ========================================================= */}
        {/* SECTION 1 — EXPLORE DESTINATIONS */}
        {/* Search, category filter tabs, luxury destination cards    */}
        {/* ========================================================= */}
        <ExploreDestinationsSection
          onSelectDestination={(dest) => handleOpenPlanner(dest)}
        />

        {/* ========================================================= */}
        {/* SECTION 2 — EMBEDDED AI TRIP PLANNER */}
        {/* Interactive in-page AI journey creation with Gemini live */}
        {/* ========================================================= */}
        <AITripPlannerSection
          prefilledDestination={selectedDestination?.name || ''}
        />

        {/* ========================================================= */}
        {/* SECTION 4 — COMPLETE TRAVEL BOOKING (ALL 9 MODULES)       */}
        {/* Hotels, Flights, Dining, Experiences, Transit, Cruises... */}
        {/* ========================================================= */}
        <BookingFeaturesSection />

        {/* ========================================================= */}
        {/* SECTION 5 — TRAVEL INSPIRATION */}
        {/* Large featured card + side gallery grid                   */}
        {/* ========================================================= */}
        <DestinationInspirationSection />

        {/* ========================================================= */}
        {/* SECTION 6 — MOBILE EXPERIENCE */}
        {/* Dual iPhone mockups, offline syncing, App Store links     */}
        {/* ========================================================= */}
        <MobileAppSection />

        {/* ========================================================= */}
        {/* SECTION 7 — SHORT FAQ SECTION (AT BOTTOM) */}
        {/* Compact expandable accordion                               */}
        {/* ========================================================= */}
        <FAQSection />

        {/* ========================================================= */}
        {/* SECTION 8 — FOOTER */}
        {/* Dark luxury brand footer                                   */}
        {/* ========================================================= */}
        <Footer />
      </main>

      {/* ========================================================= */}
      {/* APPLICATION MODALS */}
      {/* ========================================================= */}
      <AIPlannerModal
        isOpen={plannerOpen}
        onClose={() => {
          setPlannerOpen(false);
          setSelectedDestination(null);
        }}
        initialDestination={selectedDestination?.name || ''}
      />

      <DestinationsModal
        isOpen={destinationsOpen}
        onClose={() => setDestinationsOpen(false)}
        onSelectDestination={handleDestinationSelect}
      />

      <MyTripsModal
        isOpen={tripsOpen}
        onClose={() => setTripsOpen(false)}
        onPlanNewTrip={() => {
          setTripsOpen(false);
          handleOpenPlanner();
        }}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      <TravelIntelligenceModal
        isOpen={intelligenceOpen}
        onClose={() => setIntelligenceOpen(false)}
        initialDestination={selectedDestination?.name || 'Tokyo'}
      />

      {/* ========================================================= */}
      {/* TRAVEL SERVICES & BOOKING MANAGEMENT MODALS                */}
      {/* ========================================================= */}
      <ServicesExplorerModal />
      <BookingCheckoutModal />
      <MyBookingsModal />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
      </TripProvider>
    </AuthProvider>
  );
}
