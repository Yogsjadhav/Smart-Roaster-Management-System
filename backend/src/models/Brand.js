const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: [true, 'Please provide brand name'],
    trim: true
  },
  brandCode: {
    type: String,
    required: [true, 'Please provide brand code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  assignedPod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pod',
    required: false
  },
  assignedEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  operatingCalendar: {
    type: String,
    enum: ['365-days', 'except-holidays', 'except-sundays-holidays', 'custom'],
    default: 'except-sundays-holidays'
  },
  publicHolidayPolicy: {
    type: String,
    enum: ['closed', 'open', 'skeleton-staff'],
    default: 'closed'
  },
  sundayPolicy: {
    type: String,
    enum: ['closed', 'open', 'skeleton-staff'],
    default: 'closed'
  },
  customOperatingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  minimumStaffingRequirement: {
    type: Number,
    default: 1,
    min: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
brandSchema.index({ brandCode: 1 });
brandSchema.index({ status: 1 });
brandSchema.index({ assignedPod: 1 });

module.exports = mongoose.model('Brand', brandSchema);
