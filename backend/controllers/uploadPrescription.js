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

// Helper function to delete multiple files
const deleteFiles = async (filePaths) => {
  if (!filePaths) return;
  const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
  await Promise.all(paths.map(path => deleteFile(path)));
};

exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload at least one file'
      });
    }

    if (!req.body.patientName || !req.body.patientAge) {
      // Delete uploaded files if validation fails
      await deleteFiles(req.files.map(file => file.path));
      return res.status(400).json({
        status: 'fail',
        message: 'Patient name and age are required'
      });
    }
    
    const prescription = await Prescription.create({
      userId: req.user._id,
      patientName: req.body.patientName,
      patientAge: req.body.patientAge,

      filePaths: [req.file.path],

      filePaths: req.files.map(file => file.path),

      notes: req.body.notes
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        prescription
      }
    });
  } catch (err) {
    // Delete uploaded files if database operation fails
    if (req.files) {
      await deleteFiles(req.files.map(file => file.path));
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
    
    // Add file URLs to each prescription
    const prescriptionsWithUrls = prescriptions.map(prescription => {
      const prescriptionObj = prescription.toObject();
      prescriptionObj.fileUrls = prescription.filePaths.map(filePath => 
        `/uploads/prescriptions/${path.basename(filePath)}`
      );
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
    console.error('Error fetching prescriptions:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Error fetching prescriptions'
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
    prescriptionObj.fileUrls = prescription.filePaths.map(filePath => 
      `/uploads/prescriptions/${path.basename(filePath)}`
    );

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
      if (req.files) {
        await deleteFiles(req.files.map(file => file.path));
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
      // Delete old files
      for (const filePath of prescription.filePaths) {
        await deleteFile(filePath);
      }
      prescription.filePaths = [req.file.path];
    }
    // Handle file upload if new files are provided
    else if (req.files && req.files.length > 0) {
      // Delete old files
      await deleteFiles(prescription.filePaths);
      prescription.filePaths = req.files.map(file => file.path);
    }

    await prescription.save();

    const prescriptionObj = prescription.toObject();
    prescriptionObj.fileUrls = prescription.filePaths.map(filePath => 
      `/uploads/prescriptions/${path.basename(filePath)}`
    );

    res.status(200).json({
      status: 'success',
      data: {
        prescription: prescriptionObj
      }
    });
  } catch (err) {
    if (req.files) {
      await deleteFiles(req.files.map(file => file.path));
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

    // Delete all files

    for (const filePath of prescription.filePaths) {
      await deleteFile(filePath);
    }

    await deleteFiles(prescription.filePaths);


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
    prescriptionObj.fileUrls = prescription.filePaths.map(filePath => 
      `/uploads/prescriptions/${path.basename(filePath)}`
    );

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