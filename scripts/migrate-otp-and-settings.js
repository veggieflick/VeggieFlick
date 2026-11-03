const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log('Connecting to database...');
  
  // 1. Update otp_codes table
  await pool.query(`
    ALTER TABLE otp_codes ALTER COLUMN phone TYPE varchar(255);
    ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS email varchar(255);
  `);
  console.log('otp_codes table updated (phone type widened, email column added).');

  // 2. Create app_settings table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('app_settings table ensured.');

  // 3. Seed default settings if not present
  const defaultSettings = [
    { key: 'upi_id', value: '9840532826@okaxis' },
    { key: 'support_phone', value: '9840532826' },
    { key: 'support_email', value: 'veggieflick@gmail.com' },
  ];

  if (process.env.RAZORPAY_KEY_ID) {
    defaultSettings.push({ key: 'razorpay_key_id', value: process.env.RAZORPAY_KEY_ID });
  }
  if (process.env.RAZORPAY_SECRET) {
    defaultSettings.push({ key: 'razorpay_secret', value: process.env.RAZORPAY_SECRET });
  }
  if (process.env.RAZORPAY_WEBHOOK_SECRET) {
    defaultSettings.push({ key: 'razorpay_webhook_secret', value: process.env.RAZORPAY_WEBHOOK_SECRET });
  }

  for (const s of defaultSettings) {
    await pool.query(
      `INSERT INTO app_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [s.key, s.value]
    );
  }
  console.log('Default settings seeded in app_settings.');

  const res = await pool.query(`SELECT key, value FROM app_settings`);
  console.log('Current app_settings:', res.rows.map(r => r.key));

  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
