/**
 * Seed de desenvolvimento - Recria o tenant inicial e usuário admin
 * Uso: npx ts-node --project tsconfig.json prisma/seed.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as child_process from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(child_process.exec);

async function getPrismaClient(schema = 'public') {
  const url = new URL(process.env.DATABASE_URL as string);
  const pool = new Pool({
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: parseInt(url.port, 10),
    database: url.pathname.slice(1),
    options: `-c search_path=${schema}`,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);
  await (prisma as any).$connect();
  return { prisma, pool };
}

async function main() {
  console.log('🌱 Iniciando seed de desenvolvimento...');

  const schemaName = 'tenant_empresaautomacao';
  const adminEmail = 'e2e-test@lefer.com.br';
  const adminPassword = 'PasswordE2E@123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const { prisma: publicPrisma, pool: publicPool } = await getPrismaClient('public');

  try {
    // 1. Criar schema do tenant
    await publicPrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    console.log(`✅ Schema "${schemaName}" criado/verificado`);

    // 2. Provisionar tabelas no schema do tenant via db push
    const dbUrl = new URL(process.env.DATABASE_URL as string);
    dbUrl.searchParams.set('schema', schemaName);
    const pushUrl = dbUrl.toString();

    await execAsync(`npx prisma db push --accept-data-loss --url "${pushUrl}"`, {
      env: { ...process.env },
      cwd: process.cwd(),
    });
    console.log(`✅ Tabelas provisionadas no schema "${schemaName}"`);

    // 3. Criar o tenant
    const existingTenant = await publicPrisma.tenant.findFirst({ where: { document: '12345678000100' } });
    let tenant: any;
    if (existingTenant) {
      tenant = existingTenant;
      console.log(`⚠️  Tenant já existe: ${tenant.name}`);
    } else {
      tenant = await publicPrisma.tenant.create({
        data: {
          name: 'Empresa de Automação Demo',
          document: '12345678000100',
          schema: schemaName,
          slug: 'empresaautomacao',
          legalRepName: 'João Demo',
          legalRepCpf: '12345678901',
          roleProfiles: {
            create: [
              { name: 'Admin', description: 'Acesso total ao sistema', permissions: ['*'] },
              { name: 'Financeiro', description: 'Acesso ao módulo financeiro', permissions: ['financial:read', 'financial:write'] },
              { name: 'Visualizador', description: 'Apenas visualização', permissions: ['contracts:read', 'customers:read'] },
            ]
          }
        },
        include: { roleProfiles: true }
      });
      console.log(`✅ Tenant criado: ${tenant.name} (slug: ${tenant.slug})`);
    }

    // 4. Criar usuário admin
    const existingUser = await publicPrisma.user.findUnique({ where: { email: adminEmail } });
    let user: any;
    if (existingUser) {
      user = existingUser;
      console.log(`⚠️  Usuário admin já existe: ${user.email}`);
    } else {
      user = await publicPrisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Administrador Lefer',
        },
      });
      console.log(`✅ Usuário admin criado: ${user.email}`);
    }

    // 5. Vincular usuário ao tenant
    const existingLink = await publicPrisma.userTenant.findFirst({
      where: { userId: user.id, tenantId: tenant.id },
    });
    if (!existingLink) {
      const adminProfile = tenant.roleProfiles?.find((p: any) => p.name === 'Admin');
      await publicPrisma.userTenant.create({
        data: { userId: user.id, tenantId: tenant.id, roleProfileId: adminProfile?.id },
      });
      console.log(`✅ Usuário vinculado ao tenant`);
    } else {
      console.log(`⚠️  Usuário já está vinculado ao tenant`);
    }

    // 6. Provisionar Dados Iniciais para os Testes E2E (Mocks no Banco de Dados)
    const { prisma: tenantPrisma, pool: tenantPool } = await getPrismaClient(schemaName);
    try {
      // 6.1 Criar Produto Padrão se não existir
      const existingProduct = await tenantPrisma.softwareProduct.findUnique({ where: { id: 'prod1' } });
      if (!existingProduct) {
        const product = await tenantPrisma.softwareProduct.create({
          data: {
            id: 'prod1',
            name: 'Gestão de Estoque Pro',
            description: 'Produto para automação E2E',
            isActive: true,
          }
        });
        
        await tenantPrisma.softwareModule.createMany({
          data: [
            { id: 'mod1', productId: product.id, name: 'Módulo Base', price: 500.0, isBaseOffer: true, isActive: true },
            { id: 'mod2', productId: product.id, name: 'Módulo Fiscal', price: 800.0, isBaseOffer: false, isActive: true }
          ]
        });
        console.log(`✅ Produto e Módulos de Teste criados no tenant`);
      }

      // 6.2 Criar Cliente Padrão se não existir (necessário para alguns testes que não criam cliente)
      const existingCustomer = await tenantPrisma.customer.findUnique({ where: { id: 'cust1' } });
      if (!existingCustomer) {
        await tenantPrisma.customer.create({
          data: {
            id: 'cust1',
            document: '99999999000199',
            corporateName: 'Cliente Base E2E',
          }
        });
        console.log(`✅ Cliente de Teste E2E criado no tenant`);
      }
    } finally {
      await tenantPrisma.$disconnect();
      await tenantPool.end();
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log(`   Portal ERP: http://localhost:3000/login`);
    console.log(`   Admin:      ${adminEmail}`);
    console.log(`   Senha:      ${adminPassword}`);
    console.log(`   Portal Cliente: http://localhost:3000/portal/empresaautomacao`);
  } finally {
    await publicPrisma.$disconnect();
    await publicPool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
