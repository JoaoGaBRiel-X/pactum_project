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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditInterceptor = class AuditInterceptor {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const { method, url, body, user } = req;
        return next.handle().pipe((0, operators_1.tap)(async (data) => {
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                const tenantId = req.headers['x-tenant-id'];
                const userId = user?.id || 'system-user';
                if (tenantId) {
                    try {
                        await this.prisma.$transaction([
                            this.prisma.$executeRawUnsafe(`SET search_path TO "${tenantId}"`),
                            this.prisma.auditLog.create({
                                data: {
                                    action: method,
                                    tableName: url.split('?')[0],
                                    recordId: data?.id || 'unknown',
                                    newPayload: body,
                                    userId: userId,
                                }
                            })
                        ]);
                    }
                    catch (e) {
                        console.error('Failed to save audit log', e);
                    }
                }
            }
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map