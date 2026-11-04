const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkSecrets() {
  try {
    const roles = await pool.query(`SELECT rolname, rolconfig FROM pg_roles WHERE rolname LIKE '%supabase%' OR rolname LIKE '%authenticator%' OR rolname LIKE '%anon%';`);
    console.log('Roles:', roles.rows);
  } catch (e) {
    console.log('Error pg_roles:', e.message);
  }

  try {
    const cf = await pool.query(`SELECT * FROM pg_catalog.pg_settings WHERE name LIKE '%jwt%' OR name LIKE '%secret%';`);
    console.log('Settings:', cf.rows);
  } catch (e) {
    console.log('Error pg_settings:', e.message);
  }

  await pool.end();
}

checkSecrets().catch(console.error);
