require('dotenv').config();
const { Pool } = require('pg');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function main() {
  const url = new URL(process.env.DATABASE_URL);
  const pool = new Pool({
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: parseInt(url.port, 10),
    database: url.pathname.slice(1),
  });

  console.log('Querying tenant schemas...');
  const res = await pool.query(`SELECT nspname FROM pg_namespace WHERE nspname LIKE 'tenant_%';`);
  const schemas = res.rows.map(r => r.nspname);
  console.log(`Found ${schemas.length} tenant schemas:`, schemas);

  for (const schemaName of schemas) {
    const dbUrl = new URL(process.env.DATABASE_URL);
    dbUrl.searchParams.set('schema', schemaName);
    const pushUrl = dbUrl.toString();

    console.log(`\nPushing to schema: ${schemaName}...`);
    try {
      const { stdout } = await execAsync('npx prisma db push --accept-data-loss', {
        env: { ...process.env, DATABASE_URL: pushUrl }
      });
      console.log(`Success for ${schemaName}`);
    } catch (err) {
      console.error(`Failed for ${schemaName}:`, err.message);
    }
  }

  await pool.end();
}

main().catch(console.error);
