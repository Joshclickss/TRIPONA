import mongoose from 'mongoose';

const savedDestinationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  destinationId: { type: String, required: true },
  destinationSlug: { type: String },
  destinationName: { type: String },
  savedAt: { type: Date, default: Date.now }
});

savedDestinationSchema.index({ userId: 1, destinationId: 1 }, { unique: true });

export default mongoose.models.SavedDestination || mongoose.model('SavedDestination', savedDestinationSchema);
