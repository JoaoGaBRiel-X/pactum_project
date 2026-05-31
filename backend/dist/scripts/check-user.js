"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
require("dotenv/config");
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
    const user = await prisma.user.findFirst({ where: { email: 'admin@lefer.com.br' } });
    console.log(user);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check-user.js.map