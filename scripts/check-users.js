const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const users = await pool.query(`SELECT id, email, created_at FROM auth.users LIMIT 5;`);
  console.log('auth.users count:', users.rowCount);
  console.log('auth.users sample:', users.rows);
  await pool.end();
}

run().catch(console.error);
