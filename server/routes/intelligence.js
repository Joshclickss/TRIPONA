import express from 'express';
import { 
  getDestinationIntelligence, 
  getLiveExchangeRates, 
  calculateSourceBackedBudget,
  getVerifiedAttractions 
} from '../services/travelIntelligenceService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey.trim());
}

/**
 * GET /api/intelligence/destination
 * Unified Real-Time Destination Dossier with Source Verification
 */
router.get('/destination', async (req, res) => {
  try {
    const { city = 'Tokyo', currency = 'USD' } = req.query;
    const dossier = await getDestinationIntelligence(city, currency);
    res.json(dossier);
  } catch (err) {
    console.error('Destination intelligence error:', err);
    res.status(500).json({
      error: 'Failed to retrieve destination intelligence',
      details: err.message
    });
  }
});

/**
 * GET /api/intelligence/rates
 * Real-Time Foreign Exchange Rates
 */
router.get('/rates', async (req, res) => {
  try {
    const { base = 'USD' } = req.query;
    const rates = await getLiveExchangeRates(base);
    res.json(rates);
  } catch (err) {
    console.error('Exchange rates error:', err);
    res.status(500).json({
      error: 'Failed to fetch live exchange rates',
      details: err.message
    });
  }
});

/**
 * POST /api/intelligence/calculate-budget
 * Custom Multi-Parameter Travel Budget Engine
 */
router.post('/calculate-budget', async (req, res) => {
  try {
    const {
      destination = 'Tokyo',
      country = 'Japan',
      durationDays = 7,
      travellerGroup = 'couple',
      travelStyle = 'mid-range',
      targetCurrency = 'USD'
    } = req.body;

    const fxData = await getLiveExchangeRates('USD');
    const fxRate = fxData.rates[targetCurrency.toUpperCase()] || 1.0;

    const budget = calculateSourceBackedBudget({
      destinationName: destination,
      country,
      durationDays: Number(durationDays) || 7,
      travellerGroup,
      travelStyle,
      baseCurrency: 'USD',
      fxRate,
      targetCurrency
    });

    res.json(budget);
  } catch (err) {
    console.error('Calculate budget error:', err);
    res.status(500).json({ error: 'Failed to calculate budget', details: err.message });
  }
});

/**
 * POST /api/intelligence/query
 * Real-Time Grounded Travel AI Q&A Engine
 * Fetches verified factual data first, then uses Gemini AI to answer strictly citing sources.
 */
router.post('/query', async (req, res) => {
  try {
    const { query, destination = 'Paris' } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Travel question query is required' });
    }

    // Step 1: Fetch Ground-Truth Real Data First
    const intelligence = await getDestinationIntelligence(destination, 'USD');

    const factsPrompt = `
You are the TRIPONA Global Travel Intelligence Agent.
PRIMARY DIRECTIVE: ACCURACY FIRST, AI SECOND.
Do NOT invent fake opening hours, fake ticket prices, or fake addresses.
If a piece of information is verified in the GROUND TRUTH facts below, use it and cite the source.
If an exact price or schedule is unknown or unavailable, explicitly state: "Official live pricing must be confirmed directly via [Provider/Venue Website]."

GROUND TRUTH DATA FOR ${intelligence.destination.fullName}:
- Coordinates: ${intelligence.destination.coordinates.lat}, ${intelligence.destination.coordinates.lng}
- Country: ${intelligence.destination.country}
- Verified Overview: ${intelligence.verifiedSummary.overview}
- Verified Attractions: ${JSON.stringify(intelligence.verifiedAttractions.map(a => ({ name: a.name, hours: a.openingHours, fee: a.feeRequired, site: a.officialWebsite })))}
- Benchmark Estimated Daily Budget (Couple, Mid-range): $${intelligence.calculatedBudget.totals.dailyCostPerPerson}/day per person
- Official Sources: Wikipedia (${intelligence.verifiedSummary.source?.url}), OpenStreetMap Geographic Data, Google Travel Official Listings

USER QUESTION: "${query}"

Provide a concise, direct, helpful response structured as follows:
1. Direct Answer
2. Verified Ground Truth & Details
3. Budget / Cost Context (clearly labeled as Verified or Statistical Estimate)
4. Source Citations (Name & URL)
`;

    const genAI = getGeminiClient();
    let answer = '';
    let sourcesCited = [
      intelligence.verifiedSummary.source,
      intelligence.liveExchangeRates.source,
      intelligence.calculatedBudget.sourceVerification
    ].filter(Boolean);

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(factsPrompt);
        const response = await result.response;
        answer = response.text();
      } catch (aiErr) {
        console.warn('Gemini AI generation fallback:', aiErr.message);
      }
    }

    if (!answer) {
      // Deterministic factual fallback if Gemini quota is reached
      answer = `### Travel Intelligence for ${intelligence.destination.fullName}\n\n` +
        `**Overview:** ${intelligence.verifiedSummary.overview}\n\n` +
        `**Top Verified Landmarks:**\n` +
        intelligence.verifiedAttractions.slice(0, 4).map(a => `- **${a.name}**: ${a.feeRequired || 'Admission details on site'} ${a.officialWebsite ? `([Official Website](${a.officialWebsite}))` : ''}`).join('\n') +
        `\n\n**Estimated Budget:** Average mid-range daily spend is approximately $${intelligence.calculatedBudget.totals.dailyCostPerPerson} per person. Exact flight and lodging costs should be verified directly through carrier reservations.\n\n` +
        `*Sources: Wikimedia Foundation, OpenStreetMap Geographical Database, Open Exchange Rates.*`;
    }

    res.json({
      query,
      destination: intelligence.destination,
      answer,
      groundTruth: {
        coordinates: intelligence.destination.coordinates,
        attractionsCount: intelligence.verifiedAttractions.length,
        liveRateUSD: intelligence.liveExchangeRates.currentRate,
        dailyCostEstimateUSD: intelligence.calculatedBudget.totals.dailyCostPerPerson
      },
      sources: sourcesCited,
      verificationStatus: 'VERIFIED_GROUND_TRUTH',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Intelligence query error:', err);
    res.status(500).json({ error: 'Failed to process travel intelligence query', details: err.message });
  }
});

export default router;
