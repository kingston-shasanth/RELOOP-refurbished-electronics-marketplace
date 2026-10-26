const mongoose = require('mongoose');
const Product = require('../models/Product');
const DigitalPassport = require('../models/DigitalPassport');

// @desc    Get filtered, sorted, paginated product catalogue
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      subcategory,
      grade,
      brand,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    const query = { isActive: true };

    // Search query across title, brand, category, subcategory, and SKU/slug
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { brand: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
        { subcategory: { $regex: term, $options: 'i' } },
        { slug: { $regex: term, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Subcategory filter
    if (subcategory) {
      query.subcategory = { $regex: subcategory, $options: 'i' };
    }

    // Condition Grade filter (Pristine / Like New / Excellent / Good / Fair)
    if (grade) {
      const grades = Array.isArray(grade) ? grade : grade.split(',');
      query.conditionGrade = { $in: grades };
    }

    // Brand filter
    if (brand) {
      const brands = Array.isArray(brand) ? brand : brand.split(',');
      query.brand = { $in: brands };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.refurbishedPrice = {};
      if (minPrice) query.refurbishedPrice.$gte = Number(minPrice);
      if (maxPrice) query.refurbishedPrice.$lte = Number(maxPrice);
    }

    // Featured only
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default newest
    if (sort === 'price-asc') {
      sortOption = { refurbishedPrice: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { refurbishedPrice: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'popular') {
      sortOption = { reviewCount: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('digitalPassportId')
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize) || 1,
      limit: pageSize,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured top picks
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('digitalPassportId')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:identifier
// @access  Public
const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    let product;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      product = await Product.findById(identifier).populate('digitalPassportId');
    }

    if (!product) {
      product = await Product.findOne({ slug: identifier.toLowerCase() }).populate('digitalPassportId');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in RELOOP catalogue.',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product passport
// @route   GET /api/products/:id/passport
// @access  Public
const getProductPassport = async (req, res, next) => {
  try {
    const { id } = req.params;

    let passport;
    if (mongoose.Types.ObjectId.isValid(id)) {
      passport = await DigitalPassport.findOne({
        $or: [{ _id: id }, { productId: id }],
      }).populate('productId');
    }

    if (!passport) {
      return res.status(404).json({
        success: false,
        message: 'Digital Product Passport not found for this item.',
      });
    }

    res.status(200).json({
      success: true,
      passport,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare up to 4 products side by side
// @route   POST /api/products/compare
// @access  Public
const compareProducts = async (req, res, next) => {
  try {
    let ids = req.body?.productIds;
    if (!ids && req.query?.ids) {
      ids = req.query.ids.split(',');
    }
    if (!ids && req.query?.productIds) {
      ids = Array.isArray(req.query.productIds) ? req.query.productIds : req.query.productIds.split(',');
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of product IDs to compare.',
      });
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id.trim())).slice(0, 4);

    const products = await Product.find({ _id: { $in: validIds } }).populate('digitalPassportId');

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product with passport (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      brand,
      category,
      subcategory,
      refurbishedPrice,
      originalRetailPrice,
      stockCount,
      conditionGrade,
      conditionSummary,
      images,
      primaryImage,
      specifications,
      warrantyMonths,
      batteryHealthPercent,
      diagnosticScore,
    } = req.body;

    const autoSlug = slug
      ? slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      : title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

    const finalRefurbPrice = Number(refurbishedPrice || req.body.price || 0);
    const finalOrigPrice = Number(originalRetailPrice || req.body.mrp || finalRefurbPrice);

    // Reliable Local Photographic Category Fallbacks (Zero remote dependency, zero illustrations)
    const CATEGORY_DEFAULT_IMAGES = {
      Laptops: '/images/products/apple-macbook-air-m1.jpg',
      Smartphones: '/images/products/apple-iphone-13.jpg',
      Tablets: '/images/products/apple-ipad-air-4.png',
      Audio: '/images/products/sony-wh1000xm4.jpg',
      Wearables: '/images/products/apple-watch-7.jpg',
      Gaming: '/images/products/ps5-digital.jpg',
      Cameras: '/images/products/sony-a6400.jpg',
      'PC Components': '/images/products/rtx-3070-ti.jpg',
    };
    const defaultFallback = CATEGORY_DEFAULT_IMAGES[category] || '/images/products/apple-macbook-air-m1.jpg';
    const finalPrimaryImage = primaryImage || (Array.isArray(images) && images[0]) || defaultFallback;
    const finalImages = Array.isArray(images) && images.length > 0 ? images : [finalPrimaryImage];

    const product = await Product.create({
      title,
      slug: autoSlug,
      brand,
      category,
      subcategory: subcategory || '',
      refurbishedPrice: finalRefurbPrice,
      originalRetailPrice: finalOrigPrice,
      stockCount: Number(stockCount || 0),
      conditionGrade,
      conditionSummary: conditionSummary || `${conditionGrade} cosmetic and functional condition.`,
      images: finalImages,
      primaryImage: finalPrimaryImage,
      specifications: specifications || {},
      warrantyMonths: Number(warrantyMonths || 6),
      isFeatured: req.body.isFeatured || false,
    });

    // Create accompanying Digital Product Passport
    const passport = await DigitalPassport.create({
      productId: product._id,
      deviceSerialNumber: `RLP-${Date.now().toString(36).toUpperCase()}`,
      diagnosticSummaryScore: Number(diagnosticScore || 95),
      subsystemChecks: {
        screen: { status: 'Pass', notes: 'Display tested for dead pixels and backlight uniformity.' },
        battery: {
          status: 'Pass',
          healthPercent: Number(batteryHealthPercent || specifications?.batteryHealthPercent || 92),
          cycleCount: 140,
        },
        chassis: { status: conditionGrade === 'Pristine' ? 'Flawless' : 'Micro-scratches', notes: 'Chassis structurally intact.' },
        portsAndCharging: { status: 'Pass', notes: 'All ports power delivery verified.' },
        camerasAndSensors: { status: 'Pass', notes: 'Cameras, mics, and sensors calibrated.' },
        audioAndMics: { status: 'Pass', notes: 'Stereo drivers tested.' },
        connectivityWifiBt: { status: 'Pass', notes: 'Wi-Fi & Bluetooth signal verified.' },
      },
      partsReplaced: [],
    });

    product.digitalPassportId = passport._id;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully with Digital Passport.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product and associated Digital Passport (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (req.body.price && !req.body.refurbishedPrice) {
      req.body.refurbishedPrice = req.body.price;
    }
    if (req.body.mrp && !req.body.originalRetailPrice) {
      req.body.originalRetailPrice = req.body.mrp;
    }

    // Protect existing images from being overwritten by empty strings or empty arrays
    if (req.body.primaryImage === '' || req.body.primaryImage === undefined) {
      delete req.body.primaryImage;
    }
    if (req.body.images && req.body.images.length === 0) {
      delete req.body.images;
    }

    // Extract passport-specific fields before updating Product
    const diagnosticScore = req.body.diagnosticScore !== undefined
      ? Number(req.body.diagnosticScore)
      : undefined;

    const batteryHealth = req.body.batteryHealthPercent !== undefined
      ? Number(req.body.batteryHealthPercent)
      : (req.body.specifications?.batteryHealthPercent !== undefined
          ? Number(req.body.specifications.batteryHealthPercent)
          : undefined);

    // Update Product document
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    // Handle linked DigitalPassport persistence
    let passport = null;
    if (updated.digitalPassportId) {
      passport = await DigitalPassport.findById(updated.digitalPassportId);
    }
    if (!passport) {
      passport = await DigitalPassport.findOne({ productId: updated._id });
    }

    if (passport) {
      let passportChanged = false;

      if (diagnosticScore !== undefined && !isNaN(diagnosticScore)) {
        passport.diagnosticSummaryScore = Math.min(100, Math.max(0, diagnosticScore));
        passportChanged = true;
      }

      if (batteryHealth !== undefined && !isNaN(batteryHealth)) {
        passport.subsystemChecks = passport.subsystemChecks || {};
        passport.subsystemChecks.battery = passport.subsystemChecks.battery || {};
        passport.subsystemChecks.battery.healthPercent = Math.min(100, Math.max(0, batteryHealth));
        passportChanged = true;
      }

      if (req.body.conditionGrade) {
        passport.subsystemChecks = passport.subsystemChecks || {};
        passport.subsystemChecks.chassis = passport.subsystemChecks.chassis || {};
        passport.subsystemChecks.chassis.status =
          req.body.conditionGrade === 'Pristine'
            ? 'Flawless'
            : (req.body.conditionGrade === 'Excellent' ? 'Micro-scratches' : 'Visible wear');
        passportChanged = true;
      }

      if (passportChanged) {
        await passport.save();
      }

      // Ensure bidirectional link
      if (!updated.digitalPassportId || updated.digitalPassportId.toString() !== passport._id.toString()) {
        updated.digitalPassportId = passport._id;
        await updated.save();
      }
    } else if (diagnosticScore !== undefined || batteryHealth !== undefined) {
      // Create new passport if missing
      const newPassport = await DigitalPassport.create({
        productId: updated._id,
        deviceSerialNumber: `RLP-${Date.now().toString(36).toUpperCase()}`,
        diagnosticSummaryScore: diagnosticScore !== undefined && !isNaN(diagnosticScore)
          ? Math.min(100, Math.max(0, diagnosticScore))
          : 95,
        subsystemChecks: {
          screen: { status: 'Pass', notes: 'Display tested for dead pixels and backlight uniformity.' },
          battery: {
            status: 'Pass',
            healthPercent: batteryHealth !== undefined && !isNaN(batteryHealth)
              ? Math.min(100, Math.max(0, batteryHealth))
              : 92,
            cycleCount: 120,
          },
          chassis: {
            status: req.body.conditionGrade === 'Pristine' ? 'Flawless' : 'Micro-scratches',
            notes: 'Chassis structurally intact.',
          },
          portsAndCharging: { status: 'Pass', notes: 'All ports power delivery verified.' },
          camerasAndSensors: { status: 'Pass', notes: 'Cameras, mics, and sensors calibrated.' },
          audioAndMics: { status: 'Pass', notes: 'Stereo drivers tested.' },
          connectivityWifiBt: { status: 'Pass', notes: 'Wi-Fi & Bluetooth signal verified.' },
        },
        partsReplaced: [],
      });

      updated.digitalPassportId = newPassport._id;
      await updated.save();
    }

    // Return fully populated product with fresh passport data
    const finalProduct = await Product.findById(id).populate('digitalPassportId');

    res.status(200).json({
      success: true,
      message: 'Product and associated passport updated successfully.',
      product: finalProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.digitalPassportId) {
      await DigitalPassport.findByIdAndDelete(product.digitalPassportId);
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product and associated passport deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductByIdOrSlug,
  getProductPassport,
  compareProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
