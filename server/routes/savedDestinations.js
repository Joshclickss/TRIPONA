import express from 'express';
import SavedDestination from '../models/SavedDestination.js';
import Destination from '../models/Destination.js';
import { requireAuth } from '../middleware/auth.js';
import { mutationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * GET /api/saved-destinations
 * Returns saved destinations for the authenticated user.
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const saved = await SavedDestination.find({ userId }).sort({ savedAt: -1 });
    const destinationIds = saved.map(s => s.destinationId);

    const destinations = await Destination.find({
      $or: [
        { slug: { $in: destinationIds } },
        { _id: { $in: destinationIds.filter(id => id.match(/^[0-9a-fA-F]{24}$/)) } }
      ]
    });

    res.json(destinations);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/saved-destinations/toggle
 * Bookmarks or unbookmarks a destination for the authenticated user.
 */
router.post('/toggle', requireAuth, mutationLimiter, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { destinationId, destinationName } = req.body;

    if (!destinationId || typeof destinationId !== 'string' || !destinationId.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'Valid destinationId is required.' });
    }

    const cleanDestId = destinationId.trim();
    const existing = await SavedDestination.findOne({ userId, destinationId: cleanDestId });

    if (existing) {
      await SavedDestination.deleteOne({ _id: existing._id });
      return res.json({ saved: false, message: 'Removed from saved destinations' });
    } else {
      const newEntry = new SavedDestination({
        userId,
        destinationId: cleanDestId,
        destinationName: destinationName ? String(destinationName).trim() : ''
      });
      await newEntry.save();
      return res.json({ saved: true, message: 'Saved to your destinations' });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
