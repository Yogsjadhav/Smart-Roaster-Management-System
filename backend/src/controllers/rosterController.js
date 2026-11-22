const Roster = require('../models/Roster');
const RosterEntry = require('../models/RosterEntry');
const Conflict = require('../models/Conflict');
const ActivityLog = require('../models/ActivityLog');
const SchedulingEngine = require('../services/schedulingEngine');
const { format } = require('date-fns');

const saveScheduleResult = async (roster, result) => {
  await RosterEntry.deleteMany({ roster: roster._id });
  await Conflict.deleteMany({ roster: roster._id });

  const entries = result.schedule.map(entry => ({ ...entry, roster: roster._id }));
  if (entries.length > 0) await RosterEntry.insertMany(entries);

  const conflicts = result.conflicts.map(conflict => ({ ...conflict, roster: roster._id }));
  if (conflicts.length > 0) await Conflict.insertMany(conflicts);

  roster.totalConflicts = conflicts.length;
  roster.isValid = result.isValid;
  roster.metadata = {
    ...roster.metadata?.toObject?.(),
    totalDays: result.schedule.length > 0
      ? new Set(result.schedule.map(entry => format(entry.date, 'yyyy-MM-dd'))).size
      : 0,
    totalAssignments: result.schedule.length,
    coveragePercentage: result.isValid ? 100 : 0
  };
  await roster.save();

  const [savedEntries, savedConflicts] = await Promise.all([
    RosterEntry.find({ roster: roster._id })
      .populate('employee')
      .populate('brand')
      .populate('process'),
    Conflict.find({ roster: roster._id })
      .populate('brand')
      .populate('process')
      .populate('affectedEmployee')
      .populate('backupEmployees')
  ]);
  return { entries: savedEntries, conflicts: savedConflicts };
};

