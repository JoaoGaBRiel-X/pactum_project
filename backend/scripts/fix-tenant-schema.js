require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%'");
  for (const row of res.rows) {
    try {
      await client.query(`ALTER TABLE ${row.schema_name}.contracts ADD COLUMN pending_amendment JSONB;`);
      console.log('Added to', row.schema_name);
    } catch(e) {
      console.log('Skip or err', row.schema_name, e.message);
    }
  }
  await client.end();
}

run();
