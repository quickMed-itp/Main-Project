const express = require('express');
const supportController = require('../controllers/supportController');
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes

router
  .route('/:id')
  .get(supportController.getTicket)
  .patch(supportController.updateTicket)
  .delete(supportController.deleteTicket);

<<<<<<< Updated upstream
router.patch('/:id/status', supportController.updateStatus);
=======
router
  .route('/:id/status')
  .patch(supportController.updateTicketStatus);
>>>>>>> Stashed changes

module.exports = router; 