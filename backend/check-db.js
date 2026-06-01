const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'empresaautomacao' } });
  await prisma.$executeRawUnsafe('SET search_path TO "' + tenant.schema + '"');
  
  const contacts = await prisma.$queryRaw`SELECT id, name, email, portal_access, password_hash FROM contacts WHERE email = 'teste@teste.com.br'`;
  console.log(contacts);
}
main().catch(console.error).finally(() => prisma.$disconnect());
