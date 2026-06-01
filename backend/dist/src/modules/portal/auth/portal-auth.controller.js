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
exports.PortalAuthController = void 0;
const common_1 = require("@nestjs/common");
const portal_auth_service_1 = require("./portal-auth.service");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../../iam/decorators/public.decorator");
let PortalAuthController = class PortalAuthController {
    portalAuthService;
    constructor(portalAuthService) {
        this.portalAuthService = portalAuthService;
    }
    login(tenantSlug, body) {
        return this.portalAuthService.login(tenantSlug, body.email, body.password, body.keepConnected);
    }
    refreshTokens(body) {
        return this.portalAuthService.refreshTokens(body.refreshToken);
    }
    setupPassword(body) {
        return this.portalAuthService.setupPassword(body.token, body.password);
    }
    requestMagicLink(tenantSlug, body) {
        return this.portalAuthService.requestMagicLink(tenantSlug, body.email);
    }
};
exports.PortalAuthController = PortalAuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login for Customer Contacts' }),
    __param(0, (0, common_1.Param)('tenantSlug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortalAuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Renova os tokens usando o Refresh Token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalAuthController.prototype, "refreshTokens", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('setup-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Definir nova senha através do Magic Link' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalAuthController.prototype, "setupPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('request-magic-link'),
    (0, swagger_1.ApiOperation)({ summary: 'Solicitar envio do Magic Link para acesso' }),
    __param(0, (0, common_1.Param)('tenantSlug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortalAuthController.prototype, "requestMagicLink", null);
exports.PortalAuthController = PortalAuthController = __decorate([
    (0, swagger_1.ApiTags)('Portal Authentication'),
    (0, common_1.Controller)('portal/:tenantSlug/auth'),
    __metadata("design:paramtypes", [portal_auth_service_1.PortalAuthService])
], PortalAuthController);
//# sourceMappingURL=portal-auth.controller.js.map