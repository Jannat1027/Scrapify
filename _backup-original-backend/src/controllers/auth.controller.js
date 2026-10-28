const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, message: 'Account created.', data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, message: 'Login successful.', data: result });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: authService.safeUser(req.user) } });
});

module.exports = { register, login, me };
