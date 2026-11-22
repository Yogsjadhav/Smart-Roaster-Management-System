const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
  processName: {
    type: String,
    required: [true, 'Please provide process name'],
    trim: true
  },
  processCode: {
    type: String,
    required: [true, 'Please provide process code'],
    uppercase: true,
    trim: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Please assign a brand to this process']
  },
  assignedEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  minimumStaffingRequirement: {
    type: Number,
    default: 1,
    min: 0
  },
  operatingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  holidayPolicy: {
    type: String,
    enum: ['closed', 'open', 'skeleton-staff'],
    default: 'closed'
  },
  sundayPolicy: {
    type: String,
    enum: ['closed', 'open', 'skeleton-staff'],
    default: 'closed'
  },
  shiftRequirements: {
    type: String,
    enum: ['morning', 'evening', 'night', 'flexible', '24x7'],
    default: 'flexible'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for brand and process code
processSchema.index({ brand: 1, processCode: 1 }, { unique: true });
processSchema.index({ isActive: 1 });

module.exports = mongoose.model('Process', processSchema);
