const Employee = require('../models/Employee');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res) => {
  try {
    const { pod, status, search, brand, process } = req.query;
    
    let query = {};
    
    if (pod) query.operationalPod = pod;
    if (status) query.employmentStatus = status;
    if (brand) query.assignedBrands = brand;
    if (process) query.assignedProcesses = process;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .populate('operationalPod')
      .populate('assignedBrands')
      .populate('assignedProcesses')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('operationalPod')
      .populate('assignedBrands')
      .populate('assignedProcesses');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create employee
// @route   POST /api/employees
// @access  Private
exports.createEmployee = async (req, res) => {
  try {
    const employeeData = { ...req.body };
    if (employeeData.operationalPod === '') employeeData.operationalPod = null;
    const employee = await Employee.create(employeeData);

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      entityType: 'employee',
      entityId: employee._id,
      details: `Created employee: ${employee.fullName}`
    });

    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
exports.updateEmployee = async (req, res) => {
  try {
    const employeeData = { ...req.body };
    if (employeeData.operationalPod === '') employeeData.operationalPod = null;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      employeeData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      entityType: 'employee',
      entityId: employee._id,
      details: `Updated employee: ${employee.fullName}`
    });

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      entityType: 'employee',
      entityId: employee._id,
      details: `Deleted employee: ${employee.fullName}`
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

// @desc    Update employee availability
// @route   PUT /api/employees/:id/availability
// @access  Private
exports.updateAvailability = async (req, res) => {
  try {
    const { date, available } = req.body;
    
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (!employee.availability) {
      employee.availability = new Map();
    }
    
    employee.availability.set(date, available);
    await employee.save();

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
