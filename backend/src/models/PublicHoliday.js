const mongoose = require('mongoose');

const publicHolidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide holiday name'],
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
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
publicHolidaySchema.index({ date: 1 });
publicHolidaySchema.index({ year: 1 });

module.exports = mongoose.model('PublicHoliday', publicHolidaySchema);
