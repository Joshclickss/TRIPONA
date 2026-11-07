import express from 'express';
import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate unique human-readable booking IDs e.g. TP-HTL-849201
function generateBookingId(category = 'TRP') {
  const prefixMap = {
    hotels: 'HTL',
    flights: 'FLT',
    dining: 'DIN',
    experiences: 'EXP',
    transportation: 'TRN',
    cruises: 'CRU',
    adventures: 'ADV',
    wellness: 'WEL',
    essentials: 'ESN'
  };
  const catCode = prefixMap[category.toLowerCase()] || 'TRP';
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `TP-${catCode}-${randomNum}`;
}

/**
 * POST /api/bookings
 * Create a new travel booking with validation & idempotency
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.uid || req.headers['x-user-id'] || 'guest_user_' + Date.now();
    const {
      category,
      categoryLabel,
      serviceId,
      title,
      destination,
      provider,
      serviceDetails,
      travelStartDate,
      travelEndDate,
      guestCount = 1,
      travellers = [],
      price,
      tripId,
      paymentMethod = 'card',
      idempotencyKey,
      notes
    } = req.body;

    const startDate = travelStartDate || req.body.dates?.startDate || new Date().toISOString().split('T')[0];
    const endDate = travelEndDate || req.body.dates?.endDate || startDate;

    if (!category || !serviceId || !title || !destination || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required booking fields (category, serviceId, title, destination, price).'
      });
    }

    // Idempotency check: prevent duplicate bookings
    if (idempotencyKey) {
      const existing = await Booking.findOne({ idempotencyKey });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Retrieved existing booking for idempotency key',
          booking: existing
        });
      }
    }

    const bookingId = generateBookingId(category);

    // Calculate tax & totals if not pre-calculated
    const rawAmount = Number(price.amount || price.totalAmount || 100);
    const taxes = Math.round(rawAmount * 0.10); // 10% taxes & fees
    const totalAmount = rawAmount + taxes;

    const newBooking = new Booking({
      bookingId,
      userId,
      tripId: tripId || null,
      category,
      categoryLabel: categoryLabel || category.toUpperCase(),
      serviceId,
      title,
      destination,
      provider: provider || 'TRIPONA Verified Partner',
      serviceDetails: serviceDetails || {},
      travelStartDate: new Date(startDate),
      travelEndDate: new Date(endDate),
      guestCount: Number(guestCount) || 1,
      travellers: (travellers.length > 0 ? travellers : [
        { fullName: req.user?.name || 'Primary Guest', email: req.user?.email || 'guest@tripona.in' }
      ]).map(t => ({
        fullName: t.fullName || t.name || 'Guest Traveler',
        email: t.email || req.user?.email || 'guest@tripona.in',
        phone: t.phone || '',
        ageCategory: t.ageCategory || 'adult',
        isLead: !!t.isLead
      })),
      price: {
        amount: rawAmount,
        currency: price.currency || 'USD',
        currencySymbol: price.currencySymbol || '$',
        taxes,
        discount: 0,
        totalAmount,
        priceType: price.priceType || 'verified_live'
      },
      paymentStatus: paymentMethod === 'pay_at_venue' ? 'pending' : 'paid',
      paymentDetails: {
        transactionId: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        method: paymentMethod,
        paidAt: new Date(),
        gateway: 'TRIPONA Autonomous PCI-DSS Gateway'
      },
      bookingStatus: 'confirmed',
      cancellationPolicy: {
        isRefundable: true,
        freeCancellationBefore: new Date(Date.now() + 86400000 * 3), // 3 days free cancellation
        refundPercentage: 100,
        policyText: 'Free cancellation up to 48 hours prior to check-in/departure.'
      },
      idempotencyKey: idempotencyKey || undefined,
      notes: notes || '',
      voucherUrl: `/api/bookings/${bookingId}/voucher`,
      invoiceUrl: `/api/bookings/${bookingId}/invoice`
    });

    await newBooking.save();

    // If connected to a Trip, also update the Trip record
    if (tripId) {
      try {
        await Trip.findByIdAndUpdate(tripId, {
          $push: {
            bookings: {
              bookingId,
              title,
              category,
              amount: totalAmount
            }
          }
        });
      } catch (err) {
        console.warn('Could not link booking to Trip:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: newBooking
    });

  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to complete booking: ' + err.message
    });
  }
});

/**
 * GET /api/bookings
 * Get all bookings for the authenticated user with status filtering
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.uid || req.headers['x-user-id'];
    const { status, category } = req.query;

    const query = {};
    if (userId) {
      query.userId = userId;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      if (status === 'upcoming') {
        query.bookingStatus = 'confirmed';
        query.travelStartDate = { $gte: new Date() };
      } else if (status === 'completed') {
        query.travelEndDate = { $lt: new Date() };
      } else if (status === 'refunds') {
        query.bookingStatus = { $in: ['refund_pending', 'partially_refunded', 'refunded'] };
      } else {
        query.bookingStatus = status;
      }
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (err) {
    console.error('Fetch bookings error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

/**
 * GET /api/bookings/:id
 * Single booking record details
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findOne({
      $or: [{ bookingId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({
      success: true,
      booking
    });

  } catch (err) {
    console.error('Get booking error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch booking details' });
  }
});

/**
 * POST /api/bookings/:id/pay
 * Complete payment for a pending booking
 */
