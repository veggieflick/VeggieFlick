const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res = await pool.query(`SELECT id, full_name, email, phone, role FROM profiles LIMIT 10;`);
  console.log('profiles:', res.rows);
  await pool.end();
}

run().catch(console.error);
