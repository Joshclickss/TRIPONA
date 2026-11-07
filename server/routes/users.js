import express from 'express';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import SavedDestination from '../models/SavedDestination.js';
import { requireAuth } from '../middleware/auth.js';
import { mutationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/users/sync
 * Syncs authenticated Firebase user with MongoDB.
 * Derives user ID strictly from verified token (req.user.uid).
 */
router.post('/sync', requireAuth, mutationLimiter, async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email || req.body.email || '';
    const { name, photoURL } = req.body;

    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({
        uid,
        email,
        name: name || req.user.name || email.split('@')[0],
        photoURL: photoURL || '',
        travelPreferences: []
      });
      await user.save();
    } else {
      if (name) user.name = name;
      if (photoURL) user.photoURL = photoURL;
      if (email && !user.email) user.email = email;
      await user.save();
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/profile
 * Retrieves profile and computed travel stats for authenticated user.
 */
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const uid = req.user.uid;

    let user = await User.findOne({ uid });
    if (!user) {
      user = {
        uid,
        name: req.user.name || 'Global Voyager',
        email: req.user.email || '',
        country: 'International Voyager',
        currency: 'USD ($)',
        travelPreferences: []
      };
    }

    // Dynamic real statistics from actual database records
    const userTrips = await Trip.find({ userId: uid });
    const tripsCount = userTrips.length;

    // Derive unique countries
    const countriesSet = new Set();
    userTrips.forEach(t => {
      if (t.destination) {
        const parts = t.destination.split(',');
        const country = parts[parts.length - 1].trim();
        if (country) countriesSet.add(country);
      }
    });
    const countriesCount = countriesSet.size;

    // Real saved destinations count
    const savedCount = await SavedDestination.countDocuments({ userId: uid });

    res.json({
      user,
      stats: {
        tripsCount,
        countriesCount,
        savedCount,
        plannedBudgetTotal: userTrips.reduce((acc, t) => acc + (t.totalBudget || 0), 0)
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/users/profile
 * Updates authenticated user's travel preferences.
 */
router.put('/profile', requireAuth, mutationLimiter, async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { name, country, currency, travelPreferences, photoURL } = req.body;

    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({ uid, email: req.user.email || '' });
    }

    if (name) user.name = String(name).trim();
    if (country) user.country = String(country).trim();
    if (currency) user.currency = String(currency).trim();
    if (photoURL) user.photoURL = String(photoURL).trim();
    if (Array.isArray(travelPreferences)) {
      user.travelPreferences = travelPreferences.map(p => String(p).trim());
    }

    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
