const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Admin only routes
router.get('/admin/all', authController.restrictTo('admin'), orderController.getAllOrders);

// User routes
router
  .route('/')
  .get(orderController.getUserOrders)
  .post(orderController.createOrder);

router
  .route('/:id')
  .get(orderController.getOrderById)
  .patch(orderController.updateOrder)
  .delete(authController.restrictTo('admin'), orderController.deleteOrder);

module.exports = router;