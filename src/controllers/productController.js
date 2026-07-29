const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products (with search, category, brand, sorting, pagination)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { keyword, category, subcategory, brand, priceMin, priceMax, rating, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    // Keyword Search
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    // Category Filter (support category object ID or category Name via lookup)
    if (category) {
      // check if valid object ID, otherwise find Category by name first
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({ name: { $regex: category, $options: 'i' } });
        if (foundCategory) {
          query.category = foundCategory._id;
        } else {
          query.category = null; // No match found
        }
      }
    }

    // Subcategory Filter
    if (subcategory) {
      if (subcategory.match(/^[0-9a-fA-F]{24}$/)) {
        query.subcategory = subcategory;
      } else {
        const foundSubcategory = await require('../models/Subcategory').findOne({ name: { $regex: subcategory, $options: 'i' } });
        if (foundSubcategory) {
          query.subcategory = foundSubcategory._id;
        } else {
          query.subcategory = null;
        }
      }
    }

    // Brand Filter
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Price Filter (against offerPrice)
    if (priceMin || priceMax) {
      query.offerPrice = {};
      if (priceMin) query.offerPrice.$gte = Number(priceMin);
      if (priceMax) query.offerPrice.$lte = Number(priceMax);
    }

    // Rating Filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Sorting
    let sortBy = { createdAt: -1 }; // default sorting
    if (sort) {
      if (sort === 'priceAsc') sortBy = { offerPrice: 1 };
      else if (sort === 'priceDesc') sortBy = { offerPrice: -1 };
      else if (sort === 'rating') sortBy = { rating: -1 };
      else if (sort === 'popular') sortBy = { numReviews: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      totalPages: Math.ceil(totalProducts / Number(limit)),
      currentPage: Number(page),
      totalProducts,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch related products
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id }
    }).limit(4);

    res.status(200).json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const { name, category, subcategory, brand, description, images, stock, originalPrice, discount, gst, isFeatured, isTopSelling, isTrending, isNewArrival } = req.body;

    const product = await Product.create({
      name,
      category,
      subcategory,
      brand,
      description,
      images: images || ['/uploads/default-product.png'],
      stock,
      originalPrice,
      discount,
      gst,
      isFeatured,
      isTopSelling,
      isTrending,
      isNewArrival,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
