const express = require('express');
const listingsController = require('../controllers/listings.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.get('/', listingsController.browse);
router.get('/:id', listingsController.getById);
router.post('/', protect, listingsController.create);

module.exports = router;
