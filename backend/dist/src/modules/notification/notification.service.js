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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const tenant_module_1 = require("../../tenant/tenant.module");
const nodemailer = __importStar(require("nodemailer"));
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    transporter;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
        this.initMailer();
    }
    async initMailer() {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        this.logger.log(`Ethereal Email account created: ${testAccount.user}`);
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
    replaceVariables(text, data) {
        return text.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
            const keys = path.split('.');
            let current = data;
            for (const key of keys) {
                if (current === undefined || current === null)
                    return match;
                current = current[key];
            }
            return current !== undefined ? String(current) : match;
        });
    }
    async sendNotification(templateName, toEmail, data) {
        try {
            const template = await this.prisma.notificationTemplate.findUnique({
                where: { name: templateName },
            });
            if (!template || !template.isActive) {
                this.logger.warn(`Template ${templateName} not found or inactive. Skipping email.`);
                return null;
            }
            const subject = this.replaceVariables(template.subject, data);
            const content = this.replaceVariables(template.content, data);
            const info = await this.transporter.sendMail({
                from: '"Gestão de Contratos" <no-reply@gestaocontratos.local>',
                to: toEmail,
                subject: subject,
                html: content,
            });
            this.logger.log(`Message sent: ${info.messageId}`);
            this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            return info;
        }
        catch (error) {
            this.logger.error(`Error sending notification: ${error.message}`);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], NotificationService);
//# sourceMappingURL=notification.service.js.map