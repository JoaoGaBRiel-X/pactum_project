"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
require("dotenv/config");
const child_process_1 = require("child_process");
const dbUrl = new URL(process.env.DATABASE_URL);
const pool = new pg_1.Pool({
    user: dbUrl.username,
    password: dbUrl.password,
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port, 10),
    database: dbUrl.pathname.slice(1),
    max: 5,
});
const adapter = new adapter_pg_1.PrismaPg(pool, { schema: 'public' });
const prisma = new client_1.PrismaClient({ adapter });
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
        try {
            (0, child_process_1.execSync)(`npx prisma migrate dev --schema=prisma/tenant.schema.prisma --name init`);
            console.log('Schema do tenant inicializado!');
        }
        catch (e) {
            console.log('Erro ao inicializar schema do tenant (pode já existir ou ser manual):', e.message);
        }
    }
    else {
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
//# sourceMappingURL=seed-tenant.js.map