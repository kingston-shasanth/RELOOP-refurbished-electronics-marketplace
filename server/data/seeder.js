const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Product = require('../models/Product');
const DigitalPassport = require('../models/DigitalPassport');
const Order = require('../models/Order');
const TradeInRequest = require('../models/TradeInRequest');
const expandedProducts = require('./expandedProducts');

const seedDatabase = async () => {
  try {
    console.log('[RELOOP Seeder] Connecting to MongoDB...');
    await connectDB();

    console.log('[RELOOP Seeder] Clearing existing records for clean assessment baseline...');
    await User.deleteMany();
    await Product.deleteMany();
    await DigitalPassport.deleteMany();
    await Order.deleteMany();
    await TradeInRequest.deleteMany();

    // 1. Seed Users (Admin, Customer, Evaluators)
    console.log('[RELOOP Seeder] Creating accounts...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedCustomerPassword = await bcrypt.hash('password123', 10);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@reloop.com',
      password: hashedAdminPassword,
      role: 'admin',
      phone: '+91 98765 00001',
      shippingAddress: {
        street: 'RELOOP Operations Hub, Electronics City',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India',
      },
    });

    const customerUser = await User.create({
      name: 'Kingston Shasanth',
      email: 'customer@reloop.com',
      password: hashedCustomerPassword,
      role: 'customer',
      phone: '+91 98765 43210',
      shippingAddress: {
        street: '12, Green Park, Hosur',
        city: 'Hosur',
        state: 'Tamil Nadu',
        postalCode: '635109',
        country: 'India',
      },
    });

    const evaluatorUser = await User.create({
      name: 'Shashanth K.',
      email: 'shasanth@example.com',
      password: hashedCustomerPassword,
      role: 'customer',
      phone: '+91 98450 12345',
      shippingAddress: {
        street: 'University Residence, Peelamedu',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        postalCode: '641004',
        country: 'India',
      },
    });

    // 2. Realistic Product Catalog with Curated Hardware Imagery
    console.log('[RELOOP Seeder] Seeding catalog products & digital passports...');
    const rawProducts = [
      {
        title: 'Apple MacBook Air M1 (2020)',
        slug: 'apple-macbook-air-m1-2020',
        brand: 'Apple',
        category: 'Laptops',
        subcategory: 'Ultrabook',
        refurbishedPrice: 45999,
        originalRetailPrice: 62900,
        stockCount: 8,
        conditionGrade: 'Pristine',
        conditionSummary: 'Minimal signs of use. Flawless display, 96% original battery capacity, and certified logic board.',
        primaryImage: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        ],
        specifications: {
          processor: 'Apple M1 Chip (8-Core CPU / 7-Core GPU)',
          ram: '8GB Unified Memory',
          storage: '256GB PCIe NVMe SSD',
          display: '13.3-inch Retina Display with True Tone',
          graphics: 'Integrated Apple 7-Core GPU',
          os: 'macOS Sequoia',
          color: 'Space Grey',
          batteryHealthPercent: 96,
        },
        warrantyMonths: 12,
        isFeatured: true,
        rating: 4.8,
        reviewCount: 216,
      },
      {
        title: 'Dell XPS 13 9310 (i7 / 16GB)',
        slug: 'dell-xps-13-9310-i7',
        brand: 'Dell',
        category: 'Laptops',
        subcategory: 'Ultrabook',
        refurbishedPrice: 52999,
        originalRetailPrice: 74990,
        stockCount: 7,
        conditionGrade: 'Pristine',
        conditionSummary: 'Factory certified renewed. Pristine CNC aluminium chassis, carbon fibre palm rest, 94% battery health.',
        primaryImage: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
        ],
        specifications: {
          processor: 'Intel Core i7-1185G7 (4.80 GHz)',
          ram: '16GB LPDDR4x Dual Channel',
          storage: '512GB M.2 NVMe SSD',
          display: '13.4-inch FHD+ (1920 x 1200) InfinityEdge',
          graphics: 'Intel Iris Xe Graphics',
          os: 'Windows 11 Pro',
          color: 'Platinum Silver',
          batteryHealthPercent: 94,
        },
        warrantyMonths: 12,
        isFeatured: true,
        rating: 4.7,
        reviewCount: 128,
      },
      {
        title: 'HP Pavilion 15 (Ryzen 5 / 8GB)',
        slug: 'hp-pavilion-15-ryzen-5',
        brand: 'HP',
        category: 'Laptops',
        subcategory: 'Everyday Laptop',
        refurbishedPrice: 32999,
        originalRetailPrice: 48990,
        stockCount: 5,
        conditionGrade: 'Good',
        conditionSummary: 'Fully functional. Minor micro-scratches on outer lid. Verified keyboard, trackpad, and battery.',
        primaryImage: 'https://images.unsplash.com/photo-1544731612-de2f963c631e?w=800&auto=format&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1544731612-de2f963c631e?w=800&auto=format&fit=crop&q=80'],
        specifications: {
          processor: 'AMD Ryzen 5 5500U (6-Core, 12-Thread)',
          ram: '8GB DDR4 3200MHz',
          storage: '512GB PCIe NVMe SSD',
          display: '15.6-inch Micro-edge Anti-glare FHD',
          graphics: 'AMD Radeon Graphics',
          os: 'Windows 11 Home',
          color: 'Natural Silver',
          batteryHealthPercent: 88,
        },
        warrantyMonths: 6,
        isFeatured: false,
        rating: 4.3,
        reviewCount: 94,
      },
      {
        title: 'Apple iPhone 13 (128GB Midnight)',
        slug: 'apple-iphone-13-128gb',
        brand: 'Apple',
        category: 'Smartphones',
        subcategory: 'Flagship',
        refurbishedPrice: 29999,
        originalRetailPrice: 39900,
        stockCount: 12,
        conditionGrade: 'Excellent',
        conditionSummary: 'Light signs of cosmetic handling on edge bezel. Ceramic Shield glass is 100% blemish-free. 91% battery health.',
        primaryImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
        ],
        specifications: {
          processor: 'A15 Bionic Chip',
          ram: '4GB RAM',
          storage: '128GB Storage',
          display: '6.1-inch Super Retina XDR OLED',
          graphics: 'Apple 4-Core GPU',
          os: 'iOS 18',
          color: 'Midnight Black',
          batteryHealthPercent: 91,
        },
        warrantyMonths: 6,
        isFeatured: true,
        rating: 4.8,
        reviewCount: 310,
      },
      {
        title: 'Samsung Galaxy S22 5G (128GB)',
        slug: 'samsung-galaxy-s22-128gb',
        brand: 'Samsung',
        category: 'Smartphones',
        subcategory: 'Flagship',
        refurbishedPrice: 26499,
        originalRetailPrice: 42900,
        stockCount: 19,
        conditionGrade: 'Excellent',
        conditionSummary: 'Tested 50-point diagnostics passed. Dynamic AMOLED 2X 120Hz display with zero burn-in. 93% battery health.',
        primaryImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80'],
        specifications: {
          processor: 'Snapdragon 8 Gen 1 (4nm)',
          ram: '8GB LPDDR5',
          storage: '128GB UFS 3.1',
          display: '6.1-inch Dynamic AMOLED 2X 120Hz HDR10+',
          graphics: 'Adreno 730',
          os: 'Android 14 (One UI 6)',
          color: 'Phantom Black',
          batteryHealthPercent: 93,
        },
        warrantyMonths: 12,
        isFeatured: true,
        rating: 4.6,
        reviewCount: 175,
      },
      {
        title: 'Sony WH-1000XM4 Noise Cancelling',
        slug: 'sony-wh-1000xm4-black',
        brand: 'Sony',
        category: 'Audio',
        subcategory: 'Over-ear Headphones',
        refurbishedPrice: 14999,
        originalRetailPrice: 24990,
        stockCount: 4,
        conditionGrade: 'Good',
        conditionSummary: 'Ear pads sanitized and acoustically tested. Industry-leading ANC performance verified across all frequencies.',
        primaryImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
        specifications: {
          processor: 'HD Noise Cancelling Processor QN1',
          ram: 'N/A',
          storage: 'N/A',
          display: 'Touch Sensor Controls',
          graphics: 'N/A',
          os: 'Sony Headphones Connect App',
          color: 'Matte Black',
          batteryHealthPercent: 95,
        },
        warrantyMonths: 6,
        isFeatured: true,
        rating: 4.9,
        reviewCount: 420,
      },
      {
        title: 'Apple iPad Air 4th Gen (64GB Wi-Fi)',
        slug: 'apple-ipad-air-4-64gb',
        brand: 'Apple',
        category: 'Tablets',
        subcategory: 'Tablet',
        refurbishedPrice: 32999,
        originalRetailPrice: 46000,
        stockCount: 6,
        conditionGrade: 'Pristine',
        conditionSummary: 'Flawless Liquid Retina screen, Apple Pencil 2 magnetic pairing tested, 95% battery capacity.',
        primaryImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'],
        specifications: {
          processor: 'Apple A14 Bionic (6-Core)',
          ram: '4GB RAM',
          storage: '64GB Storage',
          display: '10.9-inch Liquid Retina with True Tone',
          graphics: 'Apple 4-Core GPU',
          os: 'iPadOS 18',
          color: 'Space Grey',
          batteryHealthPercent: 95,
        },
        warrantyMonths: 12,
        isFeatured: false,
        rating: 4.7,
        reviewCount: 88,
      },
      {
        title: 'Lenovo ThinkPad T14 Gen 2 (i5 / 16GB)',
        slug: 'lenovo-thinkpad-t14-gen-2',
        brand: 'Lenovo',
        category: 'Laptops',
        subcategory: 'Business Laptop',
        refurbishedPrice: 36500,
        originalRetailPrice: 54000,
        stockCount: 9,
        conditionGrade: 'Excellent',
        conditionSummary: 'Enterprise-grade durability. Legendary spill-resistant keyboard, biometric fingerprint reader verified.',
        primaryImage: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'],
        specifications: {
          processor: 'Intel Core i5-1135G7 (4.20 GHz)',
          ram: '16GB DDR4 3200MHz',
          storage: '256GB PCIe NVMe SSD',
          display: '14.0-inch FHD (1920 x 1080) IPS Anti-glare',
          graphics: 'Intel Iris Xe Graphics',
          os: 'Windows 11 Pro',
          color: 'Black',
          batteryHealthPercent: 90,
        },
        warrantyMonths: 12,
        isFeatured: false,
        rating: 4.6,
        reviewCount: 65,
      },
      {
        title: 'NVIDIA GeForce RTX 3070 Ti (8GB GDDR6X)',
        slug: 'nvidia-geforce-rtx-3070-ti-8gb',
        brand: 'NVIDIA',
        category: 'PC Components',
        subcategory: 'Graphics Card',
        refurbishedPrice: 28999,
        originalRetailPrice: 45000,
        stockCount: 3,
        conditionGrade: 'Excellent',
        conditionSummary: 'Stress-tested with 3DMark TimeSpy and FurMark for 4 hours. Fresh Arctic MX-4 thermal paste applied.',
        primaryImage: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80'],
        specifications: {
          processor: 'GA104-400-A1 GPU (6144 CUDA Cores)',
          ram: '8GB GDDR6X (256-bit)',
          storage: 'N/A',
          display: '3x DisplayPort 1.4a, 1x HDMI 2.1',
          graphics: 'Ray Tracing Cores 2nd Gen, Tensor Cores 3rd Gen',
          os: 'PCIe 4.0 Support',
          color: 'Gunmetal Silver',
          batteryHealthPercent: 100,
        },
        warrantyMonths: 6,
        isFeatured: false,
        rating: 4.8,
        reviewCount: 42,
      },
    ];

    const allCatalogProducts = [...rawProducts, ...(Array.isArray(expandedProducts) ? expandedProducts : [])];
    for (const raw of allCatalogProducts) {
      const product = await Product.create(raw);

      const passport = await DigitalPassport.create({
        productId: product._id,
        deviceSerialNumber: `RLP-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`,
        diagnosticSummaryScore: raw.conditionGrade === 'Pristine' ? 98 : raw.conditionGrade === 'Excellent' ? 94 : 88,
        subsystemChecks: {
          screen: {
            status: raw.conditionGrade === 'Pristine' ? 'Pass' : 'Minor Blemish',
            notes: 'Zero dead pixels detected. Contrast & backlight calibrated.',
          },
          battery: {
            status: 'Pass',
            healthPercent: raw.specifications?.batteryHealthPercent || 92,
            cycleCount: 110,
          },
          chassis: {
            status: raw.conditionGrade === 'Pristine' ? 'Flawless' : 'Micro-scratches',
            notes: 'Hinge torque & shell verified under standard pressure tests.',
          },
          portsAndCharging: {
            status: 'Pass',
            notes: 'Power delivery (PD) and USB 3.2 data throughput verified.',
          },
          camerasAndSensors: {
            status: 'Pass',
            notes: 'Sensor noise ratio & microphone input verified.',
          },
          audioAndMics: {
            status: 'Pass',
            notes: 'Stereo drivers tested with sweep frequency.',
          },
          connectivityWifiBt: {
            status: 'Pass',
            notes: 'Dual-band 5GHz and Bluetooth 5.2 certified.',
          },
        },
        partsReplaced:
          raw.conditionGrade === 'Pristine'
            ? [{ partName: 'OEM Certified Battery Pack', replacementType: 'OEM Original', date: new Date('2026-10-15') }]
            : [],
        carbonOffsetKg: 52.4,
        eWastePreventedGrams: 1650,
      });

      product.digitalPassportId = passport._id;
      await product.save();
    }

    // 3. Seed Realistic Orders matching Reference 06 & 12
    console.log('[RELOOP Seeder] Seeding demonstration orders...');
    const macbook = await Product.findOne({ slug: 'apple-macbook-air-m1-2020' });
    const iphone = await Product.findOne({ slug: 'apple-iphone-13-128gb' });
    const sony = await Product.findOne({ slug: 'sony-wh-1000xm4-black' });

    if (macbook && iphone && sony) {
      // Order 1: Delivered
      await Order.create({
        orderNumber: 'RLP-2026-102401',
        user: customerUser._id,
        orderItems: [
          {
            product: iphone._id,
            title: iphone.title,
            image: iphone.primaryImage,
            conditionGrade: iphone.conditionGrade,
            unitPrice: iphone.refurbishedPrice,
            quantity: 1,
            subtotal: iphone.refurbishedPrice,
          },
        ],
        shippingAddress: {
          fullName: customerUser.name,
          phone: customerUser.phone,
          street: customerUser.shippingAddress.street,
          city: customerUser.shippingAddress.city,
          state: customerUser.shippingAddress.state,
          postalCode: customerUser.shippingAddress.postalCode,
          country: customerUser.shippingAddress.country,
        },
        pricing: {
          itemsSubtotal: iphone.refurbishedPrice,
          shippingFee: 0,
          estimatedTax: Math.round(iphone.refurbishedPrice * 0.18),
          discountAmount: 0,
          totalPrice: iphone.refurbishedPrice,
        },
        paymentDetails: {
          paymentMethod: 'Simulated Card',
          status: 'Paid',
          transactionId: 'TXN-SIM-948102',
          cardBrand: 'Visa',
          cardLast4: '4242',
        },
        orderStatus: 'Delivered',
        statusTimeline: [
          { status: 'Order Placed', timestamp: new Date('2026-10-20'), note: 'Order confirmed' },
          { status: 'Inspected & Packed', timestamp: new Date('2026-10-21'), note: 'Quality seal applied' },
          { status: 'Dispatched', timestamp: new Date('2026-10-22'), note: 'Shipped via Express Express' },
          { status: 'Delivered', timestamp: new Date('2026-10-24'), note: 'Delivered to customer' },
        ],
      });

      // Order 2: Processing (Inspected & Packed)
      await Order.create({
        orderNumber: 'RLP-2026-102301',
        user: customerUser._id,
        orderItems: [
          {
            product: macbook._id,
            title: macbook.title,
            image: macbook.primaryImage,
            conditionGrade: macbook.conditionGrade,
            unitPrice: macbook.refurbishedPrice,
            quantity: 1,
            subtotal: macbook.refurbishedPrice,
          },
        ],
        shippingAddress: {
          fullName: customerUser.name,
          phone: customerUser.phone,
          street: customerUser.shippingAddress.street,
          city: customerUser.shippingAddress.city,
          state: customerUser.shippingAddress.state,
          postalCode: customerUser.shippingAddress.postalCode,
          country: customerUser.shippingAddress.country,
        },
        pricing: {
          itemsSubtotal: macbook.refurbishedPrice,
          shippingFee: 0,
          estimatedTax: Math.round(macbook.refurbishedPrice * 0.18),
          discountAmount: 0,
          totalPrice: macbook.refurbishedPrice,
        },
        paymentDetails: {
          paymentMethod: 'Simulated Card',
          status: 'Paid',
          transactionId: 'TXN-SIM-820194',
          cardBrand: 'Mastercard',
          cardLast4: '8888',
        },
        orderStatus: 'Inspected & Packed',
        statusTimeline: [
          { status: 'Order Placed', timestamp: new Date('2026-10-23'), note: 'Order confirmed' },
          { status: 'Inspected & Packed', timestamp: new Date('2026-10-24'), note: '50-point diagnostic certified' },
        ],
      });

      // Order 3: Dispatched
      await Order.create({
        orderNumber: 'RLP-2026-102201',
        user: evaluatorUser._id,
        orderItems: [
          {
            product: sony._id,
            title: sony.title,
            image: sony.primaryImage,
            conditionGrade: sony.conditionGrade,
            unitPrice: sony.refurbishedPrice,
            quantity: 1,
            subtotal: sony.refurbishedPrice,
          },
        ],
        shippingAddress: {
          fullName: evaluatorUser.name,
          phone: evaluatorUser.phone,
          street: evaluatorUser.shippingAddress.street,
          city: evaluatorUser.shippingAddress.city,
          state: evaluatorUser.shippingAddress.state,
          postalCode: evaluatorUser.shippingAddress.postalCode,
          country: evaluatorUser.shippingAddress.country,
        },
        pricing: {
          itemsSubtotal: sony.refurbishedPrice,
          shippingFee: 0,
          estimatedTax: Math.round(sony.refurbishedPrice * 0.18),
          discountAmount: 0,
          totalPrice: sony.refurbishedPrice,
        },
        paymentDetails: {
          paymentMethod: 'Simulated Card',
          status: 'Paid',
          transactionId: 'TXN-SIM-719301',
          cardBrand: 'Visa',
          cardLast4: '1234',
        },
        orderStatus: 'Dispatched',
        statusTimeline: [
          { status: 'Order Placed', timestamp: new Date('2026-10-22'), note: 'Order placed' },
          { status: 'Dispatched', timestamp: new Date('2026-10-23'), note: 'Courier tracking assigned' },
        ],
      });
    }

    // 4. Seed Sample Trade-In Request
    console.log('[RELOOP Seeder] Seeding trade-in requests...');
    await TradeInRequest.create({
      user: customerUser._id,
      deviceCategory: 'Smartphones',
      brand: 'Apple',
      modelName: 'iPhone 12 (64GB)',
      specifications: 'Black, Battery 84%',
      functionalState: {
        powersOn: true,
        screenIntact: true,
        touchResponsive: true,
        camerasWork: true,
        batteryWorking: true,
      },
      cosmeticGrade: 'Good (Minor Scratches)',
      estimatedValue: 14500,
      valuationBreakdown: {
        baseModelValue: 16000,
        cosmeticAdjustment: -1500,
        functionalDeductions: 0,
        batteryAdjustment: -1000,
      },
      status: 'Submitted',
    });

    console.log('[RELOOP Seeder] Seeding completed successfully!');
    console.log('--- TEST ACCOUNTS AVAILABLE FOR ASSESSMENT ---');
    console.log('Admin Account:    admin@reloop.com    / admin123');
    console.log('Customer Account: customer@reloop.com / password123');
    console.log('----------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[RELOOP Seeder Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
