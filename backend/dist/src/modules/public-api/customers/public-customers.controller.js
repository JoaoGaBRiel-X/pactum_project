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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicCustomersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../prisma/prisma.service");
const jwt_auth_guard_1 = require("../../../iam/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../../iam/guards/tenant.guard");
const throttler_1 = require("@nestjs/throttler");
let PublicCustomersController = class PublicCustomersController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(req) {
        const schema = req.user.schema;
        const query = `SELECT * FROM ${schema}.customers LIMIT 100`;
        const result = await this.prisma.client.$queryRawUnsafe(query);
        return result;
    }
};
exports.PublicCustomersController = PublicCustomersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar clientes do locatário (Tenant)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de clientes retornada com sucesso' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicCustomersController.prototype, "findAll", null);
exports.PublicCustomersController = PublicCustomersController = __decorate([
    (0, swagger_1.ApiTags)('Public API - Customers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiHeader)({
        name: 'x-tenant-id',
        description: 'ID do Locatário (Tenant) que a API Key pertence',
        required: true,
    }),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard, jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, common_1.Controller)('public/customers'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicCustomersController);
//# sourceMappingURL=public-customers.controller.js.map