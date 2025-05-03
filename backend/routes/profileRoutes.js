const express = require('express');
const profileController = require('../controllers/profileController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(profileController.getProfile)
  .patch(profileController.updateProfile);

router.get('/orders', profileController.getUserOrders);

module.exports = router;