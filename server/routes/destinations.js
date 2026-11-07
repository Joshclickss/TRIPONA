import express from 'express';
import Destination from '../models/Destination.js';

const router = express.Router();

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
