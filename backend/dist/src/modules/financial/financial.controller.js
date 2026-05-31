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
exports.FinancialController = void 0;
const common_1 = require("@nestjs/common");
const financial_service_1 = require("./financial.service");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
let FinancialController = class FinancialController {
    financialService;
    constructor(financialService) {
        this.financialService = financialService;
    }
    findAllReceivables() {
        return this.financialService.findAllReceivables();
    }
    generateBilling(req) {
        const userId = req.user?.id || 'system-user';
        return this.financialService.generateBilling(userId);
    }
    registerPayment(body, file, req) {
        const userId = req.user?.id || 'system-user';
        const { receivableId, amount, method } = body;
        if (!receivableId || !amount || !method) {
            throw new common_1.BadRequestException('Faltam campos obrigatórios: receivableId, amount, method.');
        }
        return this.financialService.registerPayment(receivableId, Number(amount), method, file?.buffer, file?.originalname, userId);
    }
    createRenegotiation(body, req) {
        const userId = req.user?.id || 'system-user';
        const { customerId, receivableIds, discount } = body;
        if (!customerId || !receivableIds || !Array.isArray(receivableIds)) {
            throw new common_1.BadRequestException('Faltam campos obrigatórios ou inválidos: customerId, receivableIds.');
        }
        return this.financialService.createRenegotiation(customerId, receivableIds, Number(discount || 0), userId);
    }
    uploadBoleto(id, file, req) {
        const userId = req.user?.id || 'system-user';
        if (!file) {
            throw new common_1.BadRequestException('O arquivo do boleto é obrigatório.');
        }
        return this.financialService.uploadBoleto(id, file.buffer, file.originalname, userId);
    }
};
exports.FinancialController = FinancialController;
__decorate([
    (0, common_1.Get)('receivables'),
    (0, swagger_1.ApiOperation)({ summary: 'List all receivables' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "findAllReceivables", null);
__decorate([
    (0, common_1.Post)('generate-billing'),
    (0, swagger_1.ApiOperation)({ summary: 'Simulate cron to generate monthly billing' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "generateBilling", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a payment manually' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('receipt')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "registerPayment", null);
__decorate([
    (0, common_1.Post)('renegotiations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a debt renegotiation' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "createRenegotiation", null);
__decorate([
    (0, common_1.Post)(':id/boleto'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a PDF boleto for a receivable' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('boleto')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "uploadBoleto", null);
exports.FinancialController = FinancialController = __decorate([
    (0, swagger_1.ApiTags)('Financial'),
    (0, common_1.Controller)('financial'),
    __metadata("design:paramtypes", [financial_service_1.FinancialService])
], FinancialController);
//# sourceMappingURL=financial.controller.js.map