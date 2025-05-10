const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedback);
router.get('/product/:productId', feedbackController.getProductFeedback);

// Admin protected routes
router.use(authController.protect);
router.use(authController.restrictTo('admin'));
router.delete('/:id', feedbackController.deleteFeedback);
router.patch('/:id', feedbackController.updateFeedback);
router.patch('/:id/approve', feedbackController.approveFeedback);
router.patch('/:id/reject', feedbackController.rejectFeedback);

module.exports = router;