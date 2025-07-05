require('dotenv').config();
const fs = require('fs');
const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');
const adminEmail = process.env.PB_ADMIN_EMAIL || 'admin@me.com';
const adminPassword = process.env.PB_ADMIN_PASSWORD || 'TeloAdmin123';

async function waitForHealth() {
  for (let i = 0; i < 10; i++) {
    try {
      await pb.health.check();
      return;
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('PocketBase did not start in time');
}

(async () => {
  await waitForHealth();

  try {
    await pb.admins.authWithPassword(adminEmail, adminPassword);
  } catch (err) {
    await pb.admins.create({
      email: adminEmail,
      password: adminPassword,
      passwordConfirm: adminPassword,
    });
    await pb.admins.authWithPassword(adminEmail, adminPassword);
  }

  const schema = JSON.parse(fs.readFileSync('.dev/schema.json', 'utf8'));
  await pb.collections.import(schema.collections, true);
  pb.authStore.clear();
})();
