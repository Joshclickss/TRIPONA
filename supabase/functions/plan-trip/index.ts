// Supabase Edge Function: plan-trip
// Serverless AI Trip Planning Engine powered by Google Gemini (Free Tier)
// Complies with Deno standard and Supabase Edge Runtime

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

  try {
    const { prompt, destinations, startingLocation = "London", duration = 7, budget = 3500, currency = "USD", travellers = 2 } = await req.json();

    const destString = Array.isArray(destinations) && destinations.length > 0 
      ? destinations.join(", ") 
      : (prompt || "Tokyo, Kyoto, Osaka");

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    let generatedPlan = null;

    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const aiPrompt = `Plan a verified, realistic ${duration}-day trip visiting ${destString} starting from ${startingLocation} for ${travellers} travellers with a total budget of ${currency} ${budget}.
Return a clean JSON object with:
{
  "title": "${destString} Bespoke Journey",
  "destination": "${destString}",
  "totalBudget": ${budget},
  "durationDays": ${duration},
  "days": [
    {
      "day": 1,
      "title": "Arrival & Initial Exploration",
      "summary": "Check-in and evening scenic walk",
      "morning": { "activity": "Arrival and transport to stay", "transport": "Express train" },
      "afternoon": { "activity": "Landmark visit", "food": "Local lunch specialty" },
      "evening": { "activity": "Old Town walk", "food": "Traditional dinner" },
      "dailyEstimatedBudget": "${currency} ${Math.round(budget / duration)}"
    }
  ]
}`;

        const aiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: aiPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            generatedPlan = JSON.parse(rawText);
          }
        }
      } catch (e) {
        console.warn("Edge Gemini error:", e);
      }
    }

    if (!generatedPlan) {
      // Deterministic fallback plan
      const destList = destString.split(/[,&+]|\band\b/i).map((s: string) => s.trim()).filter(Boolean);
      const days = [];
      for (let i = 1; i <= Number(duration); i++) {
        const currentDest = destList[(i - 1) % destList.length] || destString;
        days.push({
          day: i,
          title: `Discover ${currentDest}`,
          summary: `Exploration of ${currentDest} landmarks, cultural heritage and regional gastronomy.`,
          morning: { activity: `Morning tour of ${currentDest} historic center`, transport: "Scenic rail / metro" },
          afternoon: { activity: `Visit prominent national museum & viewpoint`, food: "Artisanal lunch specialty" },
          evening: { activity: `Twilight promenade and market walk`, food: "Regional dinner" },
          dailyEstimatedBudget: `${currency} ${Math.round(Number(budget) / Number(duration))}`
        });
      }

      generatedPlan = {
        title: `${destString} Travel Itinerary`,
        destination: destString,
        totalBudget: Number(budget),
        durationDays: Number(duration),
        days,
        source: "TRIPONA Universal AI Engine"
      };
    }

    return new Response(JSON.stringify({ success: true, plan: generatedPlan }), {
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
