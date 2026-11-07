import mongoose from 'mongoose';

const dayActivitySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  summary: { type: String },
  morning: {
    activity: String,
    transport: String,
    time: String
  },
  afternoon: {
    activity: String,
    food: String,
    time: String
  },
  evening: {
    activity: String,
    food: String,
    time: String
  },
  dailyEstimatedBudget: String,
  tips: String
});

const tripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  destination: { type: String, required: true },
  destinationId: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'completed', 'draft'], default: 'upcoming' },
  travelStyle: { type: String, default: 'smart-ai' },
  travellers: { type: Number, default: 2 },
  totalBudget: { type: Number, default: 3500 },
  spentBudget: { type: Number, default: 0 },
  coverImage: { type: String },
  daysCount: { type: Number, default: 7 },
  isPublic: { type: Boolean, default: true },
  shareToken: { type: String, unique: true },
  days: [dayActivitySchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Trip || mongoose.model('Trip', tripSchema);
