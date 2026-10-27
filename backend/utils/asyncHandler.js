// utils/asyncHandler.js: wraps async controllers so thrown errors reach the error handler.
// DRY: controllers stay clean without try/catch everywhere.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
