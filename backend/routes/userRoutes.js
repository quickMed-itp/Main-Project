const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes for current user's addresses
router.use('/me/addresses', authController.protect);
router
  .route('/me/addresses')
  .get(userController.getMyAddresses)
  .post(userController.addAddress);

router
  .route('/me/addresses/:addressId')
  .patch(userController.updateAddress)
  .delete(userController.deleteAddress);

router
  .route('/me/addresses/:addressId/default')
  .patch(userController.setDefaultAddress);

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict to admin only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router
  .route('/:id/role')
  .patch(userController.updateUserRole);

router
  .route('/:id/status')
  .patch(userController.updateUserStatus);

module.exports = router; 