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
const prisma_service_1 = require("../prisma/prisma.service");
exports.TENANT_PRISMA_SERVICE = 'TENANT_PRISMA_SERVICE';
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
                useFactory: (request, prisma) => {
                    const tenantId = request.headers['x-tenant-id'];
                    if (tenantId) {
                        return prisma.client.$extends({
                            query: {
                                $allModels: {
                                    async $allOperations({ args, query }) {
                                        const [, result] = await prisma.client.$transaction([
                                            prisma.client.$executeRawUnsafe(`SET search_path TO "${tenantId}"`),
                                            query(args),
                                        ]);
                                        return result;
                                    },
                                },
                            },
                        });
                    }
                    return prisma.client;
                },
            },
        ],
        exports: [prisma_service_1.PrismaService, exports.TENANT_PRISMA_SERVICE],
    })
], TenantModule);
//# sourceMappingURL=tenant.module.js.map