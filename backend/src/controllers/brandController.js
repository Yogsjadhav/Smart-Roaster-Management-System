const Brand = require('../models/Brand');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Private
exports.getBrands = async (req, res) => {
  try {
    const { status, pod, search } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (pod) query.assignedPod = pod;
    if (search) {
      query.$or = [
        { brandName: { $regex: search, $options: 'i' } },
        { brandCode: { $regex: search, $options: 'i' } }
      ];
    }

    const brands = await Brand.find(query)
      .populate('assignedPod')
      .populate('assignedEmployees')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Private
exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id)
      .populate('assignedPod')
      .populate('assignedEmployees');

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create brand
// @route   POST /api/brands
// @access  Private
exports.createBrand = async (req, res) => {
  try {
    const brandData = { ...req.body };
    if (brandData.assignedPod === '') brandData.assignedPod = null;
    const brand = await Brand.create(brandData);

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      entityType: 'brand',
      entityId: brand._id,
      details: `Created brand: ${brand.brandName}`
    });

    res.status(201).json({
      success: true,
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private
exports.updateBrand = async (req, res) => {
  try {
    const brandData = { ...req.body };
    if (brandData.assignedPod === '') brandData.assignedPod = null;
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      brandData,
      { new: true, runValidators: true }
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      entityType: 'brand',
      entityId: brand._id,
      details: `Updated brand: ${brand.brandName}`
    });

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      entityType: 'brand',
      entityId: brand._id,
      details: `Deleted brand: ${brand.brandName}`
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
