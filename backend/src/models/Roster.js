const mongoose = require('mongoose');

const rosterSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  pods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pod'
  }],
  brands: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date
  },
  totalConflicts: {
    type: Number,
    default: 0
  },
  isValid: {
    type: Boolean,
    default: false
  },
  metadata: {
    totalDays: Number,
    totalAssignments: Number,
    coveragePercentage: Number
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate rosters
rosterSchema.index({ month: 1, year: 1, status: 1 });

module.exports = mongoose.model('Roster', rosterSchema);
