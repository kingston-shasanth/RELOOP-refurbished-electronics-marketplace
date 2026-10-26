const mongoose = require('../server/node_modules/mongoose');
const fs = require('fs');
const path = require('path');

async function safeCleanup() {
  await mongoose.connect('mongodb://127.0.0.1:27017/reloop');
  console.log('--- EXECUTING TARGETED DATA CLEANUP ---');

  const Product = mongoose.connection.db.collection('products');
  const User = mongoose.connection.db.collection('users');
  const Order = mongoose.connection.db.collection('orders');
  const DPP = mongoose.connection.db.collection('digitalpassports');

  // 1. Remove exact test product "its just a demo"
  const testProdId = new mongoose.Types.ObjectId('6add08343279c1077828f582');
  const testProd = await Product.findOne({ _id: testProdId });

  if (testProd && testProd.title === 'its just a demo') {
    console.log(`[1] Removing verified test product: "${testProd.title}" (ID: ${testProd._id})`);
    await Product.deleteOne({ _id: testProdId });
    console.log('✓ Test product removed from MongoDB products collection.');

    // Remove linked DPP if present
    if (testProd.digitalPassportId) {
      await DPP.deleteOne({ _id: new mongoose.Types.ObjectId(testProd.digitalPassportId) });
      console.log(`✓ Linked Digital Passport ${testProd.digitalPassportId} removed.`);
    }

    // Remove unreferenced test uploaded image from disk
    const imgPath = testProd.images && testProd.images[0];
    if (imgPath && imgPath.startsWith('/images/products/prod-upload-')) {
      const otherRef = await Product.findOne({ images: imgPath });
      if (!otherRef) {
        const fullDiskPath = path.resolve(__dirname, '../client/public', imgPath.replace(/^\//, ''));
        if (fs.existsSync(fullDiskPath)) {
          fs.unlinkSync(fullDiskPath);
          console.log(`✓ Test uploaded image deleted from disk: ${fullDiskPath}`);
        }
      }
    }
  } else {
    console.log('[1] Test product was not found or already removed.');
  }

  // 2. Remove audit_tester accounts and their associated test orders
  const auditUsers = await User.find({ email: { $regex: /^audit_tester_/ } }).toArray();
  console.log(`\n[2] Found ${auditUsers.length} test audit user accounts created during tests.`);

  const auditUserIds = auditUsers.map(u => u._id);
  if (auditUserIds.length > 0) {
    const deletedOrders = await Order.deleteMany({ user: { $in: auditUserIds } });
    console.log(`✓ Removed ${deletedOrders.deletedCount} orders placed by audit test accounts.`);

    const deletedUsers = await User.deleteMany({ _id: { $in: auditUserIds } });
    console.log(`✓ Removed ${deletedUsers.deletedCount} audit test user accounts.`);
  }

  // 3. Reconcile final counts
  const finalProductCount = await Product.countDocuments();
  const finalUserCount = await User.countDocuments();
  const finalOrderCount = await Order.countDocuments();
  const finalUsers = await User.find({}).project({ email: 1, role: 1 }).toArray();

  console.log('\n--- RECONCILED DATABASE STATE ---');
  console.log(`Total Products: ${finalProductCount}`);
  console.log(`Total Users: ${finalUserCount} ->`, finalUsers.map(u => `${u.email} (${u.role})`));
  console.log(`Total Orders: ${finalOrderCount}`);

  await mongoose.disconnect();
}

safeCleanup().catch(console.error);
