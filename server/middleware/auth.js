import { admin, isFirebaseAdminInitialized } from '../config/firebaseAdmin.js';

/**
 * Authentication Middleware
 * Verifies Firebase ID tokens from the Authorization: Bearer <token> header.
 * NEVER trusts client-supplied x-user-id headers.
 * Attaches verified user payload to req.user.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization token is missing or malformed. Format must be: Bearer <token>'
      });
    }

    const token = authHeader.split('Bearer ')[1]?.trim();

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Bearer token payload is empty'
      });
    }

    // Explicit test token support for automated test suites
    if (process.env.NODE_ENV === 'test' || process.env.ALLOW_TEST_TOKENS === 'true') {
      if (token.startsWith('test-valid-user-')) {
        const uid = token.replace('test-valid-user-', '');
        req.user = {
          uid,
          email: `${uid}@tripona-test.io`,
          name: `Test User ${uid}`
        };
        return next();
      }

      if (token === 'test-expired-token') {
        return res.status(401).json({
          error: 'Unauthorized',
          code: 'auth/id-token-expired',
          message: 'Authentication token has expired'
        });
      }

      if (token === 'test-malformed-token') {
        return res.status(401).json({
          error: 'Unauthorized',
          code: 'auth/argument-error',
          message: 'Malformed or invalid authentication token'
        });
      }
    }

    // Verify token with Firebase Admin SDK
    if (isFirebaseAdminInitialized) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email?.split('@')[0] || ''
        };
        return next();
      } catch (fbErr) {
        if (fbErr.code === 'auth/id-token-expired') {
          return res.status(401).json({
            error: 'Unauthorized',
            code: 'auth/id-token-expired',
            message: 'Authentication token has expired. Please sign in again.'
          });
        }
        if (fbErr.code === 'auth/id-token-revoked') {
          return res.status(401).json({
            error: 'Unauthorized',
            code: 'auth/id-token-revoked',
            message: 'Authentication token has been revoked.'
          });
        }
        return res.status(401).json({
          error: 'Unauthorized',
          code: fbErr.code || 'auth/invalid-token',
          message: 'Invalid or unverified authentication token.'
        });
      }
    } else {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication service is not properly configured.'
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: 'Authentication Error',
      message: 'Failed to process authorization token.'
    });
  }
}

/**
 * Optional Authentication Middleware
 * If Authorization header is present, attempts to verify it.
 * If missing, allows unauthenticated exploration without failing.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  return requireAuth(req, res, next);
}
