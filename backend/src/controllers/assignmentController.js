const Assignment = require('../models/Assignment');
const Employee = require('../models/Employee');
const Brand = require('../models/Brand');
const Process = require('../models/Process');
const ActivityLog = require('../models/ActivityLog');

exports.getAssignments = async (req, res) => {
  try {
    const { employee, brand, process, status } = req.query;
    let query = {};
    
    if (employee) query.employee = employee;
    if (brand) query.brand = brand;
    if (process) query.process = process;
    if (status !== undefined) query.isActive = status === 'true';

    const assignments = await Assignment.find(query)
      .populate('employee')
      .populate('brand')
      .populate('process')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { employee, brand, process } = req.body;

    // Check if assignment already exists
    const existingAssignment = await Assignment.findOne({ employee, brand, process });
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Assignment already exists'
      });
    }

    const assignment = await Assignment.create(req.body);

    // Update employee's assigned brands and processes
    await Employee.findByIdAndUpdate(employee, {
      $addToSet: { assignedBrands: brand, assignedProcesses: process }
    });

    // Update brand's assigned employees
    await Brand.findByIdAndUpdate(brand, {
      $addToSet: { assignedEmployees: employee }
    });

    // Update process's assigned employees
    await Process.findByIdAndUpdate(process, {
      $addToSet: { assignedEmployees: employee }
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      entityType: 'assignment',
      entityId: assignment._id,
      details: `Created assignment`
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Remove from employee's assigned arrays
    await Employee.findByIdAndUpdate(assignment.employee, {
      $pull: { assignedBrands: assignment.brand, assignedProcesses: assignment.process }
    });

    // Remove from brand's assigned employees
    await Brand.findByIdAndUpdate(assignment.brand, {
      $pull: { assignedEmployees: assignment.employee }
    });

    // Remove from process's assigned employees
    await Process.findByIdAndUpdate(assignment.process, {
      $pull: { assignedEmployees: assignment.employee }
    });

    await assignment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
