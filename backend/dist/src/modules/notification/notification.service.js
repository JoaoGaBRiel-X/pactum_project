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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
const tenant_module_1 = require("../../tenant/tenant.module");
const prisma_service_1 = require("../../prisma/prisma.service");
const bull_1 = require("@nestjs/bull");
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    publicPrisma;
    emailQueue;
    request;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(prisma, publicPrisma, emailQueue, request) {
        this.prisma = prisma;
        this.publicPrisma = publicPrisma;
        this.emailQueue = emailQueue;
        this.request = request;
    }
    async findAll() {
        return this.prisma.notificationTemplate.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const template = await this.prisma.notificationTemplate.findUnique({ where: { id } });
        if (!template)
            throw new common_1.NotFoundException('Template não encontrado');
        return template;
    }
    async create(data, userId) {
        return this.prisma.notificationTemplate.create({
            data: {
                name: data.name,
                category: data.category || 'COMMERCIAL',
                subject: data.subject,
                content: data.content,
                isActive: data.isActive !== undefined ? data.isActive : true,
                createdBy: userId,
            },
        });
    }
    async update(id, data, userId) {
        return this.prisma.notificationTemplate.update({
            where: { id },
            data: {
                name: data.name,
                category: data.category,
                subject: data.subject,
                content: data.content,
                isActive: data.isActive,
                updatedBy: userId,
            },
        });
    }
    async remove(id) {
        return this.prisma.notificationTemplate.delete({ where: { id } });
    }
    async findHistoryByCustomer(customerId) {
        return this.prisma.communicationHistory.findMany({
            where: { customerId },
            orderBy: { sentAt: 'desc' },
        });
    }
    async sendNotification(templateName, toEmail, data, customerId, userId) {
        try {
            const template = await this.prisma.notificationTemplate.findUnique({
                where: { name: templateName },
            });
            if (!template || !template.isActive) {
                this.logger.warn(`Template ${templateName} not found or inactive. Skip queue.`);
                return null;
            }
            let tenantSchema = null;
            const tenantId = this.request?.headers?.['x-tenant-id'];
            if (tenantId) {
                const tenant = await this.publicPrisma.client.tenant.findUnique({
                    where: { id: tenantId },
                    select: { schema: true },
                });
                tenantSchema = tenant?.schema ?? null;
            }
            await this.emailQueue.add('send-notification', {
                templateName,
                toEmail,
                data,
                customerId,
                userId,
                tenantSchema,
            }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 }
            });
            this.logger.log(`Job queued for template ${templateName} to ${toEmail} (schema: ${tenantSchema})`);
            return { success: true, message: 'Enfileirado com sucesso' };
        }
        catch (error) {
            this.logger.error(`Error queuing notification: ${error.message}`);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __param(2, (0, bull_1.InjectQueue)('email')),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        prisma_service_1.PrismaService, Object, Object])
], NotificationService);
//# sourceMappingURL=notification.service.js.map