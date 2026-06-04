const { Pool } = require('pg');
const dbUrl = new URL(process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gestao_contratos?schema=public');
const pool = new Pool({
  user: dbUrl.username, password: dbUrl.password, host: dbUrl.hostname, port: parseInt(dbUrl.port, 10), database: dbUrl.pathname.slice(1), max: 5
});
pool.query("SELECT path FROM tenant_e83fc2542f8748c59617539a4749bf1a.document_templates ORDER BY created_at DESC LIMIT 5").then(r => console.log(r.rows)).catch(console.error);
