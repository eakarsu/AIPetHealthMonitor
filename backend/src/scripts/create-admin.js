'use strict';

const bcrypt = require('bcryptjs');
let sequelize;

async function main() {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
    throw new Error('Explicit bootstrap acknowledgement is required');
  }
  const email = (process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.PROVISION_ADMIN_PASSWORD || '';
  const name = (process.env.PROVISION_ADMIN_NAME || '').trim();
  if (!email || !name || password.length < 12) {
    throw new Error('Admin email, name, and a 12+ character password are required');
  }

  const models = require('../models');
  sequelize = models.sequelize;
  const { User } = models;
  const values = {
    password: await bcrypt.hash(password, 12),
    name,
    role: 'admin',
    plan: 'premium',
  };
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    await existing.update(values);
  } else {
    await User.create({ email, ...values });
  }
  console.log('Administrator provisioned.');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize?.close());
