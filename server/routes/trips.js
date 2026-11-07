import express from 'express';
import Trip from '../models/Trip.js';
import Expense from '../models/Expense.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { mutationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * GET /api/trips
 * Returns trips belonging to the authenticated user.
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/trips
 * Creates a new trip owned by the authenticated user.
 */
router.post('/', requireAuth, mutationLimiter, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const {
      title,
      destination,
      destinationId,
      startDate,
      endDate,
      travelStyle,
      travellers,
      totalBudget,
      coverImage,
      daysCount,
      days,
      isPublic
    } = req.body;

    // Strict input validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'A valid trip title is required.' });
    }
    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'A valid destination is required.' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'ValidationError', message: 'Start date and end date are required.' });
    }

    const shareToken = 'trip-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);

    const newTrip = new Trip({
      userId,
      title: title.trim(),
      destination: destination.trim(),
      destinationId: destinationId || null,
      startDate,
      endDate,
      travelStyle: travelStyle || 'smart-ai',
      travellers: Number(travellers) > 0 ? Number(travellers) : 1,
      totalBudget: Number(totalBudget) >= 0 ? Number(totalBudget) : 0,
      spentBudget: 0,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      daysCount: Number(daysCount) > 0 ? Number(daysCount) : 1,
      days: Array.isArray(days) ? days : [],
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      shareToken
    });

    await newTrip.save();
    res.status(201).json(newTrip);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/trips/:id
 * Retrieves trip details. Must be owned by the caller or set to public.
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid trip ID format.' });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'NotFound', message: 'Trip not found.' });
    }

    const callerUid = req.user ? req.user.uid : null;

    // Enforce resource ownership: Private trips are only visible to their creator
    if (!trip.isPublic && trip.userId !== callerUid) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'This trip itinerary is private and only accessible by its owner.'
      });
    }

    res.json(trip);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/trips/:id
 * Updates a trip. Enforces strict resource ownership.
 */
router.put('/:id', requireAuth, mutationLimiter, async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid trip ID format.' });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'NotFound', message: 'Trip not found.' });
    }

    // Enforce resource ownership
    if (trip.userId !== req.user.uid) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: You do not own this trip.'
      });
    }

    // Disallow overriding ownership
    const updateData = { ...req.body };
    delete updateData.userId;
    delete updateData._id;

    const updated = await Trip.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/trips/:id
 * Deletes a trip. Enforces strict resource ownership.
 */
router.delete('/:id', requireAuth, mutationLimiter, async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid trip ID format.' });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'NotFound', message: 'Trip not found.' });
    }

    // Enforce resource ownership
    if (trip.userId !== req.user.uid) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: You do not have permission to delete this trip.'
      });
    }

    // Cascade delete associated expenses
    await Expense.deleteMany({ tripId: req.params.id });
    await Trip.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Trip and associated expenses deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/trips/share/:token
 * Public shared trip link.
 */
router.get('/share/:token', async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ shareToken: req.params.token, isPublic: true });
    if (!trip) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Shared itinerary link not found or has been made private.'
      });
    }
    res.json(trip);
  } catch (err) {
    next(err);
  }
});

export default router;
