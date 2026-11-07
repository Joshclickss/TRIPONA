import mongoose from 'mongoose';

const travellerSchema = new mongoose.Schema({
  title: { type: String, default: 'Mr' },
  fullName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  age: { type: Number },
  passportNumber: { type: String },
  seatPreference: { type: String },
  dietaryPreference: { type: String },
  specialRequests: { type: String }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null
  },
  category: {
    type: String,
    required: true,
    enum: [
      'hotels',
      'flights',
      'dining',
      'experiences',
      'transportation',
      'cruises',
      'adventures',
      'wellness',
      'essentials'
    ],
    index: true
  },
  categoryLabel: {
    type: String,
    default: 'TRAVEL SERVICE'
  },
  serviceId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true,
    index: true
  },
  provider: {
    type: String,
    default: 'TRIPONA Verified Partner'
  },
  providerBookingRef: {
    type: String,
    default: function() {
      return 'PRV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    }
  },
  serviceDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  travelStartDate: {
    type: Date,
    required: true
  },
  travelEndDate: {
    type: Date
  },
  guestCount: {
    type: Number,
    default: 1
  },
  travellers: [travellerSchema],
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    currencySymbol: { type: String, default: '$' },
    taxes: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    priceType: {
      type: String,
      enum: ['estimated', 'verified_live', 'partner_referral'],
      default: 'verified_live'
    }
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'paid', 'refund_pending', 'refunded', 'partially_refunded', 'failed'],
    default: 'paid',
    index: true
  },
  paymentDetails: {
    transactionId: { type: String },
    method: { type: String, default: 'card' },
    paidAt: { type: Date, default: Date.now },
    gateway: { type: String, default: 'TRIPONA Secure Gateway' }
  },
  bookingStatus: {
    type: String,
    enum: [
      'draft',
      'pending',
      'payment_pending',
      'processing',
      'confirmed',
      'failed',
      'cancelled',
      'refund_pending',
      'partially_refunded',
      'refunded',
      'completed'
    ],
    default: 'confirmed',
    index: true
  },
  cancellationPolicy: {
    isRefundable: { type: Boolean, default: true },
    freeCancellationBefore: { type: Date },
    refundPercentage: { type: Number, default: 100 },
    policyText: {
      type: String,
      default: 'Free cancellation up to 48 hours prior to departure/check-in.'
    }
  },
  idempotencyKey: {
    type: String,
    sparse: true,
    unique: true
  },
  voucherUrl: { type: String },
  invoiceUrl: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Booking', bookingSchema);
