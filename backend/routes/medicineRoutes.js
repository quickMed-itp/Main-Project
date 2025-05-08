const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

// Get all medicines
router.get('/', medicineController.getAllMedicines);

// Get single medicine
router.get('/:id', medicineController.getMedicine);

// Create medicine
router.post('/', medicineController.createMedicine);

// Update medicine
router.put('/:id', medicineController.updateMedicine);

// Delete medicine
router.delete('/:id', medicineController.deleteMedicine);

module.exports = router; 