import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Middlewares
import { generalLimiter, aiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import aiRoutes from './routes/ai.js';
import tripsRoutes from './routes/trips.js';
import expensesRoutes from './routes/expenses.js';
import integrationsRoutes from './routes/integrations.js';
import destinationsRoutes from './routes/destinations.js';
import usersRoutes from './routes/users.js';
import savedDestinationsRoutes from './routes/savedDestinations.js';
import checklistsRoutes from './routes/checklists.js';
import servicesRoutes from './routes/services.js';
import bookingsRoutes from './routes/bookings.js';

import { seedDestinations } from './scripts/seedDestinations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5088;

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration - Restrict to allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5088',
  'http://127.0.0.1:5088',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser agents (curl, postman, server-to-server)
    if (!origin) return callback(null, true);
    
    // Check against allowed origins or allow during local dev
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.startsWith('http://localhost:') || 
                      origin.startsWith('http://127.0.0.1:');
                      
    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not permitted by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '1mb' }));

// Apply general rate limiting to all /api endpoints
app.use('/api', generalLimiter);

// Public / Exploration API Routes
app.use('/api/destinations', destinationsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/services', servicesRoutes);

// Protected & User Specific Routes (authenticated with token verification)
app.use('/api/users', usersRoutes);
app.use('/api/saved-destinations', savedDestinationsRoutes);
app.use('/api/checklists', checklistsRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/bookings', bookingsRoutes);

// AI Routes with dedicated AI rate limiter
app.use('/api/ai', aiLimiter, aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'TRIPONA – Explore Beyond Boundaries',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    security: {
      authMode: 'Firebase Admin Bearer Verification',
      rateLimiter: 'Active',
      cors: 'Restricted'
    }
  });
});

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tripona';
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('🍃 Real MongoDB connected successfully at ' + MONGODB_URI);
    await seedDestinations();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// Bind server in standalone/local environments (avoid port binding on Vercel Serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🔒 TRIPONA Secure Server running on http://localhost:${PORT}`);
  });
}

export default app;
