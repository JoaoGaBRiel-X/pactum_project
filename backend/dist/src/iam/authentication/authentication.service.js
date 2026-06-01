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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const otplib_1 = require("otplib");
let AuthenticationService = class AuthenticationService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(dto) {
        const user = await this.prisma.client.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (user.mfaEnabled) {
            return {
                mfaRequired: true,
                email: user.email,
                message: 'Autenticação de 2 fatores necessária.',
            };
        }
        return this.generateTokens(user.id, dto.keepConnected || false);
    }
    async verifyMfa(dto) {
        const user = await this.prisma.client.user.findUnique({
            where: { email: dto.email },
        });
        if (!user || !user.mfaSecret) {
            throw new common_1.UnauthorizedException('MFA não está configurado para este usuário');
        }
        const isValid = otplib_1.authenticator.verify({
            token: dto.token,
            secret: user.mfaSecret,
        });
        if (!isValid) {
            throw new common_1.UnauthorizedException('Código MFA inválido');
        }
        return this.generateTokens(user.id, dto.keepConnected || false);
    }
    async setupMfa(userId) {
        const secret = otplib_1.authenticator.generateSecret();
        const user = await this.prisma.client.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        await this.prisma.client.user.update({
            where: { id: userId },
            data: { mfaSecret: secret, mfaEnabled: false },
        });
        const otpauthUrl = otplib_1.authenticator.keyuri(user.email, 'Gestao_Contratos', secret);
        return {
            secret,
            otpauthUrl,
        };
    }
    async enableMfa(userId, token) {
        const user = await this.prisma.client.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.mfaSecret)
            throw new common_1.NotFoundException('MFA Secret não configurado');
        const isValid = otplib_1.authenticator.verify({
            token,
            secret: user.mfaSecret,
        });
        if (!isValid) {
            throw new common_1.UnauthorizedException('Código MFA inválido');
        }
        await this.prisma.client.user.update({
            where: { id: userId },
            data: { mfaEnabled: true },
        });
        return { message: 'MFA habilitado com sucesso' };
    }
    async generateTokens(userId, keepConnected) {
        const payload = { sub: userId, kc: keepConnected };
        const refreshExpiresIn = keepConnected ? '4h' : '15m';
        return {
            accessToken: await this.jwtService.signAsync(payload, {
                expiresIn: '15m',
            }),
            refreshToken: await this.jwtService.signAsync(payload, {
                expiresIn: refreshExpiresIn,
            }),
        };
    }
    async getUserTenants(userId) {
        const user = await this.prisma.client.user.findUnique({
            where: { id: userId },
            select: { isSuperAdmin: true },
        });
        if (user?.isSuperAdmin) {
            const allTenants = await this.prisma.client.tenant.findMany();
            return allTenants.map((t) => ({
                tenantId: t.id,
                name: t.name,
                document: t.document,
                role: 'SUPERADMIN',
            }));
        }
        const userTenants = await this.prisma.client.userTenant.findMany({
            where: { userId },
            include: {
                tenant: true,
            },
        });
        return userTenants.map((ut) => ({
            tenantId: ut.tenantId,
            name: ut.tenant.name,
            document: ut.tenant.document,
            role: ut.role,
        }));
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            return this.generateTokens(payload.sub, payload.kc || false);
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Token de renovação inválido ou expirado');
        }
    }
};
exports.AuthenticationService = AuthenticationService;
exports.AuthenticationService = AuthenticationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthenticationService);
//# sourceMappingURL=authentication.service.js.map