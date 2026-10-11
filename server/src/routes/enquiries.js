const express = require('express');
const Enquiry = require('../models/Enquiry');
const adminAuth = require('../middleware/adminAuth');
const adminRateLimit = require('../middleware/adminRateLimit');
const {
  sanitizeBody,
  enquiryValidationRules,
  statusValidationRules,
  idValidationRules,
  handleValidationErrors,
} = require('../middleware/validate');

const router = express.Router();

// Escape user input used inside a RegExp (search) — prevents ReDoS / injection.
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/enquiries — list (admin only; supports ?search=, ?userType=, ?status=)
router.get('/', adminRateLimit, adminAuth, async (req, res, next) => {
  try {
    const { search, userType, status } = req.query;
    const filter = {};
    if (userType && ['Student', 'Customer', 'Other'].includes(userType)) filter.userType = userType;
    if (status && ['New', 'Contacted', 'In Progress', 'Closed'].includes(status)) filter.status = status;
    if (search && typeof search === 'string' && search.trim()) {
      const rx = new RegExp(escapeRegExp(search.trim()), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { interest: rx }, { message: rx }];
    }
    const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) {
    next(err);
  }
});

// GET /api/enquiries/:id — single enquiry (admin only)
router.get('/:id', adminRateLimit, adminAuth, idValidationRules(), handleValidationErrors, async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
});

// POST /api/enquiries — create enquiry
router.post(
  '/',
  sanitizeBody,
  enquiryValidationRules(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const enquiry = await Enquiry.create(req.body);
      res.status(201).json({ success: true, message: 'Enquiry submitted successfully', data: enquiry });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/enquiries/:id — full update (admin only)
router.put(
  '/:id',
  adminRateLimit,
  adminAuth,
  sanitizeBody,
  idValidationRules(),
  enquiryValidationRules(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: 'after',
        runValidators: true,
      });
      if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
      res.json({ success: true, message: 'Enquiry updated successfully', data: enquiry });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/enquiries/:id — status update (admin only)
router.patch(
  '/:id',
  adminRateLimit,
  adminAuth,
  sanitizeBody,
  idValidationRules(),
  statusValidationRules(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const enquiry = await Enquiry.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { returnDocument: 'after' }
      );
      if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
      res.json({ success: true, message: 'Enquiry status updated', data: enquiry });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/enquiries/:id — delete enquiry (admin only)
router.delete('/:id', adminRateLimit, adminAuth, idValidationRules(), handleValidationErrors, async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
