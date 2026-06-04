const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:password@localhost:5432/gestao_contratos?schema=public' });

const cloneSchema = async () => {
  await pool.query('CREATE SCHEMA IF NOT EXISTS "tenant_1"');
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'");
  for (const { table_name } of tables.rows) {
    if (table_name === '_prisma_migrations') continue;
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS "tenant_1"."${table_name}" (LIKE public."${table_name}" INCLUDING ALL)`);
      console.log('Created table ' + table_name);
    } catch(e) {
      console.log('Skipped ' + table_name, e.message);
    }
  }
};
cloneSchema().then(() => process.exit(0)).catch(console.error);
