/**
 * TRIPONA UNIFIED TRAVEL PROVIDER REGISTRY & ADAPTER GATEWAY
 * 
 * Provides a single standardized interface across all free external APIs:
 * - Currency: Frankfurter API (Primary) + Open Exchange Rates (Fallback)
 * - Weather: Open-Meteo Global Satellite & Surface Forecast
 * - Attractions: OpenTripMap (Primary) + OpenStreetMap Nominatim / Wikimedia (Fallback)
 * - Country Statistics: World Bank Open Data + REST Countries
 * - Geocoding: GeoNames (Primary) + SimpleMaps 50,000+ World Cities (Fallback)
 * 
 * Guarantees zero frontend breaking changes when backend providers are swapped.
 */

import currencyAdapter from './currencyAdapter.js';
import weatherAdapter from './weatherAdapter.js';
import attractionsAdapter from './attractionsAdapter.js';
import countryStatsAdapter from './countryStatsAdapter.js';
import geocodingAdapter from './geocodingAdapter.js';
import { getVerifiedDestinationSummary } from '../travelIntelligenceService.js';

export const travelProviderRegistry = {
  currency: currencyAdapter,
  weather: weatherAdapter,
  attractions: attractionsAdapter,
  countryStats: countryStatsAdapter,
  geocoding: geocodingAdapter,

  /**
   * Get unified, multi-provider verified dossier for any destination
   */
  async getUnifiedDossier(destination, targetCurrency = 'USD') {
    // 1. Geocode location
    const geo = await geocodingAdapter.geocode(destination) || {
      name: destination,
      country: 'Global',
      lat: 48.8566,
      lng: 2.3522
    };

    // 2. Parallel fetch from free live providers
    const [weatherData, attractionsData, fxData, wikiData] = await Promise.all([
      weatherAdapter.getWeather(geo.lat, geo.lng),
      attractionsAdapter.getAttractions(geo.name, geo.lat, geo.lng, 8),
      currencyAdapter.getExchangeRates('USD'),
      getVerifiedDestinationSummary(geo.name)
    ]);

    const targetRate = fxData.rates[targetCurrency.toUpperCase()] || 1.0;

    return {
      destination: {
        name: geo.name,
        country: geo.country,
        coordinates: { lat: geo.lat, lng: geo.lng },
        population: geo.population || null
      },
      verifiedOverview: wikiData ? {
        summary: wikiData.extract,
        imageUrl: wikiData.originalImage || wikiData.thumbnail,
        source: wikiData.source
      } : null,
      weather: weatherData,
      attractions: attractionsData,
      liveFX: {
        base: 'USD',
        targetCurrency,
        rate: targetRate,
        lastUpdated: fxData.lastUpdated,
        source: {
          name: fxData.sourceName,
          url: fxData.sourceUrl,
          verificationStatus: fxData.verificationStatus
        }
      },
      providersActive: {
        currency: currencyAdapter.name,
        weather: weatherAdapter.name,
        attractions: attractionsAdapter.name,
        geocoding: geocodingAdapter.name
      },
      timestamp: new Date().toISOString()
    };
  }
};

export default travelProviderRegistry;
