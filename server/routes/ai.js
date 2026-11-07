import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Conversation from '../models/Conversation.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import {
  generateUniversalTripPlan,
  refineUniversalTripPlan,
  parseUniversalTripRequest
} from '../utils/universalTravelEngine.js';

const router = express.Router();

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-flash-latest'
];

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey.trim());
}

async function generateWithFallback(genAI, prompt, options = {}) {
  let lastError;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(options.jsonMode ? { generationConfig: { responseMimeType: 'application/json' } } : {})
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      lastError = err;
      // Abort quickly on network/DNS or quota error to serve universal fallback instantly
      if (
        err.message?.includes('API_KEY') ||
        err.message?.includes('403') ||
        err.message?.includes('fetch') ||
        err.message?.includes('ENOTFOUND') ||
        err.message?.includes('ETIMEDOUT')
      ) {
        throw err;
      }
      console.warn(`Model ${modelName} unavailable, trying next:`, err.message?.slice(0, 80));
    }
  }
  throw lastError;
}

/**
 * POST /api/ai/plan-trip
 * Universal Dynamic AI Trip Planner
 * Handles ANY destination worldwide, single or multi-destination, domestic or international.
 */
router.post('/plan-trip', optionalAuth, aiLimiter, async (req, res, next) => {
  try {
    const {
      prompt,
      destination,
      destinations,
      startingLocation,
      duration,
      budget,
      currency,
      travellers,
      travelStyle,
      manualAllocations
    } = req.body;

    if (!prompt && !destination && (!destinations || destinations.length === 0)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Please provide at least one destination or a travel prompt.'
      });
    }

    const genAI = getGeminiClient();

    // If Gemini client is available, attempt live neural generation
    if (genAI) {
      try {
        const systemPrompt = `You are TRIPONA's Universal AI Travel Architect.
Generate a comprehensive, world-class travel masterplan in pure JSON matching this user request:
Prompt: "${prompt || ''}"
Destination(s): ${Array.isArray(destinations) ? destinations.join(', ') : (destination || 'Worldwide')}
Starting Origin: ${startingLocation || 'Not specified'}
Duration: ${duration || 'Optimal duration'} days
Budget: ${currency || 'USD'} ${budget || 'Optimal'}
Travellers: ${travellers || 2}
Travel Style: ${travelStyle || 'Cultural & Scenic'}

Strict Rules:
1. Work dynamically for the exact destination(s) provided. Do not substitute destinations.
2. If multiple destinations are provided, allocate appropriate days to each and sequence them efficiently without backtracking.
3. Every single day MUST follow this exact schema:
{
  "day": 1,
  "date": "Day 1",
  "destination": "Name of City/Region",
  "title": "Evocative Day Theme",
  "summary": "Narrative overview",
  "morning": { "time": "08:30 AM", "activity": "Specific morning landmark", "attraction": "Landmark Name", "breakfast": { "spot": "Cafe name", "dish": "Regional breakfast" }, "cost": "Formatted cost" },
  "afternoon": { "time": "01:30 PM", "activity": "Specific afternoon highlight", "attraction": "Landmark Name", "lunch": { "spot": "Restaurant name", "dish": "Regional specialty" }, "cost": "Formatted cost" },
  "evening": { "time": "06:30 PM", "activity": "Evening experience", "attraction": "Evening venue", "dinner": { "spot": "Dining spot", "dish": "Signature dinner" }, "cost": "Formatted cost" },
  "hotel": { "name": "Boutique Hotel Name", "type": "4-Star Boutique", "pricePerNight": "Formatted cost", "rating": 4.8, "bookingUrl": "https://www.google.com/travel/hotels", "location": "Central" },
  "transport": { "mode": "Transit mode", "details": "Transfer details", "cost": "Cost" },
  "transitTime": "Transit time",
  "distance": "Distance",
  "dailyBudget": "Daily total cost",
  "expenseBreakdown": { "accommodation": "Cost", "food": "Cost", "activities": "Cost", "transport": "Cost", "misc": "Cost" },
  "tips": "Local concierge tips"
}
4. Provide realistic geographic coordinates (lat, lng), mapWaypoints array for the route, budgetBreakdown, weatherAdvice, and safetyTips.
5. Return ONLY a valid JSON object.`;

        const textResult = await generateWithFallback(genAI, systemPrompt, { jsonMode: true });
        let itineraryData;
        try {
          itineraryData = JSON.parse(textResult);
        } catch (parseErr) {
          const match = textResult.match(/\{[\s\S]*\}/);
          if (match) itineraryData = JSON.parse(match[0]);
        }

        if (itineraryData && itineraryData.days && itineraryData.days.length > 0) {
          return res.json(itineraryData);
        }
      } catch (geminiErr) {
        console.warn('Gemini live plan synthesis unavailable, switching to Universal Engine:', geminiErr.message?.slice(0, 100));
      }
    }

    // Universal Dynamic Engine Fallback: Works for 100% of world destinations
    const universalPlan = generateUniversalTripPlan(req.body);
    return res.json(universalPlan);

  } catch (err) {
    console.error('Universal plan generation error:', err);
    const universalFallback = generateUniversalTripPlan(req.body);
    res.json(universalFallback);
  }
});

