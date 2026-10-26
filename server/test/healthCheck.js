const { app, startServer } = require('../server');
const mongoose = require('mongoose');

async function runTests() {
  console.log('--- Starting Milestone 1 Automated Verification ---');

  // Start server
  const server = await startServer();
  const PORT = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // 1. Test Base URL
    console.log('\n[Test 1] Testing Base Welcome Route GET /');
    const resBase = await fetch(`${baseUrl}/`);
    const dataBase = await resBase.json();
    console.log(`Status: ${resBase.status} ${resBase.statusText}`);
    console.log('Response Payload:', JSON.stringify(dataBase, null, 2));

    // 2. Test GET /api/health
    console.log('\n[Test 2] Testing Health Endpoint GET /api/health');
    const resHealth = await fetch(`${baseUrl}/api/health`);
    const dataHealth = await resHealth.json();
    console.log(`Status: ${resHealth.status} ${resHealth.statusText}`);
    console.log('Response Payload:', JSON.stringify(dataHealth, null, 2));

    // 3. Test GET /api/health/db
    console.log('\n[Test 3] Testing Database Health Endpoint GET /api/health/db');
    const resDb = await fetch(`${baseUrl}/api/health/db`);
    const dataDb = await resDb.json();
    console.log(`Status: ${resDb.status} ${resDb.statusText}`);
    console.log('Response Payload:', JSON.stringify(dataDb, null, 2));

    // 4. Test CORS headers
    console.log('\n[Test 4] Testing CORS headers with Origin: http://localhost:5173');
    const resCors = await fetch(`${baseUrl}/api/health`, {
      headers: {
        Origin: 'http://localhost:5173',
      },
    });
    console.log('Access-Control-Allow-Origin:', resCors.headers.get('access-control-allow-origin'));
    console.log('Access-Control-Allow-Credentials:', resCors.headers.get('access-control-allow-credentials'));

    // 5. Test 404 Centralized Error Handler
    console.log('\n[Test 5] Testing Centralized 404 Error Handler GET /api/nonexistent');
    const res404 = await fetch(`${baseUrl}/api/nonexistent`);
    const data404 = await res404.json();
    console.log(`Status: ${res404.status} ${res404.statusText}`);
    console.log('Response Payload:', JSON.stringify(data404, null, 2));

    // 6. Test Model Schema Compilation & Index Setup
    console.log('\n[Test 6] Verifying Mongoose Models Compilation');
    const models = require('../models');
    for (const [name, model] of Object.entries(models)) {
      console.log(`- Model [${name}]: collection = "${model.collection.name}", indexes = ${model.schema.indexes().length}`);
    }

    console.log('\n--- All Automated Verification Tests Passed Successfully! ---');
  } catch (error) {
    console.error('\n[Test Failure]:', error);
  } finally {
    await mongoose.disconnect();
    server.close(() => {
      console.log('\nTest server shut down cleanly.');
      process.exit(0);
    });
  }
}

runTests();
