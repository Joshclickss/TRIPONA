import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  country: { type: String, required: true },
  continent: { type: String, required: true },
  tagline: { type: String },
  image: { type: String, required: true },
  secondaryImage: { type: String },
  estimatedBudget: {
    budget: { type: String },
    standard: { type: String },
    premium: { type: String },
    luxury: { type: String }
  },
  currency: { type: String },
  bestSeason: { type: String },
  weather: { type: String },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 0 },
  travelStyle: [{ type: String }],
  isTopInternational: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isHiddenGem: { type: Boolean, default: false },
  overview: { type: String, required: true },
  attractions: [{
    name: { type: String },
    desc: { type: String }
  }],
  localCulture: { type: String },
  foodRecommendations: [{ type: String }],
  travelTips: [{ type: String }],
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

destinationSchema.index({ name: 'text', country: 'text', overview: 'text' });

export default mongoose.models.Destination || mongoose.model('Destination', destinationSchema);
