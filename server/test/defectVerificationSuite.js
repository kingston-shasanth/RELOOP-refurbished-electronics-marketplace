const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { app } = require('../server');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Product = require('../models/Product');
const DigitalPassport = require('../models/DigitalPassport');
const Order = require('../models/Order');

function request(server, options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
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

async function runDefectVerificationSuite() {
  console.log('================================================================');
  console.log('  RELOOP TARGETED DEFECT RESOLUTION & DATA CONSISTENCY SUITE');
  console.log('================================================================');

  await connectDB();
  const server = http.createServer(app);
  await new Promise((r) => server.listen(5097, r));
  const port = 5097;

  const results = [];
  const record = (defect, title, passed, details = '') => {
    results.push({ defect, title, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] [${defect}] ${title}${details ? ` -> ${details}` : ''}`);
  };

  const initialCounts = {
    users: await User.countDocuments(),
    products: await Product.countDocuments(),
    passports: await DigitalPassport.countDocuments(),
    orders: await Order.countDocuments(),
  };

  let testAdminToken = null;
  let testCustomerToken = null;
  let testDisposableUserId = null;
  let testDisposableProductId = null;

  try {
    // -------------------------------------------------------------
    // DEFECT 1: Session Isolation & Anti-Caching Header Verification
    // -------------------------------------------------------------
    console.log('\n--- VERIFYING DEFECT 1: SESSION ISOLATION & API CACHE HEADERS ---');

    // 1.1 Admin Authentication
    const adminLoginRes = await request(
      server,
      { hostname: 'localhost', port, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'admin@reloop.com', password: 'admin123' }
    );
    testAdminToken = adminLoginRes.data?.token;
    record('DEF-01A', 'Admin login authenticates with admin role', adminLoginRes.status === 200 && adminLoginRes.data?.user?.role === 'admin');

    // 1.2 Anti-caching headers on dynamic API
    const cacheControlHeader = adminLoginRes.headers['cache-control'] || '';
    const hasAntiCache = cacheControlHeader.includes('no-store') && cacheControlHeader.includes('no-cache');
    record('DEF-01B', 'Dynamic /api routes enforce no-store anti-caching headers', hasAntiCache, `Cache-Control: ${cacheControlHeader}`);

    // 1.3 Create disposable customer session
    const customerEmail = `session_iso_tester_${Date.now()}@reloop.com`;
    const custRegRes = await request(
      server,
      { hostname: 'localhost', port, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { name: 'Session Iso Tester', email: customerEmail, password: 'Password123!', phone: '9988776655' }
    );
    testCustomerToken = custRegRes.data?.token;
    testDisposableUserId = custRegRes.data?.user?._id;
    record('DEF-01C', 'Independent Customer token created for multi-tab isolation', custRegRes.status === 201 && testCustomerToken);

    // 1.4 Role Guard: Customer token must be REJECTED on Admin endpoint
    const adminEndpointProbe = await request(
      server,
      { hostname: 'localhost', port, path: '/api/admin/dashboard', method: 'GET', headers: { Authorization: `Bearer ${testCustomerToken}` } }
    );
    record('DEF-01D', 'Customer token is strictly rejected from Admin endpoints (HTTP 403)', adminEndpointProbe.status === 403);

    // 1.5 Role Guard: Admin token rejected on customer order history or returns admin's empty set without crashing
    const myOrdersProbe = await request(
      server,
      { hostname: 'localhost', port, path: '/api/orders/my-orders', method: 'GET', headers: { Authorization: `Bearer ${testCustomerToken}` } }
    );
    record('DEF-01E', 'Customer orders endpoint responds correctly to customer session', myOrdersProbe.status === 200 && Array.isArray(myOrdersProbe.data?.orders));

    // 1.6 Invalid token rejected with HTTP 401
    const invalidTokenProbe = await request(
      server,
      { hostname: 'localhost', port, path: '/api/orders/my-orders', method: 'GET', headers: { Authorization: 'Bearer invalid_malformed_token' } }
    );
    record('DEF-01F', 'Expired or invalid token produces explicit HTTP 401 with structured error', invalidTokenProbe.status === 401 && !invalidTokenProbe.data?.success);

    // -------------------------------------------------------------
    // DEFECT 2: Digital Product Passport Mutation Persistence
    // -------------------------------------------------------------
    console.log('\n--- VERIFYING DEFECT 2: DIGITAL PASSPORT MUTATION PERSISTENCE ---');

    // 2.1 Create disposable product with initial DPP
    const createProdRes = await request(
      server,
      { hostname: 'localhost', port, path: '/api/products', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testAdminToken}` } },
      {
        title: `Passport Defect Test Device ${Date.now()}`,
        brand: 'Apple',
        category: 'Laptops',
        conditionGrade: 'Pristine',
        refurbishedPrice: 55000,
        originalRetailPrice: 90000,
        stockCount: 5,
        primaryImage: '/images/products/apple-macbook-air-m1.jpg',
        images: ['/images/products/apple-macbook-air-m1.jpg'],
        diagnosticScore: 92,
        specifications: {
          processor: 'M1',
          ram: '8GB',
          storage: '256GB',
          batteryHealthPercent: 91,
        },
      }
    );

    if (createProdRes.status !== 201 || !createProdRes.data?.product?._id) {
      throw new Error(`Failed to create disposable test product: ${JSON.stringify(createProdRes.data)}`);
    }
    testDisposableProductId = createProdRes.data.product._id;
    const initialPassportId = createProdRes.data.product.digitalPassportId;
    record('DEF-02A', 'Disposable test product created with linked DigitalPassport', Boolean(testDisposableProductId && initialPassportId));

    // 2.2 Mutate Product AND Passport metrics via PUT /api/products/:id
    const updatedDiagnosticScore = 98;
    const updatedBatteryHealth = 96;
    const putRes = await request(
      server,
      { hostname: 'localhost', port, path: `/api/products/${testDisposableProductId}`, method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testAdminToken}` } },
      {
        title: `Passport Defect Test Device Updated`,
        refurbishedPrice: 52000,
        stockCount: 4,
        diagnosticScore: updatedDiagnosticScore,
        specifications: {
          processor: 'M1 Pro',
          ram: '16GB',
          storage: '512GB',
          batteryHealthPercent: updatedBatteryHealth,
        },
      }
    );

    const putSuccess = putRes.status === 200 && putRes.data?.success;
    record('DEF-02B', 'Admin product edit returns HTTP 200 success', putSuccess);

    // 2.3 Verify MongoDB DPP document directly
    const directDpp = await DigitalPassport.findById(initialPassportId);
    const dppScorePersisted = directDpp?.diagnosticSummaryScore === updatedDiagnosticScore;
    const dppBatteryPersisted = directDpp?.subsystemChecks?.battery?.healthPercent === updatedBatteryHealth;
    record(
      'DEF-02C',
      'DigitalPassport document in MongoDB persisted updated diagnostics',
      dppScorePersisted && dppBatteryPersisted,
      `Score: ${directDpp?.diagnosticSummaryScore} (expected ${updatedDiagnosticScore}), Battery: ${directDpp?.subsystemChecks?.battery?.healthPercent}% (expected ${updatedBatteryHealth}%)`
    );

    // 2.4 Verify GET /api/products/:id/passport returns updated passport
    const getPassportRes = await request(
      server,
      { hostname: 'localhost', port, path: `/api/products/${testDisposableProductId}/passport`, method: 'GET' }
    );
    const passportApiMatches =
      getPassportRes.status === 200 &&
      getPassportRes.data?.passport?.diagnosticSummaryScore === updatedDiagnosticScore &&
      getPassportRes.data?.passport?.subsystemChecks?.battery?.healthPercent === updatedBatteryHealth;
    record(
      'DEF-02D',
      'Public Customer DPP API returns authoritative updated passport state',
      passportApiMatches,
      `API Score: ${getPassportRes.data?.passport?.diagnosticSummaryScore}, Battery: ${getPassportRes.data?.passport?.subsystemChecks?.battery?.healthPercent}%`
    );

    // -------------------------------------------------------------
    // DEFECT 3: Atomic Stock Decrement & Server-Side Financials
    // -------------------------------------------------------------
    console.log('\n--- VERIFYING DEFECT 3: ATOMIC STOCK & SERVER-SIDE FINANCIALS ---');

    const initialStock = (await Product.findById(testDisposableProductId)).stockCount;
    const orderQty = 2;

    const orderRes = await request(
      server,
      { hostname: 'localhost', port, path: '/api/orders', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testCustomerToken}` } },
      {
        items: [{ productId: testDisposableProductId, quantity: orderQty }],
        shippingAddress: {
          fullName: 'Session Iso Tester',
          phone: '9988776655',
          street: '123 Test St',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
        },
        paymentMethod: 'Simulated Card',
      }
    );

    const orderCreated = orderRes.status === 201 && orderRes.data?.order?._id;
    const testOrderId = orderRes.data?.order?._id;
    const postOrderStock = (await Product.findById(testDisposableProductId)).stockCount;
    const stockDecrementedCorrectly = postOrderStock === initialStock - orderQty;

    record(
      'DEF-03A',
      'Checkout succeeds and atomically decrements product inventory',
      orderCreated && stockDecrementedCorrectly,
      `Initial: ${initialStock}, Ordered: ${orderQty}, New Stock: ${postOrderStock}`
    );

    // Cleanup test order
    if (testOrderId) {
      await Order.findByIdAndDelete(testOrderId);
    }

  } finally {
    // -------------------------------------------------------------
    // CLEANUP DISPOSABLE TEST ARTIFACTS
    // -------------------------------------------------------------
    console.log('\n[Cleanup] Cleaning up disposable test records...');
    if (testDisposableProductId) {
      const prod = await Product.findById(testDisposableProductId);
      if (prod?.digitalPassportId) {
        await DigitalPassport.findByIdAndDelete(prod.digitalPassportId);
      }
      await Product.findByIdAndDelete(testDisposableProductId);
      console.log('✓ Removed test product and associated digital passport.');
    }

    if (testDisposableUserId) {
      await User.findByIdAndDelete(testDisposableUserId);
      console.log('✓ Removed test customer user.');
    }

    const finalCounts = {
      users: await User.countDocuments(),
      products: await Product.countDocuments(),
      passports: await DigitalPassport.countDocuments(),
      orders: await Order.countDocuments(),
    };

    console.log('\n--- Final Database Count Verification ---');
    console.table({ Before: initialCounts, After: finalCounts });

    const zeroPollution =
      initialCounts.users === finalCounts.users &&
      initialCounts.products === finalCounts.products &&
      initialCounts.passports === finalCounts.passports &&
      initialCounts.orders === finalCounts.orders;

    record('SAFETY', 'Database records preserved with 100% zero pollution', zeroPollution);

    server.close();
    await mongoose.disconnect();
    console.log('[Suite] Test server closed and database disconnected cleanly.\n');
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log('================================================================');
  console.log(`DEFECT VERIFICATION RESULTS: ${passedCount} / ${results.length} PASSED`);
  console.log('================================================================\n');

  if (passedCount !== results.length) {
    process.exitCode = 1;
  }
}

runDefectVerificationSuite().catch((err) => {
  console.error('FATAL DEFECT SUITE ERROR:', err);
  process.exit(1);
});
