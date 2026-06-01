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
exports.OAuthController = void 0;
const common_1 = require("@nestjs/common");
const oauth_service_1 = require("./oauth.service");
const swagger_1 = require("@nestjs/swagger");
const token_request_dto_1 = require("./dto/token-request.dto");
const public_decorator_1 = require("../../../iam/decorators/public.decorator");
let OAuthController = class OAuthController {
    oauthService;
    constructor(oauthService) {
        this.oauthService = oauthService;
    }
    async getToken(dto) {
        return this.oauthService.generateToken(dto);
    }
};
exports.OAuthController = OAuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Obter access token via Client Credentials' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token gerado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciais inválidas' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [token_request_dto_1.TokenRequestDto]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "getToken", null);
exports.OAuthController = OAuthController = __decorate([
    (0, swagger_1.ApiTags)('Public API - OAuth'),
    (0, common_1.Controller)('public/oauth'),
    __metadata("design:paramtypes", [oauth_service_1.OAuthService])
], OAuthController);
//# sourceMappingURL=oauth.controller.js.map