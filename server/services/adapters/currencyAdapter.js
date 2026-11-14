/**
 * TRIPONA PROVIDER ADAPTER: CURRENCY CONVERSION
 * Primary Provider: Frankfurter API (Free, Open European Central Bank Exchange Rates)
 * Fallback Provider: Open Exchange Rates (160+ Global Fiat Currencies)
 */

const memoryCache = new Map();
const CACHE_TTL = 3600 * 1000; // 1 hour

export const currencyAdapter = {
  name: 'Frankfurter & European Central Bank Live FX',

  /**
   * Convert amount or get live rates
   * @param {string} baseCurrency (e.g. 'USD')
   * @param {string} targetCurrency (e.g. 'EUR')
   */
  async getExchangeRates(baseCurrency = 'USD') {
    const base = baseCurrency.toUpperCase();
    const cacheKey = `rates_${base}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }

    // 1. Try Frankfurter API first
    try {
      const url = `https://api.frankfurter.app/latest?from=${base}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const result = {
          provider: 'Frankfurter API (European Central Bank Live Feed)',
          sourceName: 'European Central Bank / Frankfurter Open API',
          sourceUrl: 'https://frankfurter.dev',
          base: data.base,
          rates: { ...data.rates, [data.base]: 1.0 },
          lastUpdated: data.date || new Date().toISOString().split('T')[0],
          verificationStatus: 'VERIFIED_LIVE',
          priceValidity: 'Published daily by the European Central Bank'
        };

        memoryCache.set(cacheKey, { timestamp: Date.now(), data: result });
        return result;
      }
    } catch (err) {
      console.warn('Frankfurter API fetch failed, trying Open Exchange Rates fallback:', err.message);
    }

    // 2. Fallback to Open Exchange Rates (supports INR, JPY, and 160+ fiat currencies)
    try {
      const url = `https://open.er-api.com/v6/latest/${base}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const result = {
          provider: 'Open Exchange Rates (Global Interbank Feed)',
          sourceName: 'Open Exchange Rates (Free Open Tier)',
          sourceUrl: 'https://open.er-api.com',
          base: data.base_code,
          rates: data.rates || {},
          lastUpdated: data.time_last_update_utc || new Date().toISOString(),
          verificationStatus: 'VERIFIED_LIVE',
          priceValidity: 'Updated every 24 hours'
        };

        memoryCache.set(cacheKey, { timestamp: Date.now(), data: result });
        return result;
      }
    } catch (err) {
      console.warn('Open Exchange Rates fallback failed:', err.message);
    }

    // 3. Fallback benchmark rates
    return {
      provider: 'TRIPONA Statistical FX Fallback',
      sourceName: 'TRIPONA Static FX Benchmarks',
      sourceUrl: 'https://tripona.in',
      base,
      rates: { USD: 1, EUR: 0.92, GBP: 0.79, INR: 86.8, JPY: 154.2, CHF: 0.90, AUD: 1.55, CAD: 1.40 },
      lastUpdated: new Date().toISOString(),
      verificationStatus: 'ESTIMATED_STATISTICAL',
      priceValidity: 'Static benchmark when upstream rate servers are unreachable'
    };
  },

  /**
   * Convert specific amount from one currency to another
   */
  async convert(amount, from = 'USD', to = 'EUR') {
    const rateData = await this.getExchangeRates(from);
    const target = to.toUpperCase();
    const rate = rateData.rates[target] || 1.0;
    return {
      from: from.toUpperCase(),
      to: target,
      originalAmount: Number(amount),
      convertedAmount: Math.round(Number(amount) * rate * 100) / 100,
      rate,
      source: rateData.sourceName,
      sourceUrl: rateData.sourceUrl,
      lastUpdated: rateData.lastUpdated,
      verificationStatus: rateData.verificationStatus
    };
  }
};

export default currencyAdapter;
