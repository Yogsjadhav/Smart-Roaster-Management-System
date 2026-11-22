const mongoose = require('mongoose');

const podSchema = new mongoose.Schema({
  podName: {
    type: String,
    required: [true, 'Please provide pod name'],
    unique: true,
    trim: true
  },
  podLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  assignedBrands: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  }],
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
podSchema.index({ podName: 1 });
podSchema.index({ isActive: 1 });

module.exports = mongoose.model('Pod', podSchema);
