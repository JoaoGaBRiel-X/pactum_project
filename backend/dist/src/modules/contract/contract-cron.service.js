"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ContractCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
require("dotenv/config");
const cronClientCache = new Map();
async function getCronTenantClient(schemaName) {
    if (cronClientCache.has(schemaName)) {
        return cronClientCache.get(schemaName);
    }
    const dbUrl = new URL(process.env.DATABASE_URL);
    const pool = new pg_1.Pool({
        user: dbUrl.username,
        password: dbUrl.password,
        host: dbUrl.hostname,
        port: parseInt(dbUrl.port, 10),
        database: dbUrl.pathname.slice(1),
        max: 3,
    });
    const adapter = new adapter_pg_1.PrismaPg(pool, { schema: schemaName });
    const client = new client_1.PrismaClient({ adapter });
    await client.$connect();
    cronClientCache.set(schemaName, client);
    return client;
}
let ContractCronService = ContractCronService_1 = class ContractCronService {
    prisma;
    logger = new common_1.Logger(ContractCronService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleContractRenewals() {
        this.logger.log('Iniciando processamento de renovação automática de contratos...');
        const tenants = await this.prisma.client.tenant.findMany();
        for (const tenant of tenants) {
            try {
                const schema = tenant.schema;
                this.logger.log(`Processando tenant: ${schema}`);
                const tenantPrisma = await getCronTenantClient(schema);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const contractsToRenew = await tenantPrisma.contract.findMany({
                    where: {
                        status: 'ACTIVE',
                        renewalMode: 'AUTOMATIC',
                        endDate: { lte: today },
                    },
                    include: { items: true },
                });
                for (const contract of contractsToRenew) {
                    try {
                        await tenantPrisma.$transaction(async (tx) => {
                            const newStartDate = new Date();
                            const newEndDate = new Date();
                            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
                            await tx.contract.update({
                                where: { id: contract.id },
                                data: { startDate: newStartDate, endDate: newEndDate, updatedBy: 'system-cron' },
                            });
                            const items = await tx.contractItem.findMany({ where: { contractId: contract.id } });
                            const modulesPayload = {
                                globalDiscount: Number(contract.globalDiscount),
                                items: items.map((it) => ({
                                    moduleId: it.moduleId,
                                    quantity: it.quantity,
                                    unitPrice: Number(it.unitPrice),
                                    discount: Number(it.discount),
                                })),
                            };
                            await tx.contractHistory.create({
                                data: {
                                    contractId: contract.id,
                                    status: 'ACTIVE',
                                    totalValue: contract.totalValue,
                                    changedBy: 'system-cron',
                                    reason: 'Renovação automática',
                                    modulesPayload,
                                },
                            });
                            this.logger.log(`Contrato ${contract.id} renovado automaticamente no tenant ${schema}.`);
                        });
                    }
                    catch (contractError) {
                        this.logger.error(`Erro ao renovar contrato ${contract.id} no tenant ${schema}: ${contractError.message}`);
                    }
                }
            }
            catch (tenantError) {
                this.logger.error(`Erro ao processar renovações no tenant ${tenant.schema}: ${tenantError.message}`);
            }
        }
        this.logger.log('Processamento de renovações concluído.');
    }
};
exports.ContractCronService = ContractCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractCronService.prototype, "handleContractRenewals", null);
exports.ContractCronService = ContractCronService = ContractCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractCronService);
//# sourceMappingURL=contract-cron.service.js.map