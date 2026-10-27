const { app, startServer } = require('../server');
const mongoose = require('mongoose');

async function runComplianceAudit() {
  console.log('================================================================');
  console.log('RELOOP FULL-STACK COMPLIANCE AUDIT & LIVE WORKFLOW VERIFICATION');
  console.log('================================================================');

  const server = await startServer();
  const PORT = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${PORT}/api`;

  let results = [];
  const record = (name, passed, details = '') => {
    results.push({ name, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${details ? ` -> ${details}` : ''}`);
  };

  let testEmail = null;
  let testOrderId = null;

  try {
    // -------------------------------------------------------------
    // Test 1: Customer Registration (POST /api/auth/register)
    // -------------------------------------------------------------
    testEmail = `audit_tester_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Customer',
        email: testEmail,
        password: 'Password123!',
        phone: '9876543210',
      }),
    });
    const regData = await regRes.json();
    let customerToken = regData.token;
    record(
      'TC-01: Customer Registration',
      regRes.status === 201 && customerToken && regData.user.role === 'customer',
      `HTTP ${regRes.status}, user ID: ${regData.user?._id}`
    );

    // -------------------------------------------------------------
    // Test 2: Customer Login (POST /api/auth/login)
    // -------------------------------------------------------------
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    record(
      'TC-02: Customer Login & JWT Issuance',
      loginRes.status === 200 && loginData.token,
      `HTTP ${loginRes.status}, Token received`
    );

    // -------------------------------------------------------------
    // Test 3: Get Products with Filters & Sort (GET /api/products)
    // -------------------------------------------------------------
    const prodRes = await fetch(`${baseUrl}/products?category=Smartphones&sort=price_asc`);
    const prodData = await prodRes.json();
    record(
      'TC-05: Product Browsing & Category Filtering',
      prodRes.status === 200 && prodData.products.length > 0 && prodData.products.every(p => p.category === 'Smartphones'),
      `Found ${prodData.products?.length} Smartphones in catalogue`
    );

    // -------------------------------------------------------------
    // Test 4: Text Search with MongoDB Index (GET /api/products?search=MacBook)
    // -------------------------------------------------------------
    const searchRes = await fetch(`${baseUrl}/products?search=MacBook`);
    const searchData = await searchRes.json();
    record(
      'TC-06: Text Search with MongoDB Text Index',
      searchRes.status === 200 && searchData.products.some(p => p.title.includes('MacBook')),
      `Found ${searchData.products?.length} matching items`
    );

    // -------------------------------------------------------------
    // Test 5: Digital Product Passport Retrieval (GET /api/products/:id/passport)
    // -------------------------------------------------------------
    const sampleProduct = prodData.products[0];
    const passportRes = await fetch(`${baseUrl}/products/${sampleProduct._id}/passport`);
    const passportData = await passportRes.json();
    record(
      'TC-11: Digital Product Passport (DPP) Retrieval',
      passportRes.status === 200 && passportData.passport && passportData.passport.diagnosticSummaryScore > 0,
      `Score: ${passportData.passport?.diagnosticSummaryScore}/100, Battery: ${passportData.passport?.subsystemChecks?.battery?.healthPercent}%, Serial: ${passportData.passport?.deviceSerialNumber}`
    );

    // -------------------------------------------------------------
    // Test 6: Side-by-Side Compare API (GET /api/products/compare?ids=...)
    // -------------------------------------------------------------
    const allProdRes = await fetch(`${baseUrl}/products`);
    const allProdData = await allProdRes.json();
    const compareIds = allProdData.products.slice(0, 2).map(p => p._id).join(',');
    const compRes = await fetch(`${baseUrl}/products/compare?ids=${compareIds}`);
    const compData = await compRes.json();
    record(
      'TC-12: Compare Devices API Endpoint (GET /api/products/compare)',
      compRes.status === 200 && compData.products?.length === 2,
      `Compared ${compData.products?.length} products side-by-side`
    );

    // -------------------------------------------------------------
    // Test 7: Explainable Trade-In Valuation (POST /api/trade-in/calculate)
    // -------------------------------------------------------------
    const tradeInCalcRes = await fetch(`${baseUrl}/trade-in/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'Smartphones',
        brand: 'Apple',
        modelName: 'iPhone 13 128GB',
        functionalState: {
          powersOn: true,
          screenIntact: true,
          touchResponsive: true,
          camerasWork: true,
          batteryWorking: true,
        },
        cosmeticGrade: 'Good',
        batteryHealth: '85-90% Good',
      }),
    });
    const tradeInData = await tradeInCalcRes.json();
    const estimatedValue = tradeInData.data?.estimatedValue;
    record(
      'TC-13: Explainable Trade-In Valuation Engine',
      tradeInCalcRes.status === 200 && estimatedValue > 0,
      `Estimated Value: ₹${estimatedValue} (Range: ${tradeInData.data?.indicativeRange})`
    );

    // -------------------------------------------------------------
    // Test 8: Trade-In Request Submission (POST /api/trade-in/submit)
    // -------------------------------------------------------------
    const tradeInSubRes = await fetch(`${baseUrl}/trade-in/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        deviceCategory: 'Smartphones',
        brand: 'Apple',
        modelName: 'iPhone 13 128GB',
        functionalState: {
          powersOn: true,
          screenIntact: true,
          touchResponsive: true,
          camerasWork: true,
          batteryWorking: true,
        },
        cosmeticGrade: 'Good',
        estimatedValue: estimatedValue,
        valuationBreakdown: tradeInData.data?.breakdown,
        specifications: 'Battery: 85-90%, Screen: Intact, Casing: Good',
      }),
    });
    const tradeInSubData = await tradeInSubRes.json();
    record(
      'TC-13b: Trade-In Request Submission & Persistence',
      tradeInSubRes.status === 201 && tradeInSubData.tradeInRequest?._id,
      `Request ID: ${tradeInSubData.tradeInRequest?._id}`
    );

    // -------------------------------------------------------------
    // Test 9: Anti-Tamper Checkout & Atomic Stock Decrement (POST /api/orders)
    // -------------------------------------------------------------
    const targetProduct = allProdData.products.find(p => p.stockCount >= 2);
    const initialStock = targetProduct.stockCount;
    const authoritativePrice = targetProduct.refurbishedPrice;
    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            productId: targetProduct._id,
            quantity: 1,
            price: 1, // Deliberate tampered price: backend must ignore and use authoritative DB price!
          },
        ],
        shippingAddress: {
          fullName: 'Audit Customer',
          phone: '9876543210',
          street: '123 Test Tech Park',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postalCode: '600001',
          country: 'India',
        },
        paymentDetails: {
          paymentMethod: 'Simulated Card',
          cardBrand: 'Visa',
          cardLast4: '4242',
        },
      }),
    });
    const orderData = await orderRes.json();
    // Check that product stock decremented atomically
    const refreshedProductRes = await fetch(`${baseUrl}/products/${targetProduct._id}`);
    const refreshedProductData = await refreshedProductRes.json();
    const newStock = refreshedProductData.product.stockCount;
    const subtotalVerified = orderData.order?.pricing?.itemsSubtotal === authoritativePrice;
    record(
      'TC-17 & TC-18: Anti-Tamper Checkout & Atomic Stock Decrement',
      orderRes.status === 201 && subtotalVerified && newStock === initialStock - 1,
      `Stock changed from ${initialStock} -> ${newStock}, Authoritative price enforced: ₹${orderData.order?.pricing?.itemsSubtotal}`
    );

    // -------------------------------------------------------------
    // Test 10: Customer Order History (GET /api/orders/my-orders)
    // -------------------------------------------------------------
    const myOrdersRes = await fetch(`${baseUrl}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const myOrdersData = await myOrdersRes.json();
    record(
      'TC-02b: Customer Order History Synchronization',
      myOrdersRes.status === 200 && myOrdersData.orders?.length >= 1,
      `Found ${myOrdersData.orders?.length} customer order(s)`
    );

    // -------------------------------------------------------------
    // Test 11: Admin Login & Authentication (POST /api/auth/login)
    // -------------------------------------------------------------
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@reloop.com',
        password: 'admin123',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    record(
      'TC-03: Admin Authentication & RBAC Token',
      adminLoginRes.status === 200 && adminLoginData.user?.role === 'admin',
      `Admin ID: ${adminLoginData.user?._id}, Role: ${adminLoginData.user?.role}`
    );

    // -------------------------------------------------------------
    // Test 12: Unauthorized Admin Access Guard (Customer forbidden)
    // -------------------------------------------------------------
    const unauthorizedRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    record(
      'TC-04: Unauthorized Admin Access Guard (403 Forbidden)',
      unauthorizedRes.status === 403,
      `HTTP ${unauthorizedRes.status} (Access successfully denied to standard customer)`
    );

    // -------------------------------------------------------------
    // Test 13: Admin Dashboard Metrics (GET /api/admin/dashboard)
    // -------------------------------------------------------------
    const dashRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashData = await dashRes.json();
    record(
      'TC-22: Admin Dashboard DB-Backed KPIs',
      dashRes.status === 200 && dashData.metrics?.totalProducts > 0,
      `Products: ${dashData.metrics?.totalProducts}, Orders: ${dashData.metrics?.totalOrders}, Revenue: ₹${dashData.metrics?.totalRevenue}`
    );

    // -------------------------------------------------------------
    // Test 14: Admin Product Creation (POST /api/products)
    // -------------------------------------------------------------
    const newProductPayload = {
      title: 'Audit Refurbished Test Tablet X1',
      brand: 'Apple',
      category: 'Tablets',
      conditionGrade: 'Pristine',
      price: 28999,
      mrp: 45000,
      stockCount: 7,
      description: 'Audit test device with verified screen and battery health.',
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'],
      specifications: {
        Processor: 'Apple A15 Bionic',
        RAM: '4 GB',
        Storage: '64 GB',
        Display: '8.3-inch Liquid Retina',
      },
      warrantyMonths: 12,
    };
    const createProdRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newProductPayload),
    });
    const createProdData = await createProdRes.json();
    const createdProductId = createProdData.product?._id;
    record(
      'TC-23: Admin Product Creation & MongoDB Persistence',
      createProdRes.status === 201 && createdProductId,
      `Created product ID: ${createdProductId}, Slug: ${createProdData.product?.slug}`
    );

    // -------------------------------------------------------------
    // Test 15: Verify Created Product in Public Catalog
    // -------------------------------------------------------------
    const fetchCreatedRes = await fetch(`${baseUrl}/products/${createdProductId}`);
    const fetchCreatedData = await fetchCreatedRes.json();
    record(
      'TC-23b: Created Product Public Visibility',
      fetchCreatedRes.status === 200 && fetchCreatedData.product?.title === newProductPayload.title,
      `Retrieved created product: "${fetchCreatedData.product?.title}"`
    );

    // -------------------------------------------------------------
    // Test 16: Admin Product Edit / Update (PUT /api/products/:id)
    // -------------------------------------------------------------
    const updateProdRes = await fetch(`${baseUrl}/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 26999, // Lowered price
        stockCount: 9, // Increased stock
      }),
    });
    const updateProdData = await updateProdRes.json();
    record(
      'TC-24: Admin Product Update & Persistence',
      updateProdRes.status === 200 && updateProdData.product?.refurbishedPrice === 26999 && updateProdData.product?.stockCount === 9,
      `Price updated to ₹${updateProdData.product?.refurbishedPrice}, Stock updated to ${updateProdData.product?.stockCount}`
    );

    // -------------------------------------------------------------
    // Test 17: Admin Order Status Stepper Update (PUT /api/orders/:id/status)
    // -------------------------------------------------------------
    testOrderId = orderData.order?._id;
    const updateOrderRes = await fetch(`${baseUrl}/orders/${testOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Dispatched',
        comment: 'Unit passed final diagnostic and dispatched via express courier.',
      }),
    });
    const updateOrderData = await updateOrderRes.json();
    record(
      'TC-25: Admin Order Fulfillment Stepper Update',
      updateOrderRes.status === 200 && updateOrderData.order?.orderStatus === 'Dispatched',
      `Order status transitioned to: "${updateOrderData.order?.orderStatus}"`
    );

    // -------------------------------------------------------------
    // Test 18: Admin Product Deletion (DELETE /api/products/:id)
    // -------------------------------------------------------------
    const deleteProdRes = await fetch(`${baseUrl}/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteProdData = await deleteProdRes.json();
    const verifyDeletedRes = await fetch(`${baseUrl}/products/${createdProductId}`);
    record(
      'TC-24b: Admin Product Deletion & Cleanup',
      deleteProdRes.status === 200 && verifyDeletedRes.status === 404,
      `Deleted HTTP ${deleteProdRes.status}, verified 404 on subsequent lookup`
    );

    console.log('\n================================================================');
    console.log(`AUDIT RESULTS: ${results.filter(r => r.passed).length} / ${results.length} TESTS PASSED`);
    console.log('================================================================');
  } catch (err) {
    console.error('Audit execution error:', err);
  } finally {
    if (testOrderId) {
      await mongoose.connection.db.collection('orders').deleteOne({ _id: new mongoose.Types.ObjectId(testOrderId) });
    }
    if (testEmail) {
      await mongoose.connection.db.collection('users').deleteOne({ email: testEmail });
    }
    server.close();
    await mongoose.disconnect();
    console.log('[Audit] Server shut down and database disconnected cleanly.');
  }
}

runComplianceAudit();
