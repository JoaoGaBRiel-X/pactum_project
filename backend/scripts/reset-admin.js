const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const url = new URL(process.env.DATABASE_URL);
const pool = new Pool({
  user: url.username,
  password: url.password,
  host: url.hostname,
  port: parseInt(url.port, 10),
  database: url.pathname.slice(1),
  max: 20,
  options: '-c search_path=public',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const newPass = 'admin123';
  const hash = await bcrypt.hash(newPass, 10);
  
  const adminEmail = 'admin@lefer.com.br';
  
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hash, isSuperAdmin: true },
    create: {
      email: adminEmail,
      name: 'Super Admin',
      password: hash,
      isSuperAdmin: true,
    }
  });
  
  console.log(`Super admin ${adminEmail} configured with password: ${newPass}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
