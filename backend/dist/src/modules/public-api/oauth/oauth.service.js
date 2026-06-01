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
exports.OAuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
let OAuthService = class OAuthService {
    globalPrisma;
    jwtService;
    constructor(globalPrisma, jwtService) {
        this.globalPrisma = globalPrisma;
        this.jwtService = jwtService;
    }
    async generateToken(dto) {
        if (dto.grant_type !== 'client_credentials') {
            throw new common_1.BadRequestException('Unsupported grant type');
        }
        const apiClient = await this.globalPrisma.client.apiClient.findUnique({
            where: { clientId: dto.client_id },
            include: { tenant: true },
        });
        if (!apiClient) {
            throw new common_1.UnauthorizedException('Invalid client_id or client_secret');
        }
        const isMatch = await bcrypt.compare(dto.client_secret, apiClient.clientSecretHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid client_id or client_secret');
        }
        const payload = {
            sub: apiClient.id,
            clientId: apiClient.clientId,
            tenantId: apiClient.tenantId,
            schema: apiClient.tenant.schema,
            role: 'API_CLIENT',
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600,
        };
    }
};
exports.OAuthService = OAuthService;
exports.OAuthService = OAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], OAuthService);
//# sourceMappingURL=oauth.service.js.map