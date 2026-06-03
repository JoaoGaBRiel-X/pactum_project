"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcrypt"));
const child_process = __importStar(require("child_process"));
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process.exec);
async function getPrismaClient(schema = 'public') {
    const url = new URL(process.env.DATABASE_URL);
    const pool = new pg_1.Pool({
        user: url.username,
        password: url.password,
        host: url.hostname,
        port: parseInt(url.port, 10),
        database: url.pathname.slice(1),
        options: `-c search_path=${schema}`,
    });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const prisma = new client_1.PrismaClient({ adapter });
    await prisma.$connect();
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
        await publicPrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
        console.log(`✅ Schema "${schemaName}" criado/verificado`);
        const dbUrl = new URL(process.env.DATABASE_URL);
        dbUrl.searchParams.set('schema', schemaName);
        const pushUrl = dbUrl.toString();
        await execAsync(`npx prisma db push --accept-data-loss --url "${pushUrl}"`, {
            env: { ...process.env },
            cwd: process.cwd(),
        });
        console.log(`✅ Tabelas provisionadas no schema "${schemaName}"`);
        const existingTenant = await publicPrisma.tenant.findFirst({ where: { document: '12345678000100' } });
        let tenant;
        if (existingTenant) {
            tenant = existingTenant;
            console.log(`⚠️  Tenant já existe: ${tenant.name}`);
        }
        else {
            tenant = await publicPrisma.tenant.create({
                data: {
                    name: 'Empresa de Automação Demo',
                    document: '12345678000100',
                    schema: schemaName,
                    slug: 'empresaautomacao',
                    legalRepName: 'João Demo',
                    legalRepCpf: '12345678901',
                },
            });
            console.log(`✅ Tenant criado: ${tenant.name} (slug: ${tenant.slug})`);
        }
        const existingUser = await publicPrisma.user.findUnique({ where: { email: adminEmail } });
        let user;
        if (existingUser) {
            user = existingUser;
            console.log(`⚠️  Usuário admin já existe: ${user.email}`);
        }
        else {
            user = await publicPrisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: 'Administrador Lefer',
                },
            });
            console.log(`✅ Usuário admin criado: ${user.email}`);
        }
        const existingLink = await publicPrisma.userTenant.findFirst({
            where: { userId: user.id, tenantId: tenant.id },
        });
        if (!existingLink) {
            await publicPrisma.userTenant.create({
                data: { userId: user.id, tenantId: tenant.id, role: 'ADMIN' },
            });
            console.log(`✅ Usuário vinculado ao tenant`);
        }
        else {
            console.log(`⚠️  Usuário já está vinculado ao tenant`);
        }
        const { prisma: tenantPrisma, pool: tenantPool } = await getPrismaClient(schemaName);
        try {
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
        }
        finally {
            await tenantPrisma.$disconnect();
            await tenantPool.end();
        }
        console.log('\n🎉 Seed concluído com sucesso!');
        console.log(`   Portal ERP: http://localhost:3000/login`);
        console.log(`   Admin:      ${adminEmail}`);
        console.log(`   Senha:      ${adminPassword}`);
        console.log(`   Portal Cliente: http://localhost:3000/portal/empresaautomacao`);
    }
    finally {
        await publicPrisma.$disconnect();
        await publicPool.end();
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map