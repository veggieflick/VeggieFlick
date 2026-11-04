const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res = await pool.query(`SELECT schema_name FROM information_schema.schemata;`);
  console.log('Schemas:', res.rows.map(r => r.schema_name));

  // Check auth schema tables
  const authTables = await pool.query(`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth';
  `);
  console.log('Auth tables:', authTables.rows.map(r => r.table_name));

  // Check if supabase vault or secrets table has anon key
  try {
    const secrets = await pool.query(`SELECT * FROM vault.decrypted_secrets LIMIT 5;`);
    console.log('Vault secrets:', secrets.rows);
  } catch (e) {
    console.log('No vault access:', e.message);
  }

  await pool.end();
}

run().catch(console.error);
