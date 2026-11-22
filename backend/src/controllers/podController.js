const Pod = require('../models/Pod');
const ActivityLog = require('../models/ActivityLog');

exports.getPods = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status !== undefined) query.isActive = status === 'true';
    if (search) {
      query.podName = { $regex: search, $options: 'i' };
    }

    const pods = await Pod.find(query)
      .populate('podLead')
      .populate('employees')
      .populate('assignedBrands')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: pods.length, data: pods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPod = async (req, res) => {
  try {
    const pod = await Pod.findById(req.params.id)
      .populate('podLead')
      .populate('employees')
      .populate('assignedBrands');

    if (!pod) {
      return res.status(404).json({ success: false, message: 'Pod not found' });
    }

    res.status(200).json({ success: true, data: pod });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPod = async (req, res) => {
  try {
    const pod = await Pod.create(req.body);

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      entityType: 'pod',
      entityId: pod._id,
      details: `Created pod: ${pod.podName}`
    });

    res.status(201).json({ success: true, data: pod });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePod = async (req, res) => {
  try {
    const pod = await Pod.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!pod) {
      return res.status(404).json({ success: false, message: 'Pod not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      entityType: 'pod',
      entityId: pod._id,
      details: `Updated pod: ${pod.podName}`
    });

    res.status(200).json({ success: true, data: pod });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePod = async (req, res) => {
  try {
    const pod = await Pod.findByIdAndDelete(req.params.id);

    if (!pod) {
      return res.status(404).json({ success: false, message: 'Pod not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      entityType: 'pod',
      entityId: pod._id,
      details: `Deleted pod: ${pod.podName}`
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
