/**
 * Input sanitization helpers.
 * - Strips HTML tags from user-supplied strings (prevents stored XSS payloads).
 * - Removes null bytes and trims whitespace.
 * - Normalizes Indian phone numbers to a clean 10-digit format.
 */

function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/\0/g, '')
    .trim();
}

function normalizePhone(value) {
  if (typeof value !== 'string') return '';
  let digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

module.exports = { sanitizeString, normalizePhone };
