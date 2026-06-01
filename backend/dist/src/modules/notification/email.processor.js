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
var EmailProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const tenant_module_1 = require("../../tenant/tenant.module");
const nodemailer = __importStar(require("nodemailer"));
let EmailProcessor = EmailProcessor_1 = class EmailProcessor {
    logger = new common_1.Logger(EmailProcessor_1.name);
    transporter;
    constructor() {
        this.initMailer();
    }
    async initMailer() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: Number(process.env.SMTP_PORT) || 1025,
            secure: false,
            ignoreTLS: true,
        });
        this.logger.log(`Mailpit Email worker ready no host: ${process.env.SMTP_HOST || 'localhost'}`);
    }
    replaceVariables(text, data) {
        if (!text)
            return '';
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
    async handleSendNotification(job) {
        const { templateName, toEmail, data, customerId, userId, tenantSchema } = job.data;
        this.logger.log(`Processing email job for ${toEmail} using template ${templateName} (schema: ${tenantSchema})`);
        if (!tenantSchema) {
            this.logger.error(`No tenantSchema provided in job data. Cannot process job.`);
            return;
        }
        const prisma = await (0, tenant_module_1.getTenantClient)(tenantSchema);
        let historyRecordId = null;
        try {
            const template = await prisma.notificationTemplate.findUnique({
                where: { name: templateName },
            });
            if (!template || !template.isActive) {
                this.logger.warn(`Template ${templateName} not found or inactive. Job skipped.`);
                return;
            }
            const subject = this.replaceVariables(template.subject, data);
            const content = this.replaceVariables(template.content, data);
            if (customerId) {
                const history = await prisma.communicationHistory.create({
                    data: {
                        customerId,
                        templateName,
                        subject,
                        content,
                        recipient: toEmail,
                        status: 'PENDING',
                        createdBy: userId,
                    }
                });
                historyRecordId = history.id;
            }
            const info = await this.transporter.sendMail({
                from: '"Gestão de Contratos" <no-reply@gestaocontratos.local>',
                to: toEmail,
                subject: subject,
                html: content,
            });
            this.logger.log(`Message sent: ${info.messageId}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            if (historyRecordId) {
                await prisma.communicationHistory.update({
                    where: { id: historyRecordId },
                    data: { status: 'SENT' }
                });
            }
            return { messageId: info.messageId };
        }
        catch (error) {
            this.logger.error(`Error sending notification: ${error.message}`);
            if (historyRecordId) {
                await prisma.communicationHistory.update({
                    where: { id: historyRecordId },
                    data: { status: 'FAILED', errorMessage: error.message }
                });
            }
            throw error;
        }
    }
};
exports.EmailProcessor = EmailProcessor;
__decorate([
    (0, bull_1.Process)('send-notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handleSendNotification", null);
exports.EmailProcessor = EmailProcessor = EmailProcessor_1 = __decorate([
    (0, bull_1.Processor)('email'),
    __metadata("design:paramtypes", [])
], EmailProcessor);
//# sourceMappingURL=email.processor.js.map