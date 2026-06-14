const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function migrateAllTenants() {
  const prisma = new PrismaClient();
  try {
    // Busca todos os tenants na schema global
    const tenants = await prisma.tenant.findMany();
    console.log(`Encontrados ${tenants.length} tenants para migrar.`);

    const dbUrlBase = process.env.DATABASE_URL;

    for (const tenant of tenants) {
      if (!tenant.schema) continue;
      
      console.log(`Migrando schema: ${tenant.schema}...`);
      
      // Cria a nova URL com o schema específico no param `schema=`
      const url = new URL(dbUrlBase);
      url.searchParams.set('schema', tenant.schema);
      const pushUrl = url.toString();

      try {
        const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss', {
          env: {
            ...process.env,
            DATABASE_URL: pushUrl,
          },
        });
        console.log(`Sucesso para ${tenant.schema}: \n${stdout}`);
      } catch (err) {
        console.error(`Erro ao migrar ${tenant.schema}:`, err.message);
      }
    }
    console.log('Migração de tenants finalizada.');
  } catch (error) {
    console.error('Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateAllTenants();
