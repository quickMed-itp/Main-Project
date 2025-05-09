const User = require('../models/User');
const AppError = require('../utils/appError');

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get single user
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    // Don't allow password updates through this route
    if (req.body.password) {
      return next(new AppError('This route is not for password updates. Please use /updatePassword', 400));
    }

    // Filter out unwanted fields
    const filteredBody = filterObj(req.body, 'name', 'email', 'phone', 'age', 'address');
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    next(err);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'pharmacy', 'doctor', 'admin'].includes(role)) {
      return next(new AppError('Invalid role specified', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update user status (admin only)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'blocked'].includes(status)) {
      return next(new AppError('Invalid status specified', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get current user's addresses
exports.getMyAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    
    const fetchedAddresses = (user.addresses || []).map((addr, idx) => {
      // Try to use existing fields, or fallback to parsing the address string if needed
      return {
        id: addr._id || idx.toString(),
        label: addr.label || `Address ${idx + 1}`,
        address: addr.address || ''
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        addresses: fetchedAddresses
      }
    });
  } catch (err) {
    next(err);
  }
};

// Add new address for current user
exports.addAddress = async (req, res, next) => {
  try {
    const { label, address } = req.body;

    if (!label || !address) {
      return next(new AppError('Label and address are required', 400));
    }

    const user = await User.findById(req.user._id);
    
    

    // Add the new address
    user.addresses.push({
      label,
      address,
      isDefault: false
    });

    await user.save();

    res.status(201).json({
      status: 'success',
      data: {
        addresses: user.addresses
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update an address
exports.updateAddress = async (req, res, next) => {
  try {
    const { label, address, isDefault } = req.body;
    const addressId = req.params.addressId;

    if (!label || !address) {
      return next(new AppError('Label and address are required', 400));
    }

    const user = await User.findById(req.user._id);
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

    if (addressIndex === -1) {
      return next(new AppError('Address not found', 404));
    }

    // If setting as default, unset any existing default
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update the address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      label,
      address,
      isDefault: isDefault || user.addresses[addressIndex].isDefault
    };

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        addresses: user.addresses
      }
    });
  } catch (err) {
    next(err);
  }
};

// Delete an address
exports.deleteAddress = async (req, res, next) => {
  try {
    const addressId = req.params.addressId;
    const user = await User.findById(req.user._id);
    
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

    if (addressIndex === -1) {
      return next(new AppError('Address not found', 404));
    }

    const wasDefault = user.addresses[addressIndex].isDefault;

    // Remove the address
    user.addresses.splice(addressIndex, 1);

    // If we deleted the default address and there are other addresses,
    // set the first remaining address as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        addresses: user.addresses
      }
    });
  } catch (err) {
    next(err);
  }
};

// Set default address
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const addressId = req.params.addressId;
    const user = await User.findById(req.user._id);
    
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

    if (addressIndex === -1) {
      return next(new AppError('Address not found', 404));
    }

    // Unset any existing default
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set the new default
    user.addresses[addressIndex].isDefault = true;

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        addresses: user.addresses
      }
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to filter object
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}; 