/**
 * POST /api/ai/refine-trip
 * Universal Context-Aware Itinerary Modification
 * Recalculates day allocations, routes, schedules, and budgets.
 */
router.post('/refine-trip', optionalAuth, aiLimiter, async (req, res, next) => {
  try {
    const { currentTrip, instruction } = req.body;

    if (!currentTrip || !instruction) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Current trip and refinement instruction are required.'
      });
    }

    const genAI = getGeminiClient();
    let updatedTrip = null;

    if (genAI) {
      try {
        const prompt = `You are TRIPONA's Universal AI Travel Concierge.
Modify the existing travel masterplan according to this user instruction:
"${instruction}"

Current Masterplan JSON:
${JSON.stringify(currentTrip)}

Strict Rules:
1. Recalculate day allocations, transit routes, and daily schedules if destinations or duration changed.
2. Recalculate the entire budget breakdown accordingly.
3. Preserve existing preferences, traveller counts, and currency.
4. Maintain the exact same schema. Return ONLY valid JSON.`;

        const textResult = await generateWithFallback(genAI, prompt, { jsonMode: true });
        try {
          updatedTrip = JSON.parse(textResult);
        } catch (parseErr) {
          const match = textResult.match(/\{[\s\S]*\}/);
          if (match) updatedTrip = JSON.parse(match[0]);
        }
      } catch (geminiErr) {
        console.warn('Gemini refine unavailable, using Universal Refine Engine:', geminiErr.message?.slice(0, 100));
      }
    }

    // Universal Refinement Engine
    if (!updatedTrip || !updatedTrip.days) {
      updatedTrip = refineUniversalTripPlan(currentTrip, instruction);
    }

    res.json({
      ...updatedTrip,
      trip: updatedTrip,
      message: `Masterplan successfully updated for: "${instruction}"`
    });

  } catch (err) {
    console.error('Refine trip error:', err);
    res.json({
      ...req.body.currentTrip,
      trip: req.body.currentTrip,
      message: `Maintained current itinerary (${err.message})`
    });
  }
});

/**
 * POST /api/ai/chat
 * Conversational Assistant with Context
 */
router.post('/chat', optionalAuth, aiLimiter, async (req, res, next) => {
  try {
    const { prompt, conversationId, history = [], context = {} } = req.body;
    const userId = req.user ? req.user.uid : null;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'Prompt message cannot be empty.' });
    }

    const genAI = getGeminiClient();
    if (!genAI) {
      let simulatedReply = `As TRIPONA's Universal AI Travel Architect, I am ready to plan your journey. `;
      const parsed = parseUniversalTripRequest(prompt);
      if (parsed.destinations.length > 0) {
        simulatedReply += `I have charted an optimized route across ${parsed.destinations.join(' and ')} for ${parsed.duration} days within ${parsed.currencySymbol}${parsed.budget.toLocaleString()}.`;
      } else {
        simulatedReply += `Tell me any combination of global destinations, your starting city, duration, or budget to begin.`;
      }

      return res.json({
        reply: simulatedReply,
        conversationId: conversationId || 'conv-universal-1',
        timestamp: new Date().toISOString()
      });
    }

    const systemInstruction = `You are TRIPONA's Universal AI Travel Concierge, an elite international travel architect.
Voyager: ${context.userName || (req.user ? req.user.name : 'Voyager')}
Active Destinations: ${context.destination || 'Global'}
Guidelines:
1. Provide deep, authentic travel intelligence for any place worldwide.
2. Embody Scandinavian minimalism: articulate, precise, no unnecessary fluff.`;

    const contents = [];
    contents.push({ role: 'user', parts: [{ text: systemInstruction }] });
    contents.push({ role: 'model', parts: [{ text: "Understood. I am ready to advise as TRIPONA's universal travel architect." }] });

    if (Array.isArray(history)) {
      history.slice(-8).forEach(turn => {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(turn.text) }]
          });
        }
      });
    }

    contents.push({ role: 'user', parts: [{ text: prompt.trim() }] });
    const replyText = await generateWithFallback(genAI, { contents });

    res.json({
      reply: replyText,
      conversationId: conversationId || 'conv-gemini-1',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.json({
      reply: "I can synthesize personalized day-by-day itineraries, interactive route maps, and budget optimizations for any destination worldwide. Tell me where you wish to explore!",
      conversationId: req.body.conversationId || 'conv-offline-fallback',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
