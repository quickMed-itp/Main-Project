const Prescription = require('../models/Prescription');
const fs = require('fs').promises;
const path = require('path');

// Helper function to delete file
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error('Error deleting file:', err);
  }
};

exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload a file'
      });
    }

    if (!req.body.patientName || !req.body.patientAge) {
      // Delete uploaded file if validation fails
      await deleteFile(req.file.path);
      return res.status(400).json({
        status: 'fail',
        message: 'Patient name and age are required'
      });
    }
    
    const prescription = await Prescription.create({
      userId: req.user._id,
      patientName: req.body.patientName,
      patientAge: req.body.patientAge,
      filePath: req.file.path,
      notes: req.body.notes
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        prescription
      }
    });
  } catch (err) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getUserPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .sort('-createdAt');
    
    // Add file URL to each prescription
    const prescriptionsWithUrls = prescriptions.map(prescription => {
      const prescriptionObj = prescription.toObject();
      prescriptionObj.fileUrl = `/uploads/prescriptions/${path.basename(prescription.filePath)}`;
      return prescriptionObj;
    });
    
    res.status(200).json({
      status: 'success',
      results: prescriptions.length,
      data: {
        prescriptions: prescriptionsWithUrls
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({
        status: 'fail',
        message: 'Prescription not found'
      });
    }

    const prescriptionObj = prescription.toObject();
    prescriptionObj.fileUrl = `/uploads/prescriptions/${path.basename(prescription.filePath)}`;

    res.status(200).json({
      status: 'success',
      data: {
        prescription: prescriptionObj
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!prescription) {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(404).json({
        status: 'fail',
        message: 'Prescription not found'
      });
    }

    // Update fields
    if (req.body.patientName) prescription.patientName = req.body.patientName;
    if (req.body.patientAge) prescription.patientAge = req.body.patientAge;
    if (req.body.notes) prescription.notes = req.body.notes;
    if (req.body.status) prescription.status = req.body.status;

    // Handle file upload if new file is provided
    if (req.file) {
      // Delete old file
      await deleteFile(prescription.filePath);
      prescription.filePath = req.file.path;
    }

    await prescription.save();

    const prescriptionObj = prescription.toObject();
    prescriptionObj.fileUrl = `/uploads/prescriptions/${path.basename(prescription.filePath)}`;

    res.status(200).json({
      status: 'success',
      data: {
        prescription: prescriptionObj
      }
    });
  } catch (err) {
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({
        status: 'fail',
        message: 'Prescription not found'
      });
    }

    // Delete the file
    await deleteFile(prescription.filePath);

    await prescription.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Admin/Pharmacy methods
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        status: 'fail',
        message: 'Prescription not found'
      });
    }

    if (!['approved', 'rejected'].includes(req.body.status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status. Must be either approved or rejected'
      });
    }

    prescription.status = req.body.status;
    if (req.body.notes) prescription.notes = req.body.notes;

    await prescription.save();

    const prescriptionObj = prescription.toObject();
    prescriptionObj.fileUrl = `/uploads/prescriptions/${path.basename(prescription.filePath)}`;

    res.status(200).json({
      status: 'success',
      data: {
        prescription: prescriptionObj
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};