import rateLimit from 'express-rate-limit';

// General API rate limiter for protected and public endpoints
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please wait a few moments before trying again.'
  }
});

// Strict limiter for sensitive AI endpoints (expensive LLM operations)
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 AI generations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'AI request limit reached. You may submit up to 10 AI queries per minute.'
  }
});

// Stricter limiter for high-frequency resource mutations (trips, expenses creation)
export const mutationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60, // Limit each IP to 60 mutations per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many resource modifications. Please wait before creating more items.'
  }
});
