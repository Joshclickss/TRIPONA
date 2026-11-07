import express from 'express';
import Checklist from '../models/Checklist.js';
import { requireAuth } from '../middleware/auth.js';
import { mutationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * GET /api/checklists
 * Returns only checklists for the authenticated user.
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const items = await Checklist.find({ userId }).sort({ createdAt: 1 });
    const travel = items.filter(i => i.type === 'travel');
    const packing = items.filter(i => i.type === 'packing');

    res.json({ travel, packing });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/checklists
 * Adds a checklist item for the authenticated user.
 */
router.post('/', requireAuth, mutationLimiter, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { text, type = 'travel', category = 'General', tripId } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'Checklist item text cannot be empty.' });
    }

    const item = new Checklist({
      userId,
      tripId: tripId || null,
      text: text.trim(),
      type: ['travel', 'packing'].includes(type) ? type : 'travel',
      category: category ? category.trim() : 'General',
      completed: false
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/checklists/:id/toggle
 * Toggles completion status. Enforces strict resource ownership.
 */
router.patch('/:id/toggle', requireAuth, mutationLimiter, async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid checklist item ID format.' });
    }

    const item = await Checklist.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'NotFound', message: 'Checklist item not found.' });
    }

    // Ownership check
    if (item.userId !== req.user.uid) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: You do not own this checklist item.'
      });
    }

    item.completed = !item.completed;
    await item.save();

    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/checklists/:id
 * Deletes a checklist item. Enforces strict resource ownership.
 */
router.delete('/:id', requireAuth, mutationLimiter, async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid checklist item ID format.' });
    }

    const item = await Checklist.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'NotFound', message: 'Checklist item not found.' });
    }

    // Ownership check
    if (item.userId !== req.user.uid) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: You do not have permission to delete this checklist item.'
      });
    }

    await Checklist.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Checklist item deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
