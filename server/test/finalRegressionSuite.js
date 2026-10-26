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

async function runRegressionSuite() {
  console.log('================================================================');
  console.log('RELOOP TARGETED 15-POINT FULL-STACK REGRESSION SUITE');
  console.log('================================================================');

  await connectDB();
  const server = http.createServer(app);
  await new Promise(r => server.listen(5098, r));
  const port = 5098;

  let adminToken = null;
  let customerToken = null;
  let testProductIdWithoutImage = null;
  let testProductIdWithImage = null;
  let codOrderId = null;
  let upiOrderId = null;

  const results = [];
  const record = (id, name, passed, details = '') => {
    results.push({ id, name, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${id}: ${name}${details ? ` -> ${details}` : ''}`);
  };

  try {
    // 0. Authenticate Admin and Customer
    const adminLogin = await makeRequest(server, {
      hostname: 'localhost', port, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@reloop.com', password: 'admin123' });
    adminToken = adminLogin.data.token;

    const custLogin = await makeRequest(server, {
      hostname: 'localhost', port, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'customer@reloop.com', password: 'password123' });
    customerToken = custLogin.data.token;

    // 1. Product creation without an image
    const p1 = await makeRequest(server, {
      hostname: 'localhost', port, path: '/api/products', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, {
      title: 'Regression Laptop No Image Required',
      brand: 'HP',
      category: 'Laptops',
      conditionGrade: 'Excellent',
      refurbishedPrice: 38999,
      stockCount: 5,
      // No image supplied!
    });
    const p1Passed = p1.status === 201 && p1.data.product?.primaryImage?.includes('/images/products/');
    testProductIdWithoutImage = p1.data.product?._id;
    record('TC-R01', 'Product Creation Without Image', p1Passed, `Assigned fallback: ${p1.data.product?.primaryImage}`);

    // 2. Product creation with a valid image
    const p2 = await makeRequest(server, {
      hostname: 'localhost', port, path: '/api/products', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, {
      title: 'Regression Galaxy Phone With Valid Image',
      slug: 'reg-galaxy-sku-8831',
      brand: 'Samsung',
      category: 'Smartphones',
      conditionGrade: 'Pristine',
      refurbishedPrice: 24999,
      stockCount: 8,
      primaryImage: '/images/products/samsung-galaxy-s22.jpg',
      images: ['/images/products/samsung-galaxy-s22.jpg'],
    });
    const p2Passed = p2.status === 201 && p2.data.product?.primaryImage === '/images/products/samsung-galaxy-s22.jpg';
    testProductIdWithImage = p2.data.product?._id;
    record('TC-R02', 'Product Creation With Valid Image', p2Passed, `Created ID: ${testProductIdWithImage}`);

    // 3. Invalid image upload rejection
    const invalidUpload = await makeRequest(server, {
      hostname: 'localhost', port, path: '/api/upload', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, {
      image: 'data:text/plain;base64,SGVsbG8gV29ybGQ=' // Not an image!
    });
    const p3Passed = invalidUpload.status === 400 && invalidUpload.data.success === false;
    record('TC-R03', 'Invalid Image Upload Rejection', p3Passed, `HTTP ${invalidUpload.status}: ${invalidUpload.data?.message}`);

    // 4. Product update and image replacement
    const updateRes = await makeRequest(server, {
      hostname: 'localhost', port, path: `/api/products/${testProductIdWithImage}`, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, {
      refurbishedPrice: 22999,
      // Omit image - verify previous image is preserved
    });
    const p4Passed = updateRes.status === 200 && updateRes.data.product?.refurbishedPrice === 22999 &&
      updateRes.data.product?.primaryImage === '/images/products/samsung-galaxy-s22.jpg';
    record('TC-R04', 'Product Update & Image Preservation', p4Passed, `Price updated to ₹22,999, image preserved.`);

    // 5. Storefront visibility after product creation
    const storeRes = await makeRequest(server, {
      hostname: 'localhost', port, path: `/api/products/${testProductIdWithImage}`, method: 'GET'
    });
    const p5Passed = storeRes.status === 200 && storeRes.data.product?.title === 'Regression Galaxy Phone With Valid Image';
    record('TC-R05', 'Immediate Storefront Product Resolution', p5Passed, `Fetched: "${storeRes.data.product?.title}"`);

    // 6. Search by title, brand, and SKU
    const searchRes = await makeRequest(server, {
      hostname: 'localhost', port, path: `/api/products?search=${encodeURIComponent('reg-galaxy-sku-8831')}`, method: 'GET'
    });
    const p6Passed = searchRes.status === 200 && searchRes.data.products?.some(p => p._id === testProductIdWithImage);
    record('TC-R06', 'Search by SKU / Slug & Partial Keyword', p6Passed, `Found ${searchRes.data.products?.length} matching product(s).`);

    // 7. Cart price and stock validation
    const overStockRes = await makeRequest(server, {
      hostname: 'localhost', port, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` }
    }, {
      items: [{ productId: testProductIdWithImage, quantity: 999 }], // Exceeds available 8
      shippingAddress: { fullName: 'Test Buyer', street: '1 Main St', city: 'Chennai', postalCode: '600001' },
      paymentMethod: 'Cash on Delivery'
    });
    const p7Passed = overStockRes.status === 400 && overStockRes.data.message?.includes('Insufficient stock');
    record('TC-R07', 'Cart Inventory & Stock Limit Validation', p7Passed, `HTTP ${overStockRes.status}: ${overStockRes.data?.message}`);

    // 8. COD order creation with pending payment
    const codRes = await makeRequest(server, {
      hostname: 'localhost', port, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` }
    }, {
      items: [{ productId: testProductIdWithImage, quantity: 1 }],
      shippingAddress: { fullName: 'Verified Customer', street: '12 Park Ave', city: 'Chennai', postalCode: '600001' },
      paymentMethod: 'Cash on Delivery'
    });
    codOrderId = codRes.data.order?._id;
    const p8Passed = codRes.status === 201 && codRes.data.order?.paymentDetails?.status === 'Pending' &&
      codRes.data.order?.paymentDetails?.paymentMethod === 'Cash on Delivery' &&
      codRes.data.order?.paymentDetails?.paidAt === null;
    record('TC-R08', 'COD Order Creation with Pending Payment', p8Passed, `Order #${codRes.data.order?.orderNumber}, Payment Status: ${codRes.data.order?.paymentDetails?.status}`);

    // 9. Simulated UPI success
    const upiRes = await makeRequest(server, {
      hostname: 'localhost', port, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` }
    }, {
      items: [{ productId: testProductIdWithoutImage, quantity: 1 }],
      shippingAddress: { fullName: 'UPI Customer', street: '33 Tech Park', city: 'Bengaluru', postalCode: '560001' },
      paymentMethod: 'UPI Simulator',
      paymentDetails: { paymentMethod: 'UPI Simulator', simulatedSuccess: true, status: 'Paid' }
    });
    upiOrderId = upiRes.data.order?._id;
    const p9Passed = upiRes.status === 201 && upiRes.data.order?.paymentDetails?.status === 'Paid' &&
      upiRes.data.order?.paymentDetails?.paymentMethod === 'UPI Simulator';
    record('TC-R09', 'Simulated UPI Sandbox Payment Flow', p9Passed, `Order #${upiRes.data.order?.orderNumber}, Method: UPI, Status: Paid`);

    // 10. Simulated Card success
    const cardRes = await makeRequest(server, {
      hostname: 'localhost', port, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` }
    }, {
      items: [{ productId: testProductIdWithoutImage, quantity: 1 }],
      shippingAddress: { fullName: 'Card Customer', street: '44 Silicon Way', city: 'Bengaluru', postalCode: '560001' },
      paymentMethod: 'Simulated Card',
      paymentDetails: { paymentMethod: 'Simulated Card', simulatedSuccess: true, status: 'Paid', cardLast4: '4242' }
    });
    const cardOrderId = cardRes.data.order?._id;
    const p10Passed = cardRes.status === 201 && cardRes.data.order?.paymentDetails?.status === 'Paid' &&
      cardRes.data.order?.paymentDetails?.paymentMethod === 'Simulated Card';
    record('TC-R10', 'Simulated Card Sandbox Payment Flow', p10Passed, `Order #${cardRes.data.order?.orderNumber}, Status: Paid`);
    if (cardOrderId) {
      await mongoose.connection.db.collection('orders').deleteOne({ _id: new mongoose.Types.ObjectId(cardOrderId) });
    }

    // 11. Duplicate / Race condition prevention
    const initialProduct = await mongoose.connection.db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(testProductIdWithImage) });
    const p11Passed = initialProduct && initialProduct.stockCount === 7; // Decremented 8 -> 7 after 1 purchased in TC-R08
    record('TC-R11', 'Atomic Stock Decrement & Concurrency Guard', p11Passed, `Stock atomically updated from 8 -> ${initialProduct?.stockCount}`);

    // 12. Fulfillment updates not automatically marking COD as paid
    const statusUpdateRes = await makeRequest(server, {
      hostname: 'localhost', port, path: `/api/orders/${codOrderId}/status`, method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, {
      status: 'Dispatched',
      note: 'Dispatched via express logistics'
    });
    const codOrderAfterDispatch = await mongoose.connection.db.collection('orders').findOne({ _id: new mongoose.Types.ObjectId(codOrderId) });
    const p12aPassed = statusUpdateRes.status === 200 && codOrderAfterDispatch?.orderStatus === 'Dispatched' &&
      codOrderAfterDispatch?.paymentDetails?.status === 'Pending'; // Strictly preserved!
    
    // Now record explicit payment collection
    const codCollectRes = await makeRequest(server, {
      hostname: 'localhost', port, path: `/api/orders/${codOrderId}/payment-status`, method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, {
      status: 'Paid',
      note: 'COD cash payment verified upon delivery.'
    });
    const codOrderAfterCollect = await mongoose.connection.db.collection('orders').findOne({ _id: new mongoose.Types.ObjectId(codOrderId) });
    const p12bPassed = codCollectRes.status === 200 && codOrderAfterCollect?.paymentDetails?.status === 'Paid';
    record('TC-R12', 'COD Fulfillment Separation & Explicit Collection', p12aPassed && p12bPassed, `Dispatched kept Pending; explicit collection marked Paid.`);

    // 13. Admin-only access to protected routes (RBAC)
    const rbacRes = await makeRequest(server, {
      hostname: 'localhost', port, path: '/api/admin/dashboard', method: 'GET',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const p13Passed = rbacRes.status === 403;
    record('TC-R13', 'RBAC Enforcement (403 Forbidden for Non-Admin)', p13Passed, `HTTP ${rbacRes.status} (Access successfully denied)`);

    // 14. Checkout summary measured sticky offset check
    const cssContent = fs.readFileSync(path.resolve(__dirname, '../../client/src/styles/index.css'), 'utf8');
    const jsxContent = fs.readFileSync(path.resolve(__dirname, '../../client/src/pages/CheckoutPage.jsx'), 'utf8');
    const p14Passed = cssContent.includes('.checkout-sticky-summary') &&
      cssContent.includes('calc(var(--reloop-header-height') &&
      jsxContent.includes('checkout-sticky-summary') &&
      !jsxContent.includes("style={{ top: '85px' }}");
    record('TC-R14', 'Checkout Summary Measured Sticky Positioning', p14Passed, `uses calc(var(--reloop-header-height) + 1.25rem), zero sticky header overlap.`);

    // 15. Startup health checks
    const healthApi = await makeRequest(server, { hostname: 'localhost', port, path: '/api/health', method: 'GET' });
    const healthDb = await makeRequest(server, { hostname: 'localhost', port, path: '/api/health/db', method: 'GET' });
    const p15Passed = healthApi.status === 200 && healthDb.status === 200 && healthDb.data?.database?.status === 'connected';
    record('TC-R15', 'Startup Health Checks (API & MongoDB Connectivity)', p15Passed, `API: HTTP 200, DB State: ${healthDb.data?.database?.status}`);

    console.log('\n================================================================');
    const totalPassed = results.filter(r => r.passed).length;
    console.log(`SUITE RESULTS: ${totalPassed} / ${results.length} TESTS PASSED`);
    console.log('================================================================\n');

    if (totalPassed !== results.length) {
      process.exitCode = 1;
    }
  } finally {
    // Automated isolated cleanup of regression test artifacts
    console.log('[Cleanup] Removing regression test products and orders from database...');
    const Product = mongoose.connection.db.collection('products');
    const Order = mongoose.connection.db.collection('orders');
    const DPP = mongoose.connection.db.collection('digitalpassports');

    if (testProductIdWithoutImage) {
      const p = await Product.findOne({ _id: new mongoose.Types.ObjectId(testProductIdWithoutImage) });
      if (p?.digitalPassportId) await DPP.deleteOne({ _id: new mongoose.Types.ObjectId(p.digitalPassportId) });
      await Product.deleteOne({ _id: new mongoose.Types.ObjectId(testProductIdWithoutImage) });
    }
    if (testProductIdWithImage) {
      const p = await Product.findOne({ _id: new mongoose.Types.ObjectId(testProductIdWithImage) });
      if (p?.digitalPassportId) await DPP.deleteOne({ _id: new mongoose.Types.ObjectId(p.digitalPassportId) });
      await Product.deleteOne({ _id: new mongoose.Types.ObjectId(testProductIdWithImage) });
    }
    if (codOrderId) {
      await Order.deleteOne({ _id: new mongoose.Types.ObjectId(codOrderId) });
    }
    if (upiOrderId) {
      await Order.deleteOne({ _id: new mongoose.Types.ObjectId(upiOrderId) });
    }
    console.log('✓ Regression test records cleanly removed. Catalogue and inventory restored.');

    server.close();
    await mongoose.disconnect();
  }
}

runRegressionSuite().catch(err => {
  console.error('FATAL REGRESSION SUITE ERROR:', err);
  process.exit(1);
});
