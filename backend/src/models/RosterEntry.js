const mongoose = require('mongoose');

const rosterEntrySchema = new mongoose.Schema({
  roster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roster',
    required: true
  },
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
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['working', 'weekly-off', 'public-holiday', 'approved-leave', 'comp-off', 'not-required'],
    default: 'working'
  },
  shift: {
    type: String,
    enum: ['morning', 'evening', 'night', 'flexible'],
    default: 'flexible'
  },
  isManualOverride: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
rosterEntrySchema.index({ roster: 1, date: 1 });
rosterEntrySchema.index({ employee: 1, date: 1 });
rosterEntrySchema.index({ brand: 1, process: 1, date: 1 });

module.exports = mongoose.model('RosterEntry', rosterEntrySchema);
