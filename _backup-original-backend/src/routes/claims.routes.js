const express = require('express');
const claimsController = require('../controllers/claims.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.get('/my', claimsController.getMine);
router.post('/', claimsController.create);
router.patch('/:id/cancel', claimsController.cancel);

module.exports = router;
