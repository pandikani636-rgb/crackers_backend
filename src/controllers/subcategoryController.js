const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');

// @desc    Get all subcategories
// @route   GET /api/subcategories
// @access  Public
exports.getSubcategories = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) {
      filter.category = category;
    }

    const subcategories = await Subcategory.find(filter).populate('category', 'name');
    res.status(200).json({
      success: true,
      count: subcategories.length,
      subcategories,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new subcategory
// @route   POST /api/subcategories
// @access  Private/Admin
exports.createSubcategory = async (req, res) => {
  try {
    const { name, category, description, image } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Please provide name and category' });
    }

    const subcategory = await Subcategory.create({
      name,
      category,
      description,
      image,
    });

    res.status(201).json({
      success: true,
      subcategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
exports.updateSubcategory = async (req, res) => {
  try {
    let subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      subcategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    // Set subcategory references in products to null
    await Product.updateMany({ subcategory: req.params.id }, { subcategory: null });

    await subcategory.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
