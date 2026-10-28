// DRY helper: route handlers can throw errors without repeating try/catch blocks.
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = asyncHandler;
