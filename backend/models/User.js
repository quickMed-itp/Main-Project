const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Age must be a whole number'
    }
  },
  addresses: [{
    label: {
      type: String,
      required: [true, 'Address label is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  role: {
    type: String,
    enum: ['user', 'pharmacy', 'doctor', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  },
  doctorId: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  pharmacyRegNumber: {
    type: String,
    required: function() { return this.role === 'pharmacy'; }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);