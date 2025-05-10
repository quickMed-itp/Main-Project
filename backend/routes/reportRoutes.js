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

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router; 
>>>>>>> 7006ab2d8cdafafb4ea3681983b8e0c550c7c7b6
