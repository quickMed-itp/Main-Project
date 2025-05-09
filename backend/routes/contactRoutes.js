const express = require('express');
const router = express.Router();
const { submitContact, getAllContacts } = require('../controllers/contactController');
const { protect, restrictTo } = require('../middleware/auth');

// Public route for submitting contact form
router.post('/submit', submitContact);

// Protected route for getting all contacts (admin only)
router.get('/all', protect, restrictTo('admin'), getAllContacts);

module.exports = router;