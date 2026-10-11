// Rate limiting for the admin endpoints.
//
// The admin key is a single shared secret, so the only realistic attack on
// it is brute-forcing the `x-admin-key` header. This limiter caps how many
// *failed* attempts one IP can make per 15-minute window, which makes
// guessing the key infeasible — while successful admin requests never count
// against the budget, so normal dashboard use is unaffected.
const { rateLimit } = require('express-rate-limit');

const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // max 100 failed admin attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  // Only count failed requests (4xx/5xx). A correct key never consumes
  // the budget, so legitimate dashboard use can't trip the limiter.
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many failed admin attempts. Please try again later.',
    });
  },
});

module.exports = adminRateLimit;
