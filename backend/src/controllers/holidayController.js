const PublicHoliday = require('../models/PublicHoliday');
const ActivityLog = require('../models/ActivityLog');

exports.getHolidays = async (req, res) => {
  try {
    const { year, month } = req.query;
    let query = { isActive: true };
    
    if (year) query.year = parseInt(year);
    if (month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const holidays = await PublicHoliday.find(query).sort('date');

    res.status(200).json({ success: true, count: holidays.length, data: holidays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createHoliday = async (req, res) => {
  try {
    const holiday = await PublicHoliday.create(req.body);

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      entityType: 'holiday',
      entityId: holiday._id,
      details: `Created holiday: ${holiday.name}`
    });

    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const holiday = await PublicHoliday.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    res.status(200).json({ success: true, data: holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const holiday = await PublicHoliday.findByIdAndDelete(req.params.id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
