const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tenants = await prisma.$queryRaw`SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%'`;
  for (const t of tenants) {
    const schema = t.schema_name;
    console.log(`Fixing schema: ${schema}`);
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${schema}".receivables ADD COLUMN IF NOT EXISTS boleto_url TEXT;`);
    } catch(e) {
      console.log(`Error on ${schema}:`, e.message);
    }
  }
  console.log("Done");
  await prisma.$disconnect();
}
run();
