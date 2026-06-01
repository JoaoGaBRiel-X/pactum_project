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
var PortalAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalAuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const tenant_module_1 = require("../../../tenant/tenant.module");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const nodemailer = __importStar(require("nodemailer"));
let PortalAuthService = PortalAuthService_1 = class PortalAuthService {
    globalPrisma;
    jwtService;
    logger = new common_1.Logger(PortalAuthService_1.name);
    transporter;
    constructor(globalPrisma, jwtService) {
        this.globalPrisma = globalPrisma;
        this.jwtService = jwtService;
        this.transporter = nodemailer.createTransport({
            host: 'localhost',
            port: 1025,
            ignoreTLS: true,
        });
    }
    async login(tenantSlug, email, passwordString) {
        const tenant = await this.globalPrisma.client.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Empresa não encontrada');
        }
        if (!tenant.schema) {
            throw new common_1.UnauthorizedException('Configuração da empresa inválida');
        }
        const tenantPrisma = await (0, tenant_module_1.getTenantClient)(tenant.schema);
        const contacts = await tenantPrisma.contact.findMany({
            where: { email },
        });
        if (contacts.length === 0) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const contact = contacts.find(c => c.portalAccess);
        if (!contact) {
            throw new common_1.UnauthorizedException('Este contato não possui acesso ao portal. Fale com seu gestor.');
        }
        if (!contact.passwordHash) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const isValid = await argon2.verify(contact.passwordHash, passwordString).catch(() => false);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const payload = {
            sub: contact.id,
            email: contact.email,
            role: 'CUSTOMER',
            tenantId: tenant.id,
            tenantSlug: tenant.schema,
            customerId: contact.customerId,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: contact.id,
                name: contact.name,
                email: contact.email,
                role: 'CUSTOMER',
                tenantId: tenant.id,
            }
        };
    }
    async generateSetupToken(tenantSlug, contactId, email) {
        const tenant = await this.globalPrisma.client.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Empresa não encontrada');
        const token = this.jwtService.sign({ sub: contactId, email, tenantSlug: tenant.schema, setup: true }, { expiresIn: '24h' });
        const setupLink = `http://localhost:3000/portal/${tenantSlug}/setup-password?token=${token}`;
        try {
            await this.transporter.sendMail({
                from: '"Portal do Cliente" <no-reply@gestaocontratos.local>',
                to: email,
                subject: 'Crie sua senha de acesso ao Portal',
                html: `
          <h2>Bem-vindo ao Portal do Cliente!</h2>
          <p>Você recebeu acesso ao portal de contratos e faturas. Para começar, por favor defina sua senha clicando no link abaixo:</p>
          <p><a href="${setupLink}" style="display:inline-block;padding:10px 20px;background:#1E40AF;color:#fff;text-decoration:none;border-radius:5px;">Configurar Minha Senha</a></p>
          <p>Se você não solicitou este acesso, apenas ignore este e-mail.</p>
          <p><em>Este link é válido por 24 horas.</em></p>
        `,
            });
            this.logger.log(`Magic Link enviado para ${email}`);
        }
        catch (error) {
            this.logger.error(`Erro ao enviar Magic Link para ${email}: ${error.message}`);
            throw new common_1.BadRequestException('Não foi possível enviar o e-mail de configuração de senha.');
        }
        return { message: 'E-mail enviado com sucesso.' };
    }
    async requestMagicLink(tenantSlug, email) {
        const tenant = await this.globalPrisma.client.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Empresa não encontrada');
        const tenantClient = await (0, tenant_module_1.getTenantClient)(tenant.schema);
        const contact = await tenantClient.contact.findFirst({
            where: { email, portalAccess: true },
        });
        if (!contact) {
            this.logger.warn(`Tentativa de magic link para email não autorizado/inexistente no portal: ${email}`);
            return { message: 'Se o e-mail estiver cadastrado e possuir acesso ao portal, você receberá um link em breve.' };
        }
        await this.generateSetupToken(tenantSlug, contact.id, contact.email);
        return { message: 'Se o e-mail estiver cadastrado e possuir acesso ao portal, você receberá um link em breve.' };
    }
    async setupPassword(token, passwordString) {
        try {
            const payload = this.jwtService.verify(token);
            if (!payload.setup) {
                throw new common_1.BadRequestException('Token inválido para esta operação.');
            }
            const { sub: contactId, tenantSlug } = payload;
            const tenantPrisma = await (0, tenant_module_1.getTenantClient)(tenantSlug);
            const hashedPassword = await argon2.hash(passwordString);
            await tenantPrisma.contact.update({
                where: { id: contactId },
                data: {
                    passwordHash: hashedPassword,
                    portalAccess: true,
                }
            });
            return { message: 'Senha definida com sucesso.' };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido ou expirado.');
        }
    }
};
exports.PortalAuthService = PortalAuthService;
exports.PortalAuthService = PortalAuthService = PortalAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], PortalAuthService);
//# sourceMappingURL=portal-auth.service.js.map