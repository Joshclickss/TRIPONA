import express from 'express';
import Expense from '../models/Expense.js';
import Trip from '../models/Trip.js';
import { requireAuth } from '../middleware/auth.js';
import { mutationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * GET /api/expenses
 * Returns only expenses belonging to the authenticated user.
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { tripId } = req.query;
    const filter = { userId };
    
    if (tripId) {
      filter.tripId = tripId;
    }

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/expenses
 * Adds an expense record for the authenticated user.
 */
router.post('/', requireAuth, mutationLimiter, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { tripId, category, description, amount, currency, date } = req.body;

    // Strict validation
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'A valid description is required.' });
    }
    const parsedAmount = Number(amount);
    if (amount === undefined || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'ValidationError', message: 'A positive numerical amount is required.' });
    }

    // If tripId is supplied, verify caller owns the trip
    if (tripId && tripId.match(/^[0-9a-fA-F]{24}$/)) {
      const trip = await Trip.findById(tripId);
      if (trip && trip.userId !== userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot log expenses to a trip you do not own.'
        });
      }
    }

    const expense = new Expense({
      userId,
      tripId: tripId || 'general',
      category: category || 'Other',
      description: description.trim(),
      amount: parsedAmount,
      currency: currency || 'USD',
      date: date || new Date().toISOString().split('T')[0]
    });

    await expense.save();

    // Increment spentBudget on associated trip
    if (tripId && tripId.match(/^[0-9a-fA-F]{24}$/)) {
      await Trip.findByIdAndUpdate(tripId, {
        $inc: { spentBudget: parsedAmount }
      });
    }

    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/expenses/:id
 * Deletes an expense. Enforces strict resource ownership.
 */
router.delete('/:id', requireAuth, mutationLimiter, async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid expense ID format.' });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'NotFound', message: 'Expense item not found.' });
    }

    // Resource ownership check
    if (expense.userId !== req.user.uid) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: You do not have permission to delete this expense.'
      });
    }

    // Decrement spentBudget if linked to a valid trip
    if (expense.tripId && expense.tripId.match(/^[0-9a-fA-F]{24}$/)) {
      await Trip.findByIdAndUpdate(expense.tripId, {
        $inc: { spentBudget: -expense.amount }
      });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Expense deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
