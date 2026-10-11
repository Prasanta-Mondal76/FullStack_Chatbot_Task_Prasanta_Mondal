const crypto = require('crypto');

// Simple shared-secret auth for the admin endpoints.
//
// The public contact form and chatbot (POST /api/enquiries) stay open —
// anyone may submit an enquiry. But reading, updating or deleting
// enquiries (the admin dashboard) requires the secret admin key, sent
// in the `x-admin-key` request header. The key lives only in the
// server's .env file, never in the code or the browser bundle.
//
// Two hardening details:
// - The key is compared in constant time (via SHA-256 + timingSafeEqual)
//   so response timing can't leak anything about the secret.
// - A rate limiter (see adminRateLimit.js) caps failed attempts per IP,
//   which makes brute-forcing the key infeasible.
function safeEqual(a, b) {
  // Hash both sides first so the comparison itself can't leak the
  // secret's length through timing, then compare in constant time.
  const ha = crypto.createHash('sha256').update(a, 'utf8').digest();
  const hb = crypto.createHash('sha256').update(b, 'utf8').digest();
  return crypto.timingSafeEqual(ha, hb);
}

function adminAuth(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;

  if (!expected) {
    return res.status(500).json({
      success: false,
      message: 'Server is not configured for admin access. Please set ADMIN_API_KEY.',
    });
  }

  const provided = req.headers['x-admin-key'];
  if (typeof provided !== 'string' || !safeEqual(provided, expected)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. A valid admin key is required.',
    });
  }

  next();
}

module.exports = adminAuth;
