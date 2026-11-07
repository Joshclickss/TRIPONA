import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, default: '' },
  photoURL: { type: String, default: '' },
  country: { type: String, default: 'Global Voyager' },
  currency: { type: String, default: 'USD ($)' },
  travelPreferences: [{ type: String }],
  savedDestinations: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
