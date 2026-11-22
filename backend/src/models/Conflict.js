const mongoose = require('mongoose');

const conflictSchema = new mongoose.Schema({
  roster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roster',
    required: true
  },
  conflictType: {
    type: String,
    enum: [
      'insufficient-staffing',
      'no-employee-available',
      'overlapping-assignment',
      'invalid-assignment',
      'violated-availability',
      'leave-coverage-gap',
      'weeklyoff-coverage-gap',
      'conflicting-rules'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'high'
  },
  date: {
    type: Date,
    required: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  process: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Process',
    required: true
  },
  requiredEmployees: {
    type: Number,
    default: 0
  },
  availableEmployees: {
    type: Number,
    default: 0
  },
  affectedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  explanation: {
    type: String,
    required: true
  },
  possibleResolution: {
    type: String
  },
  backupEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  status: {
    type: String,
    enum: ['open', 'resolved', 'acknowledged'],
    default: 'open'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
conflictSchema.index({ roster: 1, status: 1 });
conflictSchema.index({ date: 1, brand: 1, process: 1 });

module.exports = mongoose.model('Conflict', conflictSchema);
