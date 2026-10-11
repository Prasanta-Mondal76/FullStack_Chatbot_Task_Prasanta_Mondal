const { body, param, validationResult } = require('express-validator');
const { sanitizeString, normalizePhone } = require('../utils/sanitize');

const USER_TYPES = ['Student', 'Customer', 'Other'];
const STATUSES = ['New', 'Contacted', 'In Progress', 'Closed'];

/**
 * Strips HTML tags / trims every string field in the body and
 * normalizes the phone number BEFORE validation runs.
 */
function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of ['name', 'email', 'interest', 'message', 'userType', 'status']) {
      if (typeof req.body[key] === 'string') req.body[key] = sanitizeString(req.body[key]);
    }
    if (typeof req.body.phone === 'string') req.body.phone = normalizePhone(req.body.phone);
  }
  next();
}

const enquiryValidationRules = () => [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be 2–80 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 120 })
    .withMessage('Email cannot exceed 120 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid phone number — enter a valid 10-digit Indian mobile number'),
  body('userType')
    .notEmpty()
    .withMessage('User type is required')
    .isIn(USER_TYPES)
    .withMessage('User type must be Student, Customer or Other'),
  body('interest')
    .trim()
    .notEmpty()
    .withMessage('Service or course of interest is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Interest must be 2–120 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be 10–1000 characters'),
];

const statusValidationRules = () => [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(STATUSES)
    .withMessage('Status must be New, Contacted, In Progress or Closed'),
];

const idValidationRules = () => [
  param('id').isMongoId().withMessage('Invalid enquiry ID'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = {
  sanitizeBody,
  enquiryValidationRules,
  statusValidationRules,
  idValidationRules,
  handleValidationErrors,
};
