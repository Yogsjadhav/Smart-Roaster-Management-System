const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Please provide employee full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide employee email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  operationalPod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pod',
    required: false
  },
  isPodLead: {
    type: Boolean,
    default: false
  },
  joiningDate: {
    type: Date,
    required: true
  },
  employmentStatus: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  assignedBrands: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  }],
  assignedProcesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Process'
  }],
  weeklyOffPreferences: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  availability: {
    type: Map,
    of: Boolean,
    default: {}
  },
  maxWorkingDaysPerMonth: {
    type: Number,
    default: 26
  },
  shiftPreferences: {
    type: String,
    enum: ['morning', 'evening', 'night', 'flexible'],
    default: 'flexible'
  }
}, {
  timestamps: true
});

// Index for faster queries
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ operationalPod: 1 });
employeeSchema.index({ employmentStatus: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
