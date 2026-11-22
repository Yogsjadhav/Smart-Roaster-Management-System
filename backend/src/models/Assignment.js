const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
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
  isActive: {
    type: Boolean,
    default: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  workingRules: {
    maxDaysPerWeek: {
      type: Number,
      default: 6
    },
    preferredWeeklyOffs: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }]
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate assignments
assignmentSchema.index({ employee: 1, brand: 1, process: 1 }, { unique: true });
assignmentSchema.index({ brand: 1, process: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
