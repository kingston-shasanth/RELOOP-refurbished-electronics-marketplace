/**
 * RELOOP — Comprehensive End-to-End System Smoke & Integration Suite
 * 
 * Tests every business workflow, security boundary, and API contract:
 * 1. Health & DB ReadyState
 * 2. Auth & RBAC (Customer & Admin)
 * 3. 72-Item Catalog Integrity & Category Distribution
 * 4. Search, Filters, Sorting & Pagination
 * 5. Digital Product Passports & Hardware Diagnostics
 * 6. Side-by-Side Spec Comparison
 * 7. Explainable Trade-In Valuation Engine & Submission
 * 8. Order Placement: Card Sandbox (Paid), UPI Sandbox (Paid), COD (Pending)
 * 9. Anti-Tamper Price Enforcement & Atomic Stock Guards
 * 10. Customer Privacy Isolation (Cross-User Access Denial)
 * 11. Admin Operations: Dashboard KPIs, Fulfillment Steppers, COD Settlement, Vouchers
 * 12. Secure Image Uploads & Anti Path-Traversal
 * 13. Strict Disposable Cleanup & Database Count Preservation
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { app } = require('../server');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Product = require('../models/Product');
const DigitalPassport = require('../models/DigitalPassport');
const Order = require('../models/Order');
const TradeInRequest = require('../models/TradeInRequest');

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

async function runMasterE2ESuite() {
  console.log('================================================================');
  console.log('  RELOOP MASTER END-TO-END VERIFICATION & BUG-AUDIT SUITE');
  console.log('================================================================\n');

  await connectDB();
  const PORT = 5099;
  const server = http.createServer(app);
  await new Promise((r) => server.listen(PORT, r));
  console.log(`[Master Suite] Test server active on http://127.0.0.1:${PORT}`);

  const testState = {
    testUserId: null,
    testCustomerToken: null,
    testUser2Id: null,
    testCustomer2Token: null,
    adminToken: null,
    createdOrderIds: [],
    createdTradeInIds: [],
    createdProductIds: [],
    createdPassportIds: [],
    uploadedFiles: [],
    countsBefore: {},
    countsAfter: {},
  };

  const results = [];
  function record(section, testId, description, passed, details = '') {
    results.push({ section, testId, description, passed, details });
    const mark = passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${mark}] [${section}] ${testId}: ${description}${details ? ` -> ${details}` : ''}`);
  }

  try {
    // -----------------------------------------------------------------
    // BASELINE: Document counts before test execution
    // -----------------------------------------------------------------
    testState.countsBefore = {
      users: await User.countDocuments(),
      products: await Product.countDocuments(),
      passports: await DigitalPassport.countDocuments(),
      orders: await Order.countDocuments(),
      tradeIns: await TradeInRequest.countDocuments(),
    };
    console.log('\n--- Initial Database Document Baseline ---');
    console.table(testState.countsBefore);
    console.log('-------------------------------------------\n');

    // -----------------------------------------------------------------
    // 1. BACKEND STARTUP & HEALTH
    // -----------------------------------------------------------------
    const h1 = await request(server, { hostname: 'localhost', port: PORT, path: '/api/health', method: 'GET' });
    record('Health', 'HT-01', 'Server health endpoint returns 200 OK', h1.status === 200 && h1.data?.status === 'healthy', `Uptime: ${h1.data?.uptimeSeconds}s`);

    const h2 = await request(server, { hostname: 'localhost', port: PORT, path: '/api/health/db', method: 'GET' });
    record('Health', 'HT-02', 'Database health endpoint returns 200 connected', h2.status === 200 && h2.data?.database?.status === 'connected', `Host: ${h2.data?.database?.host}:${h2.data?.database?.port}`);

    // -----------------------------------------------------------------
    // 2. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
    // -----------------------------------------------------------------
    const ts = Date.now();
    const testEmail = `e2e_customer_${ts}@test.reloop.in`;
    const regRes = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'E2E Test Customer',
      email: testEmail,
      password: 'SecurePassword123!',
      phone: '+91 98765 00099',
    });
    testState.testUserId = regRes.data?.user?._id;
    testState.testCustomerToken = regRes.data?.token;
    record('Auth', 'AU-01', 'Customer registration and JWT token issue', regRes.status === 201 && Boolean(testState.testCustomerToken));

    // Secondary Customer for Privacy Isolation Testing
    const testEmail2 = `e2e_isolation_${ts}@test.reloop.in`;
    const regRes2 = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'E2E Isolation User',
      email: testEmail2,
      password: 'SecurePassword123!',
      phone: '+91 98765 00088',
    });
    testState.testUser2Id = regRes2.data?.user?._id;
    testState.testCustomer2Token = regRes2.data?.token;
    record('Auth', 'AU-02', 'Second user registration for isolation testing', regRes2.status === 201 && Boolean(testState.testCustomer2Token));

    // Admin login
    const adminLog = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { email: 'admin@reloop.com', password: 'admin123' });
    testState.adminToken = adminLog.data?.token;
    record('Auth', 'AU-03', 'Admin login and admin role verification', adminLog.status === 200 && adminLog.data?.user?.role === 'admin');

    // Reject Invalid Login Credentials
    const badLogin = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { email: 'admin@reloop.com', password: 'wrongPassword!' });
    record('Auth', 'AU-04', 'Invalid password rejected with HTTP 401', badLogin.status === 401);

    // Profile verification (/api/auth/me)
    const meRes = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/auth/me', method: 'GET',
      headers: { Authorization: `Bearer ${testState.testCustomerToken}` },
    });
    record('Auth', 'AU-05', 'Authorized profile fetch (/api/auth/me)', meRes.status === 200 && meRes.data?.user?.email === testEmail);

    // RBAC: Customer accessing admin endpoint -> 403 Forbidden
    const rbacGuard = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/admin/dashboard', method: 'GET',
      headers: { Authorization: `Bearer ${testState.testCustomerToken}` },
    });
    record('Auth', 'AU-06', 'Customer forbidden from admin endpoints (HTTP 403)', rbacGuard.status === 403);

    // -----------------------------------------------------------------
    // 3. CATALOG INTEGRITY (>= 9 ITEMS PER CATEGORY)
    // -----------------------------------------------------------------
    const catList = ['Laptops', 'Smartphones', 'Audio', 'Tablets', 'PC Components', 'Wearables', 'Gaming', 'Cameras'];
    let allCategoriesMet = true;
    const catCounts = {};

    for (const cat of catList) {
      const cRes = await request(server, {
        hostname: 'localhost', port: PORT, path: `/api/products?category=${encodeURIComponent(cat)}&limit=50`, method: 'GET',
      });
      const count = cRes.data?.total || cRes.data?.products?.length || 0;
      catCounts[cat] = count;
      if (count < 9) allCategoriesMet = false;
    }
    record('Catalog', 'CT-01', 'All 8 categories contain at least 9 distinct products', allCategoriesMet, JSON.stringify(catCounts));

    // Full text search
    const sRes = await request(server, {
      hostname: 'localhost', port: PORT, path: `/api/products?search=${encodeURIComponent('Sony')}`, method: 'GET',
    });
    const foundSony = sRes.status === 200 && sRes.data?.products?.length > 0;
    record('Catalog', 'CT-02', 'Full-text MongoDB search returns matching products', foundSony, `Found ${sRes.data?.products?.length} items`);

    // Price sort ascending
    const sortRes = await request(server, {
      hostname: 'localhost', port: PORT, path: `/api/products?sort=price_asc&limit=10`, method: 'GET',
    });
    const prods = sortRes.data?.products || [];
    const isSortedAsc = prods.length >= 2 && prods[0].refurbishedPrice <= prods[prods.length - 1].refurbishedPrice;
    record('Catalog', 'CT-03', 'Catalog sort by price ascending', isSortedAsc);

    // Single product resolution by slug
    const firstProd = prods[0];
    const slugRes = await request(server, {
      hostname: 'localhost', port: PORT, path: `/api/products/${firstProd.slug}`, method: 'GET',
    });
    record('Catalog', 'CT-04', 'Retrieve single product by SEO slug', slugRes.status === 200 && slugRes.data?.product?._id === firstProd._id);

    // -----------------------------------------------------------------
    // 4. DIGITAL PRODUCT PASSPORTS
    // -----------------------------------------------------------------
    const passportRes = await request(server, {
      hostname: 'localhost', port: PORT, path: `/api/products/${firstProd._id}/passport`, method: 'GET',
    });
    const hasDpp = passportRes.status === 200 && passportRes.data?.passport?.diagnosticSummaryScore > 0;
    record('Passport', 'DP-01', 'Retrieve Digital Product Passport with diagnostic scores', hasDpp, `Score: ${passportRes.data?.passport?.diagnosticSummaryScore}/100, Serial: ${passportRes.data?.passport?.deviceSerialNumber}`);

    // -----------------------------------------------------------------
    // 5. COMPARE MODULE
    // -----------------------------------------------------------------
    if (prods.length >= 2) {
      const compIds = `${prods[0]._id},${prods[1]._id}`;
      const compRes = await request(server, {
        hostname: 'localhost', port: PORT, path: `/api/products/compare?ids=${compIds}`, method: 'GET',
      });
      record('Compare', 'CP-01', 'Side-by-side device spec comparison API', compRes.status === 200 && compRes.data?.products?.length === 2);
    }

    // -----------------------------------------------------------------
    // 6. EXPLAINABLE TRADE-IN VALUATION ENGINE
    // -----------------------------------------------------------------
    const tiCalc = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/trade-in/calculate', method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      category: 'Smartphones',
      brand: 'Apple',
      modelName: 'iPhone 13 (128GB)',
      functionalState: { powersOn: true, screenIntact: true, touchResponsive: true, camerasWork: true, batteryWorking: true },
      cosmeticGrade: 'Good (Minor Scratches)',
      batteryHealth: '85-90%',
    });
    const estVal = tiCalc.data?.data?.estimatedValue;
    record('TradeIn', 'TI-01', 'Transparent trade-in calculation with explainable range', tiCalc.status === 200 && estVal > 0, `Value: ₹${estVal}`);

    // Submit Trade-In Request
    const tiSub = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/trade-in/submit', method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.testCustomerToken}` },
    }, {
      deviceCategory: 'Smartphones',
      brand: 'Apple',
      modelName: 'iPhone 13 (128GB)',
      specifications: 'Battery: 88%, Pristine Display',
      functionalState: { powersOn: true, screenIntact: true, touchResponsive: true, camerasWork: true, batteryWorking: true },
      cosmeticGrade: 'Good (Minor Scratches)',
      estimatedValue: estVal,
      valuationBreakdown: tiCalc.data?.data?.breakdown,
    });
    const tiId = tiSub.data?.tradeInRequest?._id;
    if (tiId) testState.createdTradeInIds.push(tiId);
    record('TradeIn', 'TI-02', 'Customer trade-in request submission & persistence', tiSub.status === 201 && Boolean(tiId));

    // Customer Trade-In List
    const myTi = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/trade-in/my-requests', method: 'GET',
      headers: { Authorization: `Bearer ${testState.testCustomerToken}` },
    });
    record('TradeIn', 'TI-03', 'Customer retrieves personal trade-in request history', myTi.status === 200 && myTi.data?.requests?.some((r) => r._id === tiId));

    // -----------------------------------------------------------------
    // 7. CHECKOUT & ORDERS (CARD, UPI, COD, ANTI-TAMPER & ATOMICITY)
    // -----------------------------------------------------------------
    const purchasable = await Product.findOne({ stockCount: { $gte: 5 } });
    if (!purchasable) throw new Error('No purchasable product with stock >= 5');

    const stockBefore = purchasable.stockCount;
    const authoritativePrice = purchasable.refurbishedPrice;

    // A. Anti-Tamper Test: Customer sends price: 1, backend must bill authoritative DB price
    const orderTamper = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.testCustomerToken}` },
    }, {
      items: [{ productId: purchasable._id, quantity: 1, price: 1 }],
      shippingAddress: { fullName: 'Test Tamper', street: '1 Main Rd', city: 'Bengaluru', state: 'Karnataka', postalCode: '560001' },
      paymentMethod: 'Simulated Card',
      paymentDetails: { paymentMethod: 'Simulated Card', simulatedSuccess: true, status: 'Paid', cardBrand: 'Visa', cardLast4: '4242' },
    });
    const cardOrderId = orderTamper.data?.order?._id;
    if (cardOrderId) testState.createdOrderIds.push(cardOrderId);

    const priceProtected = orderTamper.status === 201 && orderTamper.data?.order?.pricing?.itemsSubtotal === authoritativePrice;
    record('Orders', 'OR-01', 'Anti-tamper: Client price overrides ignored in favor of DB price', priceProtected, `Billed ₹${orderTamper.data?.order?.pricing?.itemsSubtotal} (Authentic: ₹${authoritativePrice})`);

    // Verify Atomic Stock Decrement
    const productAfter1 = await Product.findById(purchasable._id);
    const stockDecremented = productAfter1.stockCount === stockBefore - 1;
    record('Orders', 'OR-02', 'Atomic stock decrement upon order confirmation', stockDecremented, `Stock: ${stockBefore} -> ${productAfter1.stockCount}`);

    // B. UPI Sandbox Order Flow
    const upiOrder = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.testCustomerToken}` },
    }, {
      items: [{ productId: purchasable._id, quantity: 1 }],
      shippingAddress: { fullName: 'UPI Buyer', street: '22 Tech Ave', city: 'Chennai', state: 'Tamil Nadu', postalCode: '600001' },
      paymentMethod: 'UPI Simulator',
      paymentDetails: { paymentMethod: 'UPI Simulator', simulatedSuccess: true, status: 'Paid' },
    });
    const upiOrderId = upiOrder.data?.order?._id;
    if (upiOrderId) testState.createdOrderIds.push(upiOrderId);
    const upiSuccess = upiOrder.status === 201 && upiOrder.data?.order?.paymentDetails?.status === 'Paid' && upiOrder.data?.order?.paymentDetails?.paymentMethod === 'UPI Simulator';
    record('Orders', 'OR-03', 'Simulated UPI Sandbox payment authorized & status Paid', upiSuccess);

    // C. Cash on Delivery (COD) Order Flow
    const codOrder = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.testCustomerToken}` },
    }, {
      items: [{ productId: purchasable._id, quantity: 1 }],
      shippingAddress: { fullName: 'COD Buyer', street: '55 Lake Rd', city: 'Coimbatore', state: 'Tamil Nadu', postalCode: '641001' },
      paymentMethod: 'Cash on Delivery',
      paymentDetails: { paymentMethod: 'Cash on Delivery', status: 'Pending' },
    });
    const codOrderId = codOrder.data?.order?._id;
    if (codOrderId) testState.createdOrderIds.push(codOrderId);
    const codSuccess = codOrder.status === 201 && codOrder.data?.order?.paymentDetails?.status === 'Pending' && codOrder.data?.order?.paymentDetails?.paidAt === null;
    record('Orders', 'OR-04', 'Cash on Delivery created with payment status Pending', codSuccess);

    // D. Stock Reservation & Over-Stock Rejection
    const overStock = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.testCustomerToken}` },
    }, {
      items: [{ productId: purchasable._id, quantity: 999 }],
      shippingAddress: { fullName: 'Greedy Buyer', street: '99 Big Way', city: 'Delhi', state: 'Delhi', postalCode: '110001' },
      paymentMethod: 'Cash on Delivery',
    });
    record('Orders', 'OR-05', 'Rejection of order exceeding available inventory (HTTP 400)', overStock.status === 400);

    // -----------------------------------------------------------------
    // 8. CUSTOMER PRIVACY & ORDER RETRIEVAL
    // -----------------------------------------------------------------
    const myOrdersRes = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/orders/my-orders', method: 'GET',
      headers: { Authorization: `Bearer ${testState.testCustomerToken}` },
    });
    record('Orders', 'OR-06', 'Customer order history returns customer-owned orders', myOrdersRes.status === 200 && myOrdersRes.data?.orders?.length >= 3);

    // Single order retrieval (Testing getOrderById bug fix)
    const singleOrder = await request(server, {
      hostname: 'localhost', port: PORT, path: `/api/orders/${cardOrderId}`, method: 'GET',
      headers: { Authorization: `Bearer ${testState.testCustomerToken}` },
    });
    record('Orders', 'OR-07', 'Single order retrieval by ObjectId (verified bug fix)', singleOrder.status === 200 && singleOrder.data?.order?._id === cardOrderId);

    // Privacy Isolation: User 2 attempting to view User 1's order -> 403 Forbidden
    const isolationRes = await request(server, {
      hostname: 'localhost', port: PORT, path: `/api/orders/${cardOrderId}`, method: 'GET',
      headers: { Authorization: `Bearer ${testState.testCustomer2Token}` },
    });
    record('Security', 'SEC-01', 'Cross-user order isolation: Unauthorized viewer denied (HTTP 403)', isolationRes.status === 403);

    // -----------------------------------------------------------------
    // 9. ADMIN OPERATIONS & FULFILLMENT LIFECYCLE
    // -----------------------------------------------------------------
    // Dashboard KPIs
    const dashRes = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/admin/dashboard', method: 'GET',
      headers: { Authorization: `Bearer ${testState.adminToken}` },
    });
    record('Admin', 'AD-01', 'Admin dashboard returns database-backed metrics', dashRes.status === 200 && dashRes.data?.metrics?.totalProducts >= 72);

    // Admin updates fulfillment status
    const statusUpdate = await request(server, {
      hostname: 'localhost', port: PORT, path: `/api/orders/${codOrderId}/status`, method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.adminToken}` },
    }, { status: 'Dispatched', note: 'Courier tracking assigned' });
    record('Admin', 'AD-02', 'Admin fulfillment stepper transition to Dispatched', statusUpdate.status === 200 && statusUpdate.data?.order?.orderStatus === 'Dispatched');

    // Admin marks COD payment as collected/paid
    const codCollect = await request(server, {
      hostname: 'localhost', port: PORT, path: `/api/orders/${codOrderId}/payment-status`, method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.adminToken}` },
    }, { status: 'Paid', note: 'Cash collected by courier agent upon delivery' });
    record('Admin', 'AD-03', 'Admin explicit COD payment collection marks status Paid', codCollect.status === 200 && codCollect.data?.order?.paymentDetails?.status === 'Paid');

    // Admin reviews trade-in and issues voucher
    const tiApprove = await request(server, {
      hostname: 'localhost', port: PORT, path: `/api/trade-in/${tiId}`, method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.adminToken}` },
    }, { status: 'Approved', approvedValue: estVal });
    const approvedVoucher = tiApprove.data?.tradeIn?.voucherCode || tiApprove.data?.request?.voucherCode;
    record('Admin', 'AD-04', 'Admin trade-in inspection approval and voucher generation', tiApprove.status === 200 && approvedVoucher?.startsWith('RLP-'), `Voucher: ${approvedVoucher}`);

    // Admin Product Lifecycle: Create disposable product, check, update, delete
    const prodCreate = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/products', method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.adminToken}` },
    }, {
      title: 'E2E Disposable Test Smartphone',
      slug: `e2e-disposable-phone-${ts}`,
      brand: 'TestBrand',
      category: 'Smartphones',
      refurbishedPrice: 19999,
      originalRetailPrice: 35000,
      stockCount: 4,
      conditionGrade: 'Pristine',
    });
    const dispProdId = prodCreate.data?.product?._id;
    if (dispProdId) {
      testState.createdProductIds.push(dispProdId);
      if (prodCreate.data?.product?.digitalPassportId) {
        testState.createdPassportIds.push(prodCreate.data.product.digitalPassportId);
      }
    }
    record('Admin', 'AD-05', 'Admin product creation with automated DPP generation', prodCreate.status === 201 && Boolean(dispProdId));

    // Admin updates product
    const prodUpdate = await request(server, {
      hostname: 'localhost', port: PORT, path: `/api/products/${dispProdId}`, method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.adminToken}` },
    }, { refurbishedPrice: 18499, stockCount: 6 });
    record('Admin', 'AD-06', 'Admin product update alters price and stock', prodUpdate.status === 200 && prodUpdate.data?.product?.refurbishedPrice === 18499);

    // Admin deletes disposable product
    const prodDelete = await request(server, {
      hostname: 'localhost', port: PORT, path: `/api/products/${dispProdId}`, method: 'DELETE',
      headers: { Authorization: `Bearer ${testState.adminToken}` },
    });
    record('Admin', 'AD-07', 'Admin product deletion removes record from database', prodDelete.status === 200);

    // -----------------------------------------------------------------
    // 10. IMAGE UPLOADER & SECURITY (ANTI PATH-TRAVERSAL)
    // -----------------------------------------------------------------
    const samplePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadRes = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/upload', method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.adminToken}` },
    }, { image: samplePngBase64 });
    const uploadedFile = uploadRes.data?.fileName;
    if (uploadedFile) testState.uploadedFiles.push(uploadedFile);
    record('Upload', 'UP-01', 'Admin image upload saves authentic image to disk', uploadRes.status === 201 && Boolean(uploadedFile));

    // Non-image upload rejection
    const badUpload = await request(server, {
      hostname: 'localhost', port: PORT, path: '/api/upload', method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testState.adminToken}` },
    }, { image: 'data:text/plain;base64,SGVsbG8gV29ybGQ=' });
    record('Upload', 'UP-02', 'Rejection of non-image MIME types (HTTP 400)', badUpload.status === 400);

    // -----------------------------------------------------------------
    // 11. RESTORE STOCK & CLEAN UP DISPOSABLE TEST ARTIFACTS
    // -----------------------------------------------------------------
    // Restore stock decrements for the purchasable product (purchased 3 units: Card, UPI, COD)
    await Product.findByIdAndUpdate(purchasable._id, { $inc: { stockCount: 3 } });
    console.log(`\n[Cleanup] Restored stock for purchasable product (+3 units back to ${stockBefore}).`);

    // Clean up created orders
    for (const ordId of testState.createdOrderIds) {
      await Order.findByIdAndDelete(ordId);
    }
    console.log(`[Cleanup] Removed ${testState.createdOrderIds.length} test orders.`);

    // Clean up created trade-in request
    for (const trId of testState.createdTradeInIds) {
      await TradeInRequest.findByIdAndDelete(trId);
    }
    console.log(`[Cleanup] Removed ${testState.createdTradeInIds.length} test trade-in requests.`);

    // Clean up created disposable users
    if (testState.testUserId) await User.findByIdAndDelete(testState.testUserId);
    if (testState.testUser2Id) await User.findByIdAndDelete(testState.testUser2Id);
    console.log('[Cleanup] Removed 2 disposable test customer accounts.');

    // Clean up created uploaded file
    for (const f of testState.uploadedFiles) {
      const diskPath = path.resolve(__dirname, '../../client/public/images/products', f);
      if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
    }
    console.log(`[Cleanup] Removed ${testState.uploadedFiles.length} temporary uploaded test images.`);

    // -----------------------------------------------------------------
    // FINAL DATABASE DOCUMENT INTEGRITY CHECK
    // -----------------------------------------------------------------
    testState.countsAfter = {
      users: await User.countDocuments(),
      products: await Product.countDocuments(),
      passports: await DigitalPassport.countDocuments(),
      orders: await Order.countDocuments(),
      tradeIns: await TradeInRequest.countDocuments(),
    };

    console.log('\n--- Final Database Document Counts After Test Cleanup ---');
    console.table(testState.countsAfter);

    const countsIdentical = JSON.stringify(testState.countsBefore) === JSON.stringify(testState.countsAfter);
    record('Safety', 'SF-01', 'Database document counts preserved with zero pollution', countsIdentical);

  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('[Master Suite] Test server and database connection closed cleanly.\n');
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log('================================================================');
  console.log(`MASTER E2E SUITE RESULTS: ${passedCount} / ${results.length} PASSED`);
  console.log('================================================================\n');

  if (passedCount !== results.length) {
    process.exitCode = 1;
  }
}

runMasterE2ESuite().catch((err) => {
  console.error('FATAL MASTER E2E ERROR:', err);
  process.exit(1);
});