// @desc    Generate roster
// @route   POST /api/rosters/generate
// @access  Private
exports.generateRoster = async (req, res) => {
  try {
    const { month, year, pods, brands } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year'
      });
    }

    // Check if roster already exists
    const existingRoster = await Roster.findOne({
      month,
      year,
      status: { $in: ['draft', 'published'] }
    });

    if (existingRoster) {
      return res.status(400).json({
        success: false,
        message: 'Roster already exists for this month. Please delete it first or use update.'
      });
    }

    // Initialize scheduling engine
    const scheduler = new SchedulingEngine(
      month,
      year,
      pods || [],
      brands || []
    );

    // Generate schedule
    const result = await scheduler.generateSchedule();

    // Create roster
    const roster = await Roster.create({
      month,
      year,
      pods: pods || [],
      brands: brands || [],
      status: 'draft',
      generatedBy: req.user._id,
      totalConflicts: result.conflicts.length,
      isValid: result.isValid,
      metadata: {
        totalDays: result.schedule.length > 0 ? 
          new Set(result.schedule.map(s => format(s.date, 'yyyy-MM-dd'))).size : 0,
        totalAssignments: result.schedule.length,
        coveragePercentage: result.isValid ? 100 : 0
      }
    });

    // Create roster entries
    const entries = result.schedule.map(entry => ({
      ...entry,
      roster: roster._id
    }));

    if (entries.length > 0) {
      await RosterEntry.insertMany(entries);
    }

    // Create conflicts
    const conflicts = result.conflicts.map(conflict => ({
      ...conflict,
      roster: roster._id
    }));

    if (conflicts.length > 0) {
      await Conflict.insertMany(conflicts);
    }

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'generate',
      entityType: 'roster',
      entityId: roster._id,
      details: `Generated roster for ${month}/${year}`
    });

    // Fetch complete roster with entries and conflicts
    const completeRoster = await Roster.findById(roster._id)
      .populate('pods')
      .populate('brands')
      .populate('generatedBy');

    const rosterEntries = await RosterEntry.find({ roster: roster._id })
      .populate('employee')
      .populate('brand')
      .populate('process');

    const rosterConflicts = await Conflict.find({ roster: roster._id })
      .populate('brand')
      .populate('process')
      .populate('affectedEmployee')
      .populate('backupEmployees');

    res.status(201).json({
      success: true,
      data: {
        roster: completeRoster,
        entries: rosterEntries,
        conflicts: rosterConflicts
      }
    });
  } catch (error) {
    console.error('Roster generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all rosters
// @route   GET /api/rosters
// @access  Private
exports.getRosters = async (req, res) => {
  try {
    const { status, year } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (year) query.year = parseInt(year);

    const rosters = await Roster.find(query)
      .populate('pods')
      .populate('brands')
      .populate('generatedBy')
      .sort('-year -month');

    res.status(200).json({
      success: true,
      count: rosters.length,
      data: rosters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single roster
// @route   GET /api/rosters/:id
// @access  Private
exports.getRoster = async (req, res) => {
  try {
    const roster = await Roster.findById(req.params.id)
      .populate('pods')
      .populate('brands')
      .populate('generatedBy');

    if (!roster) {
      return res.status(404).json({
        success: false,
        message: 'Roster not found'
      });
    }

    res.status(200).json({
      success: true,
      data: roster
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get roster entries
// @route   GET /api/rosters/:id/entries
// @access  Private
exports.getRosterEntries = async (req, res) => {
  try {
    const { employee, brand, process, status, date } = req.query;
    let query = { roster: req.params.id };
    
    if (employee) query.employee = employee;
    if (brand) query.brand = brand;
    if (process) query.process = process;
    if (status) query.status = status;
    if (date) query.date = new Date(date);

    const entries = await RosterEntry.find(query)
      .populate('employee')
      .populate('brand')
      .populate('process')
      .sort('date');

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get roster conflicts
// @route   GET /api/rosters/:id/conflicts
// @access  Private
exports.getRosterConflicts = async (req, res) => {
  try {
    const { status, severity } = req.query;
    let query = { roster: req.params.id };
    
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const conflicts = await Conflict.find(query)
      .populate('brand')
      .populate('process')
      .populate('affectedEmployee')
      .populate('backupEmployees')
      .sort('-severity date');

    res.status(200).json({
      success: true,
      count: conflicts.length,
      data: conflicts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update roster entry
// @route   PUT /api/rosters/entries/:id
// @access  Private
exports.updateRosterEntry = async (req, res) => {
  try {
    const entry = await RosterEntry.findByIdAndUpdate(
      req.params.id,
      { ...req.body, isManualOverride: true },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Roster entry not found'
      });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      entityType: 'roster',
      details: `Updated roster entry manually`
    });

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Publish roster
// @route   PUT /api/rosters/:id/publish
// @access  Private
exports.publishRoster = async (req, res) => {
  try {
    const roster = await Roster.findById(req.params.id);

    if (!roster) {
      return res.status(404).json({
        success: false,
        message: 'Roster not found'
      });
    }

    const scheduler = new SchedulingEngine(roster.month, roster.year, roster.pods, roster.brands);
    const result = await scheduler.generateSchedule();
    const currentSchedule = await saveScheduleResult(roster, result);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Roster publish blocked: the latest validation found critical coverage gaps. Review the returned conflict details and recommended actions, correct the staffing data, then revalidate.',
        roster,
        conflicts: currentSchedule.conflicts
      });
    }

    roster.status = 'published';
    roster.publishedAt = Date.now();
    await roster.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'publish',
      entityType: 'roster',
      entityId: roster._id,
      details: `Published roster for ${roster.month}/${roster.year}`
    });

    res.status(200).json({
      success: true,
      data: {
        roster,
        entries: currentSchedule.entries
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Revalidate roster
// @route   POST /api/rosters/:id/revalidate
// @access  Private
exports.revalidateRoster = async (req, res) => {
  try {
    const roster = await Roster.findById(req.params.id);

    if (!roster) {
      return res.status(404).json({
        success: false,
        message: 'Roster not found'
      });
    }

    const scheduler = new SchedulingEngine(
      roster.month,
      roster.year,
      roster.pods,
      roster.brands
    );

    const result = await scheduler.generateSchedule();
    const updatedSchedule = await saveScheduleResult(roster, result);

    res.status(200).json({
      success: true,
      data: {
        roster,
        entries: updatedSchedule.entries,
        conflicts: updatedSchedule.conflicts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete roster
// @route   DELETE /api/rosters/:id
// @access  Private
exports.deleteRoster = async (req, res) => {
  try {
    const roster = await Roster.findById(req.params.id);

    if (!roster) {
      return res.status(404).json({
        success: false,
        message: 'Roster not found'
      });
    }

    // Delete associated entries and conflicts
    await RosterEntry.deleteMany({ roster: roster._id });
    await Conflict.deleteMany({ roster: roster._id });
    await roster.deleteOne();

    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      entityType: 'roster',
      entityId: roster._id,
      details: `Deleted roster for ${roster.month}/${roster.year}`
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
