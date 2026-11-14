// Supabase Edge Function: services-explorer
// Exposes GDS travel services across all 9 categories with live filtering

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

const CATEGORIES = [
  { id: 'hotels', label: 'PREMIUM STAYS', name: 'Hotels & Resorts', icon: 'Hotel' },
  { id: 'flights', label: 'BEST ROUTES', name: 'Flights', icon: 'Plane' },
  { id: 'dining', label: 'CULINARY GEMS', name: 'Dining & Food', icon: 'Utensils' },
  { id: 'experiences', label: 'CURATED TOURS', name: 'Curated Experiences', icon: 'Compass' },
  { id: 'transportation', label: 'GROUND & RAIL', name: 'Seamless Transportation', icon: 'Car' },
  { id: 'cruises', label: 'OCEAN ESCAPES', name: 'Cruises & Yacht Charters', icon: 'Ship' },
  { id: 'adventures', label: 'THRILL SEEKERS', name: 'Adventure & Activities', icon: 'Mountain' },
  { id: 'wellness', label: 'RELAX & RECHARGE', name: 'Wellness & Retreats', icon: 'Sparkles' },
  { id: 'essentials', label: 'TRAVEL MADE EASY', name: 'Travel Essentials', icon: 'Shield' }
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const category = url.searchParams.get("category") || "all";
  const destination = url.searchParams.get("destination") || "Global";

  const sampleServices = [
    {
      id: "srv-hotel-1",
      category: "hotels",
      title: `Grand Heritage Boutique Stay in ${destination}`,
      destination: destination,
      rating: 4.95,
      pricePerUnit: 180,
      currency: "USD",
      unitType: "per night",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      provider: "Verified Direct Stays"
    },
    {
      id: "srv-flight-1",
      category: "flights",
      title: `Direct Express Connection to ${destination}`,
      destination: destination,
      rating: 4.88,
      pricePerUnit: 420,
      currency: "USD",
      unitType: "per passenger",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
      provider: "Global GDS Partner"
    },
    {
      id: "srv-dining-1",
      category: "dining",
      title: `Chef Tasting & Wine Experience in ${destination}`,
      destination: destination,
      rating: 4.92,
      pricePerUnit: 55,
      currency: "USD",
      unitType: "per guest",
      image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
      provider: "Curated Culinary"
    }
  ];

  const filtered = category === "all" 
    ? sampleServices 
    : sampleServices.filter(s => s.category === category);

  return new Response(JSON.stringify({
    success: true,
    categories: CATEGORIES,
    services: filtered
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200
  });
});
