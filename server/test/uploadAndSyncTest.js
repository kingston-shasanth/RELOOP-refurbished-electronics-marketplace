const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { app } = require('../server');
const { connectDB } = require('../config/db');

function makeRequest(server, options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runUploadSyncTest() {
  console.log('--- STARTING IMAGE UPLOAD & CATALOGUE SYNC TEST ---');
  await connectDB();
  console.log('✓ Connected to MongoDB');

  const server = http.createServer(app);
  await new Promise(r => server.listen(5099, r));
  const port = 5099;

  let createdProductId = null;
  let uploadedFilePath = null;

  try {
    // 1. Admin login
    console.log('[1] Logging in as Admin...');
    const loginRes = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@reloop.com',
      password: 'admin123'
    });

    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes.data)}`);
    }
    const token = loginRes.data.token;
    console.log('✓ Admin authenticated successfully.');

    // 2. Upload test image (1x1 PNG data URL)
    console.log('[2] Uploading authentic product photo via POST /api/upload...');
    const testPngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    
    const uploadRes = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: '/api/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      image: testPngDataUrl
    });

    if (uploadRes.status !== 201 || !uploadRes.data.filePath) {
      throw new Error(`Upload failed: ${JSON.stringify(uploadRes.data)}`);
    }
    uploadedFilePath = uploadRes.data.filePath;
    console.log(`✓ Image uploaded successfully to: ${uploadedFilePath}`);

    // Verify file exists on disk
    const diskPath = path.resolve(__dirname, '../../client/public', uploadedFilePath.replace(/^\//, ''));
    if (!fs.existsSync(diskPath)) {
      throw new Error(`Uploaded file not found on disk at: ${diskPath}`);
    }
    console.log(`✓ File verified on disk (${fs.statSync(diskPath).size} bytes).`);

    // 3. Create product with the uploaded image
    console.log('[3] Creating new refurbished product with uploaded photo via POST /api/products...');
    const productPayload = {
      title: 'Audit Sync Refurbished Workstation Pro',
      brand: 'Dell',
      category: 'Laptops',
      conditionGrade: 'Pristine',
      price: 64999,
      mrp: 119999,
      stockCount: 4,
      images: [uploadedFilePath],
      description: 'Enterprise grade certified renewed workstation verified for university compliance.',
      specifications: {
        processor: 'Intel Core i7-12800H',
        ram: '32GB DDR5',
        storage: '1TB NVMe SSD',
        display: '15.6 inch 4K OLED',
      },
      warrantyMonths: 12,
      dpp: {
        qualityScore: 97,
        batteryHealth: 94,
        co2SavedKg: 285,
        serialNumber: `RLP-DELL-${Date.now()}`
      }
    };

    const createRes = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: '/api/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, productPayload);

    if (createRes.status !== 201 || !createRes.data.product?._id) {
      throw new Error(`Product creation failed: ${JSON.stringify(createRes.data)}`);
    }
    createdProductId = createRes.data.product._id;
    console.log(`✓ Product created successfully in MongoDB (ID: ${createdProductId}).`);

    // 4. Verify storefront visibility
    console.log('[4] Verifying immediate storefront discovery via search & category endpoints...');
    const searchRes = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: `/api/products?search=${encodeURIComponent('Workstation Pro')}`,
      method: 'GET'
    });

    if (searchRes.status !== 200 || !searchRes.data.products?.length) {
      throw new Error(`Storefront search failed: ${JSON.stringify(searchRes.data)}`);
    }
    const foundProduct = searchRes.data.products.find(p => p._id === createdProductId || p.title.includes('Workstation Pro'));
    if (!foundProduct) {
      throw new Error('Created product was not found in storefront search results.');
    }
    console.log(`✓ Product discovered in search results: "${foundProduct.title}" (Primary Image: ${foundProduct.images[0]})`);

    // 5. Verify direct product lookup
    console.log(`[5] Verifying single product detail retrieval (GET /api/products/${createdProductId})...`);
    const detailRes = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: `/api/products/${createdProductId}`,
      method: 'GET'
    });

    if (detailRes.status !== 200 || detailRes.data.product?.title !== productPayload.title) {
      throw new Error(`Detail lookup failed: ${JSON.stringify(detailRes.data)}`);
    }
    console.log(`✓ Single product detail matched correctly: "${detailRes.data.product.title}".`);

    console.log('\n======================================================');
    console.log('✓ ALL UPLOAD & CATALOGUE SYNC TESTS PASSED PERFECTLY!');
    console.log('======================================================\n');
  } finally {
    // Cleanup created test product & image file
    if (createdProductId) {
      console.log('[Cleanup] Deleting test product from database...');
      const Product = require('../models/Product');
      await Product.findByIdAndDelete(createdProductId);
      console.log('✓ Test product removed from MongoDB.');
    }
    if (uploadedFilePath) {
      console.log('[Cleanup] Removing test uploaded file from disk...');
      const diskPath = path.resolve(__dirname, '../../client/public', uploadedFilePath.replace(/^\//, ''));
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
        console.log('✓ Test image file deleted from disk.');
      }
    }
    server.close();
    await mongoose.disconnect();
  }
}

runUploadSyncTest().catch(err => {
  console.error('FATAL TEST ERROR:', err);
  process.exit(1);
});
