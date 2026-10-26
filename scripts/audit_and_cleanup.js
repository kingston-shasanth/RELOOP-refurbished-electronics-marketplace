const mongoose = require('../server/node_modules/mongoose');
const fs = require('fs');
const path = require('path');

async function runAudit() {
  await mongoose.connect('mongodb://127.0.0.1:27017/reloop');
  console.log('--- RELOOP DATABASE & CATALOGUE INTEGRITY AUDIT ---');

  const Product = mongoose.connection.db.collection('products');
  const User = mongoose.connection.db.collection('users');
  const Order = mongoose.connection.db.collection('orders');
  const TradeIn = mongoose.connection.db.collection('tradeinrequests');
  const DPP = mongoose.connection.db.collection('digitalpassports');

  // 1. Inspect test product
  const testProd = await Product.findOne({ _id: new mongoose.Types.ObjectId('6add08343279c1077828f582') });
  if (testProd) {
    console.log('\n[TEST PRODUCT FOUND]:');
    console.log(JSON.stringify(testProd, null, 2));

    const img = testProd.images && testProd.images[0];
    if (img) {
      const others = await Product.find({ _id: { $ne: testProd._id }, images: img }).toArray();
      console.log(`Other products referencing image "${img}":`, others.length);
      const diskPath = path.resolve(__dirname, '../client/public', img.replace(/^\//, ''));
      console.log(`Image exists on disk: ${fs.existsSync(diskPath)} (${diskPath})`);
    }
  } else {
    console.log('\n[TEST PRODUCT]: Not found (may have already been deleted).');
  }

  // 2. Audit all products
  const products = await Product.find({}).toArray();
  console.log(`\nTotal products in DB: ${products.length}`);
  
  const categories = {};
  products.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1;
    // Check if any product has mismatched brand in title vs brand field
    if (p.brand && p.title && !p.title.toLowerCase().includes(p.brand.toLowerCase())) {
      console.log(`[Brand Notice] Product "${p.title}" has brand "${p.brand}"`);
    }
    // Check battery health representation
    if (p.category === 'Desktops' || p.category === 'Audio' || p.category === 'Accessories') {
      const bh = p.specifications?.batteryHealth || p.dpp?.batteryHealth;
      if (bh) {
        console.log(`[Battery Notice] Non-laptop/phone product "${p.title}" (${p.category}) has battery health: ${bh}`);
      }
    }
  });
  console.log('Categories count:', categories);

  // 3. Audit users
  const users = await User.find({}).toArray();
  console.log(`\nTotal users in DB: ${users.length}`);
  const auditUsers = users.filter(u => u.email && u.email.startsWith('audit_tester_'));
  console.log(`Audit test accounts (from previous audit runs): ${auditUsers.length}`);
  const realUsers = users.filter(u => !u.email.startsWith('audit_tester_'));
  console.log('Preserved users:', realUsers.map(u => `${u.email} (${u.role})`));

  // 4. Audit orders
  const orders = await Order.find({}).toArray();
  console.log(`\nTotal orders in DB: ${orders.length}`);
  orders.forEach(o => {
    console.log(`Order ${o._id}: Customer=${o.customer?.email || o.user}, Total=₹${o.pricing?.totalAmount || o.totalAmount}, PaymentMethod=${o.paymentMethod || o.paymentInfo?.method}, PaymentStatus=${o.paymentStatus || o.paymentInfo?.status || o.isPaid}, Status=${o.orderStatus || o.status}`);
  });

  await mongoose.disconnect();
}

runAudit().catch(console.error);
