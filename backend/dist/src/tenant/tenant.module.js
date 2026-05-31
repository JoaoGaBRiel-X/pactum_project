"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantModule = exports.TENANT_PRISMA_SERVICE = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_service_1 = require("../prisma/prisma.service");
require("dotenv/config");
exports.TENANT_PRISMA_SERVICE = 'TENANT_PRISMA_SERVICE';
const tenantClientCache = new Map();
async function getTenantClient(schemaName) {
    if (tenantClientCache.has(schemaName)) {
        return tenantClientCache.get(schemaName);
    }
    const dbUrl = new URL(process.env.DATABASE_URL);
    const pool = new pg_1.Pool({
        user: dbUrl.username,
        password: dbUrl.password,
        host: dbUrl.hostname,
        port: parseInt(dbUrl.port, 10),
        database: dbUrl.pathname.slice(1),
        max: 5,
    });
    const adapter = new adapter_pg_1.PrismaPg(pool, { schema: schemaName });
    const client = new client_1.PrismaClient({ adapter });
    await client.$connect();
    tenantClientCache.set(schemaName, client);
    return client;
}
let TenantModule = class TenantModule {
};
exports.TenantModule = TenantModule;
exports.TenantModule = TenantModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            prisma_service_1.PrismaService,
            {
                provide: exports.TENANT_PRISMA_SERVICE,
                scope: common_1.Scope.REQUEST,
                inject: [core_1.REQUEST, prisma_service_1.PrismaService],
                useFactory: async (request, prisma) => {
                    const tenantId = request.headers['x-tenant-id'];
                    if (tenantId) {
                        const tenant = await prisma.client.tenant.findUnique({
                            where: { id: tenantId },
                            select: { schema: true },
                        });
                        if (tenant?.schema) {
                            return getTenantClient(tenant.schema);
                        }
                    }
                    return prisma.client;
                },
            },
        ],
        exports: [prisma_service_1.PrismaService, exports.TENANT_PRISMA_SERVICE],
    })
], TenantModule);
//# sourceMappingURL=tenant.module.js.map