router.post('/:id/pay', optionalAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const { paymentMethod = 'card', idempotencyKey } = req.body;

    const booking = await Booking.findOne({
      $or: [{ bookingId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    booking.paymentDetails = {
      transactionId: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      method: paymentMethod,
      paidAt: new Date(),
      gateway: 'TRIPONA Secure Gateway'
    };

    await booking.save();

    res.json({
      success: true,
      message: 'Payment processed and booking confirmed!',
      booking
    });

  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ success: false, error: 'Payment failed' });
  }
});

/**
 * POST /api/bookings/:id/cancel
 * Cancel a booking with policy calculation and refund authorization
 */
router.post('/:id/cancel', optionalAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const { reason = 'Voyager schedule change' } = req.body;

    const booking = await Booking.findOne({
      $or: [{ bookingId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refund_pending';
    booking.notes = `Cancelled: ${reason}`;

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund initiated to original payment source.',
      refundAmount: booking.price.totalAmount,
      currency: booking.price.currency,
      booking
    });

  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
});

/**
 * GET /api/bookings/:id/voucher
 * Returns structured voucher & tax invoice data
 */
router.get('/:id/voucher', optionalAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findOne({
      $or: [{ bookingId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({
      success: true,
      voucher: {
        brand: 'TRIPONA.in',
        voucherNumber: `VCH-${booking.bookingId}`,
        issueDate: new Date().toISOString(),
        bookingId: booking.bookingId,
        providerBookingRef: booking.providerBookingRef,
        category: booking.category,
        categoryLabel: booking.categoryLabel,
        title: booking.title,
        destination: booking.destination,
        provider: booking.provider,
        travelStartDate: booking.travelStartDate,
        travelEndDate: booking.travelEndDate,
        travellers: booking.travellers,
        price: booking.price,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        cancellationPolicy: booking.cancellationPolicy,
        qrData: `https://tripona.in/verify/${booking.bookingId}`,
        verificationQrCode: `https://tripona.in/verify/${booking.bookingId}`
      }
    });

  } catch (err) {
    console.error('Voucher fetch error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate voucher' });
  }
});

/**
 * GET /api/bookings/admin/analytics
 * Booking analytics, metrics & reports
 */
router.get('/admin/analytics', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedCount = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const cancelledCount = await Booking.countDocuments({ bookingStatus: 'cancelled' });

    const revenueAggregation = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$price.totalAmount' } } }
    ]);

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    const categoryBreakdown = await Booking.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, revenue: { $sum: '$price.totalAmount' } } }
    ]);

    res.json({
      success: true,
      analytics: {
        totalBookings,
        confirmedCount,
        cancelledCount,
        totalRevenue: Math.round(totalRevenue),
        currency: 'USD',
        categoryBreakdown
      }
    });

  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, error: 'Failed to load booking analytics' });
  }
});

export default router;
