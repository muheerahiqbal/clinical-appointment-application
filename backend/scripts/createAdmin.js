const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const connectDatabase = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12
    || Buffer.byteLength(ADMIN_PASSWORD, 'utf8') > 72) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of 12+ characters and at most 72 bytes');
  }

  await connectDatabase();
  const existingUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });
  if (existingUser) {
    throw new Error('That email is already registered; refusing to change an existing account role');
  }
  const user = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin'
  });
  console.info(`Created administrator ${user.email}`);
}

createAdmin()
  .catch((error) => {
    console.error('Unable to create administrator:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
