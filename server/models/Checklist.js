import mongoose from 'mongoose';

const checklistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  tripId: { type: String },
  type: { type: String, enum: ['travel', 'packing'], default: 'travel' },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  category: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Checklist || mongoose.model('Checklist', checklistSchema);
