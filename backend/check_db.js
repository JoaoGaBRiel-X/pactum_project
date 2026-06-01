const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/gestao_contratos?schema=public'
});

async function main() {
  const result = await pool.query('SELECT email FROM "users"');
  console.log('Users:', result.rows);
}

main().finally(() => pool.end());
