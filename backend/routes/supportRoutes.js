const express = require('express');
const supportController = require('../controllers/supportController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public route for creating support tickets
router.post('/contact', supportController.createTicket);

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Admin routes
router
  .route('/')
  .get(supportController.getAllTickets);

router
  .route('/:id')
  .get(supportController.getTicket)
  .patch(supportController.updateTicket)
  .delete(supportController.deleteTicket);

router
  .route('/:id/status')
  .patch(supportController.updateStatus);

module.exports = router; 