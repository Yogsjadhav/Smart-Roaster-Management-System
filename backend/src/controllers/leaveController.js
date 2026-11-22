const Leave = require('../models/Leave');
const ActivityLog = require('../models/ActivityLog');

exports.getLeaves = async (req, res) => {
  try {
    const { employee, status, startDate, endDate } = req.query;
    let query = {};
    
    if (employee) query.employee = employee;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.$or = [
        { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } }
      ];
    }

    const leaves = await Leave.find(query)
      .populate('employee')
      .populate('approvedBy')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee')
      .populate('approvedBy');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const leave = await Leave.create(req.body);

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      entityType: 'leave',
      entityId: leave._id,
      details: `Created leave request for employee`
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.user._id,
        approvalDate: Date.now()
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'approve',
      entityType: 'leave',
      entityId: leave._id,
      details: `Approved leave request`
    });

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        approvedBy: req.user._id,
        approvalDate: Date.now(),
        rejectionReason
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'reject',
      entityType: 'leave',
      entityId: leave._id,
      details: `Rejected leave request`
    });

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
