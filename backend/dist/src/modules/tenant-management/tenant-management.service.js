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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TenantManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const uuid_1 = require("uuid");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let TenantManagementService = TenantManagementService_1 = class TenantManagementService {
    prisma;
    logger = new common_1.Logger(TenantManagementService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTenant(dto) {
        const existingTenant = await this.prisma.client.tenant.findUnique({
            where: { document: dto.document },
        });
        if (existingTenant) {
            throw new common_1.ConflictException('Já existe um locatário com este CNPJ.');
        }
        const existingUser = await this.prisma.client.user.findUnique({
            where: { email: dto.adminEmail },
        });
        const schemaName = `tenant_${(0, uuid_1.v4)().replace(/-/g, '').toLowerCase()}`;
        const generatedPassword = dto.adminPassword || Math.random().toString(36).slice(-8) + 'A@1';
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        try {
            await this.prisma.client.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
            this.logger.log(`Schema ${schemaName} criado com sucesso no banco de dados.`);
        }
        catch (error) {
            this.logger.error(`Erro ao criar schema ${schemaName}:`, error);
            throw new common_1.InternalServerErrorException('Falha ao criar o schema no banco de dados.');
        }
        try {
            const dbUrl = new URL(process.env.DATABASE_URL);
            dbUrl.searchParams.set('schema', schemaName);
            const pushUrl = dbUrl.toString();
            this.logger.log(`Executando prisma db push para o schema ${schemaName}...`);
            await execAsync('npx prisma db push --accept-data-loss', {
                env: {
                    ...process.env,
                    DATABASE_URL: pushUrl,
                }
            });
            this.logger.log(`Tabelas provisionadas com sucesso para ${schemaName}.`);
        }
        catch (error) {
            this.logger.error(`Erro ao rodar db push para ${schemaName}: ${error.message}`);
            await this.prisma.client.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
            throw new common_1.InternalServerErrorException('Falha ao provisionar tabelas do locatário.');
        }
        const tenant = await this.prisma.client.tenant.create({
            data: {
                name: dto.name,
                document: dto.document,
                schema: schemaName,
            },
        });
        if (existingUser) {
            await this.prisma.client.userTenant.create({
                data: {
                    userId: existingUser.id,
                    tenantId: tenant.id,
                    role: 'ADMIN',
                },
            });
        }
        else {
            await this.prisma.client.user.create({
                data: {
                    email: dto.adminEmail,
                    password: hashedPassword,
                    name: dto.adminName,
                    tenantLinks: {
                        create: {
                            tenantId: tenant.id,
                            role: 'ADMIN',
                        },
                    },
                },
            });
        }
        return { tenant, temporaryPassword: generatedPassword };
    }
    async listTenants() {
        return this.prisma.client.tenant.findMany({
            include: {
                _count: {
                    select: { userLinks: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
};
exports.TenantManagementService = TenantManagementService;
exports.TenantManagementService = TenantManagementService = TenantManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantManagementService);
//# sourceMappingURL=tenant-management.service.js.map