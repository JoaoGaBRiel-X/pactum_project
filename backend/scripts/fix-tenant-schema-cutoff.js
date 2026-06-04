require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%'");
  for (const row of res.rows) {
    const s = row.schema_name;
    try {
      await client.query(`CREATE TYPE ${s}."BillingCutoffStrategy" AS ENUM ('GLOBAL', 'PER_CONTRACT', 'PER_PRODUCT_GROUP');`);
    } catch(e) { console.log('Enum exists', s) }
    
    try {
      await client.query(`ALTER TABLE ${s}.tenant_settings ADD COLUMN billing_cutoff_strategy ${s}."BillingCutoffStrategy" NOT NULL DEFAULT 'GLOBAL';`);
      await client.query(`ALTER TABLE ${s}.tenant_settings ADD COLUMN global_cutoff_day INT NOT NULL DEFAULT 15;`);
      await client.query(`ALTER TABLE ${s}.software_products ADD COLUMN cutoff_day INT;`);
      await client.query(`ALTER TABLE ${s}.product_groups ADD COLUMN cutoff_day INT;`);
      await client.query(`ALTER TABLE ${s}.contracts ADD COLUMN cutoff_day INT;`);
      console.log('Added cutoff columns to', s);
    } catch(e) {
      console.log('Skip or err', s, e.message);
    }
  }
  await client.end();
}

run();
