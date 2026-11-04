const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query(`SHOW "app.settings.jwt_secret";`);
    console.log('jwt_secret setting:', res.rows);
  } catch (e) {
    console.log('Error showing jwt_secret:', e.message);
  }

  try {
    const res2 = await pool.query(`
      SELECT name, setting FROM pg_settings WHERE name LIKE '%jwt%' OR name LIKE '%supabase%';
    `);
    console.log('pg_settings:', res2.rows);
  } catch (e) {
    console.log('Error pg_settings:', e.message);
  }

  // Check storage or other tables
  try {
    const res3 = await pool.query(`SELECT * FROM auth.config LIMIT 1;`);
    console.log('auth.config:', res3.rows);
  } catch (e) {
    console.log('auth.config error:', e.message);
  }

  await pool.end();
}

run().catch(console.error);
