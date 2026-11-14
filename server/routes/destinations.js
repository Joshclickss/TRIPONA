import express from 'express';
import Destination from '../models/Destination.js';
import City from '../models/City.js';

const router = express.Router();

/**
 * GET /api/destinations/search-cities
 * Fast autocomplete and search across 50,250+ world cities (simplemaps dataset)
 * Query params: q (string), country (string), limit (number)
 */
router.get('/search-cities', async (req, res) => {
  try {
    const { q = '', country = '', limit = 15 } = req.query;
    const queryStr = q.trim();

    if (!queryStr && !country) {
      // Default: Return top world metropolitan destination hubs
      const topCities = await City.find({ population: { $gt: 2000000 } })
        .sort({ population: -1 })
        .limit(Number(limit))
        .lean();
      return res.json(topCities);
    }

    const filter = {};
    if (queryStr) {
      // Clean query string and create prefix/contains regex
      const escaped = queryStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { cityAscii: new RegExp('^' + escaped, 'i') },
        { city: new RegExp('^' + escaped, 'i') },
        { cityAscii: new RegExp(escaped, 'i') },
        { country: new RegExp('^' + escaped, 'i') }
      ];
    }

    if (country) {
      filter.country = new RegExp(country.trim(), 'i');
    }

    const cities = await City.find(filter)
      .sort({ population: -1 })
      .limit(Number(limit))
      .lean();

    res.json(cities);
  } catch (err) {
    console.error('Error in /search-cities:', err);
    res.status(500).json({ error: 'Failed to search world cities', details: err.message });
  }
});

/**
 * GET /api/destinations/city-details
 * Retrieve exact geographic details and coordinates for a city
 */
router.get('/city-details', async (req, res) => {
  try {
    const { city, country } = req.query;
    if (!city) {
      return res.status(400).json({ error: 'City query parameter is required' });
    }

    const filter = {
      $or: [
        { cityAscii: new RegExp('^' + city.trim() + '$', 'i') },
        { city: new RegExp('^' + city.trim() + '$', 'i') }
      ]
    };

    if (country) {
      filter.country = new RegExp(country.trim(), 'i');
    }

    const result = await City.findOne(filter).sort({ population: -1 }).lean();
    if (!result) {
      return res.status(404).json({ error: 'City not found in world cities database' });
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching city details:', err);
    res.status(500).json({ error: 'Failed to retrieve city details' });
  }
});

// GET /api/destinations
// Query params: q, continent, style, type, limit
router.get('/', async (req, res) => {
  try {
    const { q, continent, style, type, limit = 50 } = req.query;
    const filter = {};

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { country: searchRegex },
        { continent: searchRegex },
        { tagline: searchRegex },
        { overview: searchRegex }
      ];
    }

    if (continent && continent !== 'All') {
      filter.continent = new RegExp(continent, 'i');
    }

    if (style && style !== 'All') {
      filter.travelStyle = { $in: [style] };
    }

    if (type === 'Popular') {
      filter.isPopular = true;
    } else if (type === 'Trending') {
      filter.isTrending = true;
    } else if (type === 'Hidden Gems') {
      filter.isHiddenGem = true;
    }

    const destinations = await Destination.find(filter)
      .limit(Number(limit))
      .sort({ rating: -1, reviewsCount: -1 });

    res.json(destinations);
  } catch (err) {
    console.error('Error fetching destinations:', err);
    res.status(500).json({ error: 'Failed to retrieve destination catalog', details: err.message });
  }
});

// GET /api/destinations/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let destination = null;

    // Check by slug first
    destination = await Destination.findOne({ slug: id });

    // Fallback to Mongo ObjectId if valid
    if (!destination && id.match(/^[0-9a-fA-F]{24}$/)) {
      destination = await Destination.findById(id);
    }

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found in catalog' });
    }

    res.json(destination);
  } catch (err) {
    console.error('Error fetching destination by ID:', err);
    res.status(500).json({ error: 'Error fetching destination details', details: err.message });
  }
});

export default router;
