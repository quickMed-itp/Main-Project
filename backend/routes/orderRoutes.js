const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin routes
router.get('/admin/all', restrictTo('admin'), orderController.getAllOrders);
router.get('/admin/:id', restrictTo('admin'), orderController.getOrderById);
router.patch('/admin/:id', restrictTo('admin'), orderController.updateOrder);
router.delete('/admin/:id', restrictTo('admin'), orderController.deleteOrder);

// User routes
router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;