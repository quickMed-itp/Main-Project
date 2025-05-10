const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
  generateCustomerReport,
  generateOrderReport,
  generatePrescriptionReport,
  generateFeedbackReport,
  generateInventoryReport
} = require('../controllers/reportController');

// All routes are protected with both protect and isAdmin middleware
router.get('/customers', protect, isAdmin, generateCustomerReport);
router.get('/orders', protect, isAdmin, generateOrderReport);
router.get('/prescriptions', protect, isAdmin, generatePrescriptionReport);
router.get('/feedback', protect, isAdmin, generateFeedbackReport);
router.get('/inventory', protect, isAdmin, generateInventoryReport);

module.exports = router;