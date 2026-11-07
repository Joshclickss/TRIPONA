import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  tripId: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Accommodation', 'Flights', 'Local Transport', 'Food', 'Activities', 'Shopping', 'Other'],
    default: 'Food'
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
