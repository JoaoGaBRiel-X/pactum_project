import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { execSync } from 'child_process';

const dbUrl = new URL(process.env.DATABASE_URL as string);

const pool = new Pool({
  user: dbUrl.username,
  password: dbUrl.password,
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port, 10),
  database: dbUrl.pathname.slice(1),
  max: 5,
});

const adapter = new PrismaPg(pool, { schema: 'public' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingTenant = await prisma.tenant.findFirst();

  if (!existingTenant) {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Lefer Automation',
        document: '12345678000199',
        schema: 'tenant_lefer',
      },
    });
    console.log(`Tenant criado: ${tenant.name}`);

    // Create schema
    try {
      execSync(`npx prisma migrate dev --schema=prisma/tenant.schema.prisma --name init`);
      console.log('Schema do tenant inicializado!');
    } catch (e) {
      console.log('Erro ao inicializar schema do tenant (pode já existir ou ser manual):', e.message);
    }

  } else {
    console.log(`Já existe um tenant cadastrado: ${existingTenant.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
