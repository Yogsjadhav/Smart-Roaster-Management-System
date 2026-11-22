const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    const requestedRole = req.body.role || 'employee';
    const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!['manager', 'employee'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid role'
      });
    }

    if (
      !normalizedUsername ||
      !normalizedEmail ||
      typeof password !== 'string' ||
      !firstName?.trim() ||
      !lastName?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, password, first name, and last name'
      });
    }

    if (normalizedUsername.length < 3 || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters and password must be at least 8 characters'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this username or email already exists'
      });
    }

    if (requestedRole === 'manager' && await User.exists({ role: 'manager' })) {
      return res.status(409).json({
        success: false,
        message: 'A manager account already exists. Register as an employee.'
      });
    }

    // Create user
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: requestedRole
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.role) {
        return res.status(409).json({
          success: false,
          message: 'A manager account already exists. Register as an employee.'
        });
      }
      return res.status(409).json({
        success: false,
        message: 'An account with this username or email already exists'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(item => item.message).join(', ')
      });
    }
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration could not be completed. Please try again later.'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Check for user
    const identifier = username.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'This account is inactive. Contact an administrator.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login could not be completed. Please try again later.'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is unavailable' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
