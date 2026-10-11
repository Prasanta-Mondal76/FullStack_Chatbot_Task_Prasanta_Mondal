/**
 * Centralized error handling.
 * - Technical details (stack traces, driver errors) are logged on the
 *   server only and NEVER sent to the client.
 * - Clients always receive a safe, generic message for 500-level failures.
 */

function notFound(req, res, _next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  // Server-side log only — never exposed to end users.
  console.error(`[${new Date().toISOString()}]`, err);

  const status = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  if (status === 500) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong on the server. Please try again later.',
    });
  }

  res.status(status).json({
    success: false,
    message: err.message || 'Request failed',
  });
}

module.exports = { notFound, errorHandler };
