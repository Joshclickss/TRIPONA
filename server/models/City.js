import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  cityId: { 
    type: String, 
    unique: true, 
    required: true,
    index: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  cityAscii: { 
    type: String, 
    required: true, 
    index: true 
  },
  lat: { 
    type: Number, 
    required: true 
  },
  lng: { 
    type: Number, 
    required: true 
  },
  country: { 
    type: String, 
    required: true, 
    index: true 
  },
  iso2: { 
    type: String, 
    index: true 
  },
  iso3: { 
    type: String 
  },
  adminName: { 
    type: String 
  },
  capital: { 
    type: String 
  },
  population: { 
    type: Number, 
    index: -1,
    default: 0 
  }
});

// Compound indexes for lightning-fast autocomplete & geographical queries
citySchema.index({ cityAscii: 1, country: 1 });
citySchema.index({ cityAscii: 1, population: -1 });
citySchema.index({ country: 1, population: -1 });

export default mongoose.models.City || mongoose.model('City', citySchema);
