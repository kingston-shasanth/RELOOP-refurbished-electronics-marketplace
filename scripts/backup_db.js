const mongoose = require('../server/node_modules/mongoose');
const fs = require('fs');
const path = require('path');

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, `../data/backups/backup_${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  await mongoose.connect('mongodb://127.0.0.1:27017/reloop');
  console.log(`[Backup] Connected to MongoDB. Saving snapshot to: ${backupDir}`);

  const collections = ['products', 'users', 'orders', 'tradeinrequests', 'digitalpassports'];
  for (const colName of collections) {
    const data = await mongoose.connection.db.collection(colName).find({}).toArray();
    const filePath = path.join(backupDir, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`[Backup] Saved ${data.length} records from ${colName} -> ${colName}.json`);
  }

  await mongoose.disconnect();
  console.log('[Backup] Completed successfully.');
}

backup().catch(console.error);
