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
exports.PortalFinancialController = void 0;
const common_1 = require("@nestjs/common");
const portal_financial_service_1 = require("./portal-financial.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../iam/guards/jwt-auth.guard");
let PortalFinancialController = class PortalFinancialController {
    portalFinancialService;
    constructor(portalFinancialService) {
        this.portalFinancialService = portalFinancialService;
    }
    findAll(tenantSlug, req) {
        const customerId = req.user.customerId;
        return this.portalFinancialService.findAll(tenantSlug, customerId);
    }
};
exports.PortalFinancialController = PortalFinancialController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List receivables for logged customer' }),
    __param(0, (0, common_1.Param)('tenantSlug')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortalFinancialController.prototype, "findAll", null);
exports.PortalFinancialController = PortalFinancialController = __decorate([
    (0, swagger_1.ApiTags)('Portal Financial'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('portal/:tenantSlug/financial'),
    __metadata("design:paramtypes", [portal_financial_service_1.PortalFinancialService])
], PortalFinancialController);
//# sourceMappingURL=portal-financial.controller.js.map