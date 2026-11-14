// Utility for mapping travel destinations / countries to their respective default currencies and symbols

export const DESTINATION_CURRENCY_MAP = {
  // India / Kerala
  'kerala': { currency: 'INR', symbol: '₹', defaultBudget: 35000 },
  'munnar': { currency: 'INR', symbol: '₹', defaultBudget: 30000 },
  'alappuzha': { currency: 'INR', symbol: '₹', defaultBudget: 28000 },
  'alleppey': { currency: 'INR', symbol: '₹', defaultBudget: 28000 },
  'kochi': { currency: 'INR', symbol: '₹', defaultBudget: 30000 },
  'cochin': { currency: 'INR', symbol: '₹', defaultBudget: 30000 },
  'wayanad': { currency: 'INR', symbol: '₹', defaultBudget: 25000 },
  'varkala': { currency: 'INR', symbol: '₹', defaultBudget: 25000 },
  'india': { currency: 'INR', symbol: '₹', defaultBudget: 45000 },
  'delhi': { currency: 'INR', symbol: '₹', defaultBudget: 40000 },
  'agra': { currency: 'INR', symbol: '₹', defaultBudget: 30000 },
  'taj mahal': { currency: 'INR', symbol: '₹', defaultBudget: 30000 },
  'mumbai': { currency: 'INR', symbol: '₹', defaultBudget: 50000 },
  'goa': { currency: 'INR', symbol: '₹', defaultBudget: 35000 },
  'jaipur': { currency: 'INR', symbol: '₹', defaultBudget: 35000 },
  'rajasthan': { currency: 'INR', symbol: '₹', defaultBudget: 45000 },
  'udaipur': { currency: 'INR', symbol: '₹', defaultBudget: 40000 },
  'kashmir': { currency: 'INR', symbol: '₹', defaultBudget: 50000 },
  'ladakh': { currency: 'INR', symbol: '₹', defaultBudget: 55000 },
  'himalayas': { currency: 'INR', symbol: '₹', defaultBudget: 50000 },
  'bangalore': { currency: 'INR', symbol: '₹', defaultBudget: 35000 },
  'bengaluru': { currency: 'INR', symbol: '₹', defaultBudget: 35000 },

  // Europe (Eurozone)
  'france': { currency: 'EUR', symbol: '€', defaultBudget: 3800 },
  'paris': { currency: 'EUR', symbol: '€', defaultBudget: 3800 },
  'italy': { currency: 'EUR', symbol: '€', defaultBudget: 3500 },
  'rome': { currency: 'EUR', symbol: '€', defaultBudget: 3500 },
  'florence': { currency: 'EUR', symbol: '€', defaultBudget: 3200 },
  'venice': { currency: 'EUR', symbol: '€', defaultBudget: 3500 },
  'spain': { currency: 'EUR', symbol: '€', defaultBudget: 3200 },
  'barcelona': { currency: 'EUR', symbol: '€', defaultBudget: 3200 },
  'madrid': { currency: 'EUR', symbol: '€', defaultBudget: 3000 },
  'germany': { currency: 'EUR', symbol: '€', defaultBudget: 3400 },
  'berlin': { currency: 'EUR', symbol: '€', defaultBudget: 3200 },
  'netherlands': { currency: 'EUR', symbol: '€', defaultBudget: 3500 },
  'amsterdam': { currency: 'EUR', symbol: '€', defaultBudget: 3500 },
  'greece': { currency: 'EUR', symbol: '€', defaultBudget: 3400 },
  'santorini': { currency: 'EUR', symbol: '€', defaultBudget: 3800 },
  'athens': { currency: 'EUR', symbol: '€', defaultBudget: 2800 },
  'austria': { currency: 'EUR', symbol: '€', defaultBudget: 3300 },
  'vienna': { currency: 'EUR', symbol: '€', defaultBudget: 3300 },
  'portugal': { currency: 'EUR', symbol: '€', defaultBudget: 2800 },
  'lisbon': { currency: 'EUR', symbol: '€', defaultBudget: 2800 },

  // Switzerland
  'switzerland': { currency: 'CHF', symbol: 'CHF', defaultBudget: 4500 },
  'swiss alps': { currency: 'CHF', symbol: 'CHF', defaultBudget: 4500 },
  'zermatt': { currency: 'CHF', symbol: 'CHF', defaultBudget: 4800 },
  'zurich': { currency: 'CHF', symbol: 'CHF', defaultBudget: 4200 },
  'geneva': { currency: 'CHF', symbol: 'CHF', defaultBudget: 4200 },

  // United Kingdom
  'united kingdom': { currency: 'GBP', symbol: '£', defaultBudget: 3500 },
  'uk': { currency: 'GBP', symbol: '£', defaultBudget: 3500 },
  'london': { currency: 'GBP', symbol: '£', defaultBudget: 3500 },
  'edinburgh': { currency: 'GBP', symbol: '£', defaultBudget: 3000 },
  'scotland': { currency: 'GBP', symbol: '£', defaultBudget: 3200 },

  // Japan
  'japan': { currency: 'JPY', symbol: '¥', defaultBudget: 500000 },
  'tokyo': { currency: 'JPY', symbol: '¥', defaultBudget: 500000 },
  'kyoto': { currency: 'JPY', symbol: '¥', defaultBudget: 450000 },
  'osaka': { currency: 'JPY', symbol: '¥', defaultBudget: 450000 },

  // UAE / Middle East
  'uae': { currency: 'AED', symbol: 'AED', defaultBudget: 12000 },
  'united arab emirates': { currency: 'AED', symbol: 'AED', defaultBudget: 12000 },
  'dubai': { currency: 'AED', symbol: 'AED', defaultBudget: 12000 },
  'abu dhabi': { currency: 'AED', symbol: 'AED', defaultBudget: 11000 },

  // USA & Americas
  'usa': { currency: 'USD', symbol: '$', defaultBudget: 5000 },
  'united states': { currency: 'USD', symbol: '$', defaultBudget: 5000 },
  'new york': { currency: 'USD', symbol: '$', defaultBudget: 5500 },
  'san francisco': { currency: 'USD', symbol: '$', defaultBudget: 5200 },
  'los angeles': { currency: 'USD', symbol: '$', defaultBudget: 4800 },
  'miami': { currency: 'USD', symbol: '$', defaultBudget: 4500 },
  'hawaii': { currency: 'USD', symbol: '$', defaultBudget: 5500 },

  // Canada
  'canada': { currency: 'CAD', symbol: 'C$', defaultBudget: 5000 },
  'toronto': { currency: 'CAD', symbol: 'C$', defaultBudget: 4500 },
  'vancouver': { currency: 'CAD', symbol: 'C$', defaultBudget: 4800 },

  // Australia
  'australia': { currency: 'AUD', symbol: 'A$', defaultBudget: 5500 },
  'sydney': { currency: 'AUD', symbol: 'A$', defaultBudget: 5500 },
  'melbourne': { currency: 'AUD', symbol: 'A$', defaultBudget: 5200 },

  // Southeast Asia (Commonly USD or regional, standard fallback to USD or local)
  'singapore': { currency: 'USD', symbol: '$', defaultBudget: 4500 },
  'bali': { currency: 'USD', symbol: '$', defaultBudget: 3200 },
  'indonesia': { currency: 'USD', symbol: '$', defaultBudget: 3000 },
  'thailand': { currency: 'USD', symbol: '$', defaultBudget: 3000 },
  'bangkok': { currency: 'USD', symbol: '$', defaultBudget: 2800 },
  'phuket': { currency: 'USD', symbol: '$', defaultBudget: 3200 }
};

/**
 * Detect currency from a destination string or country name
 * @param {string} destinationString - e.g. "Munnar, Kerala" or "Paris, France"
 * @returns {{ currency: string, symbol: string, defaultBudget?: number } | null}
 */
export function getCurrencyForDestination(destinationString) {
  if (!destinationString || typeof destinationString !== 'string') return null;

  const normalized = destinationString.toLowerCase();

  // 1. Direct match or substring in map keys
  for (const [key, val] of Object.entries(DESTINATION_CURRENCY_MAP)) {
    // Check if the destination contains the key as a word or segment
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(normalized)) {
      return val;
    }
  }

  // 2. Check token parts (e.g., "Paris, France" -> check "paris", then "france")
  const parts = normalized.split(/[,/&-]/).map(p => p.trim()).filter(Boolean);
  for (const p of parts) {
    if (DESTINATION_CURRENCY_MAP[p]) {
      return DESTINATION_CURRENCY_MAP[p];
    }
  }

  return null;
}
