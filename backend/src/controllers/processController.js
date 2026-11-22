const Process = require('../models/Process');
const ActivityLog = require('../models/ActivityLog');

exports.getProcesses = async (req, res) => {
  try {
    const { brand, status, search } = req.query;
    let query = {};
    
    if (brand) query.brand = brand;
    if (status !== undefined) query.isActive = status === 'true';
    if (search) {
      query.$or = [
        { processName: { $regex: search, $options: 'i' } },
        { processCode: { $regex: search, $options: 'i' } }
      ];
    }

    const processes = await Process.find(query)
      .populate('brand')
      .populate('assignedEmployees')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: processes.length, data: processes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProcess = async (req, res) => {
  try {
    const process = await Process.findById(req.params.id)
      .populate('brand')
      .populate('assignedEmployees');

    if (!process) {
      return res.status(404).json({ success: false, message: 'Process not found' });
    }

    res.status(200).json({ success: true, data: process });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProcess = async (req, res) => {
  try {
    const process = await Process.create(req.body);

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      entityType: 'process',
      entityId: process._id,
      details: `Created process: ${process.processName}`
    });

    res.status(201).json({ success: true, data: process });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProcess = async (req, res) => {
  try {
    const process = await Process.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!process) {
      return res.status(404).json({ success: false, message: 'Process not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      entityType: 'process',
      entityId: process._id,
      details: `Updated process: ${process.processName}`
    });

    res.status(200).json({ success: true, data: process });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProcess = async (req, res) => {
  try {
    const process = await Process.findByIdAndDelete(req.params.id);

    if (!process) {
      return res.status(404).json({ success: false, message: 'Process not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      entityType: 'process',
      entityId: process._id,
      details: `Deleted process: ${process.processName}`
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
