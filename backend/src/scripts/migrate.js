'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const { databaseUrl } = require('../config/security');

const pool = new Pool({ connectionString: databaseUrl() });

async function main() {
  const client = await pool.connect();
  try {
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())'
    );
    const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
    const names = fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
    for (const name of names) {
      const applied = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
      if (applied.rowCount) continue;
      await client.query(fs.readFileSync(path.join(migrationsDir, name), 'utf8'));
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
      console.log(`Applied ${name}`);
    }
  } finally {
    client.release();
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
