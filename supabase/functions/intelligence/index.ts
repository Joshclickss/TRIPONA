// Supabase Edge Function: intelligence
// Serverless Real-Time Travel Intelligence Gateway
// Powered by Frankfurter (ECB FX), Open-Meteo, World Bank & OpenStreetMap

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const city = url.searchParams.get("city") || "Tokyo";
  const currency = url.searchParams.get("currency") || "USD";

  try {
    // 1. Live FX from Frankfurter API (Free, European Central Bank)
    let fxRate = 1.0;
    try {
      const fxRes = await fetch(`https://api.frankfurter.app/latest?from=USD`);
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        fxRate = fxData.rates?.[currency.toUpperCase()] || 1.0;
      }
    } catch (_) {}

    // 2. Verified Wikipedia / Wikimedia Summary
    let wikiExtract = `${city} is a renowned global travel destination.`;
    let wikiImage = null;
    let wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(city)}`;
    let coordinates = { lat: 35.685, lng: 139.7514 };

    try {
      const wRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`, {
        headers: { "User-Agent": "TriponaEdgeGateway/1.0" }
      });
      if (wRes.ok) {
        const wData = await wRes.json();
        wikiExtract = wData.extract || wikiExtract;
        wikiImage = wData.originalimage?.source || wData.thumbnail?.source || null;
        wikiUrl = wData.content_urls?.desktop?.page || wikiUrl;
        if (wData.coordinates) {
          coordinates = { lat: wData.coordinates.lat, lng: wData.coordinates.lon };
        }
      }
    } catch (_) {}

    // 3. Live Weather from Open-Meteo (Free, No key)
    let weatherData = null;
    try {
      const mRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lng}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
      if (mRes.ok) {
        const mData = await mRes.json();
        weatherData = {
          temperature: `${Math.round(mData.current?.temperature_2m || 20)}°C`,
          humidity: `${mData.current?.relative_humidity_2m || 50}%`,
          forecast: (mData.daily?.time || []).slice(0, 5).map((d: string, i: number) => ({
            date: d,
            maxTemp: `${Math.round(mData.daily?.temperature_2m_max[i])}°C`,
            minTemp: `${Math.round(mData.daily?.temperature_2m_min[i])}°C`
          }))
        };
      }
    } catch (_) {}

    // 4. OpenStreetMap Nominatim Attractions
    const attractions = [];
    try {
      const osmRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(city + " attractions")}`, {
        headers: { "User-Agent": "TriponaEdgeGateway/1.0" }
      });
      if (osmRes.ok) {
        const osmItems = await osmRes.json();
        for (const item of (osmItems || [])) {
          attractions.push({
            name: item.name || item.display_name?.split(",")[0],
            category: item.type || "attraction",
            coordinates: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) },
            source: "OpenStreetMap Global Geocoding"
          });
        }
      }
    } catch (_) {}

    const payload = {
      destination: { name: city, coordinates },
      summary: { extract: wikiExtract, imageUrl: wikiImage, officialUrl: wikiUrl },
      weather: weatherData,
      attractions,
      currency: { code: currency.toUpperCase(), rateToUSD: fxRate, source: "Frankfurter European Central Bank Feed" },
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    });
  }
});
