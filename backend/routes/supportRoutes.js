const express = require('express');
const supportController = require('../controllers/supportController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// Public route for contact form submissions
router.post('/contact', supportController.createTicket);

// Protect all routes after this middleware
router.use(protect);

// Restrict to admin only
router.use(restrictTo('admin'));

router
  .route('/')
  .get(supportController.getAllTickets)
  .post(supportController.createTicket);

router
  .route('/:id')
  .get(supportController.getTicket)
  .patch(supportController.updateTicket)
  .delete(supportController.deleteTicket);

router.patch('/:id/status', supportController.updateStatus);

module.exports = router; 