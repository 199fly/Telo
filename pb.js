require('dotenv').config();
const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase(process.env.POCKETBASE_URL);

async function ensureAdminAuth() {
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL,
      process.env.PB_ADMIN_PASSWORD
    );
  }
}

module.exports = { pb, ensureAdminAuth };
