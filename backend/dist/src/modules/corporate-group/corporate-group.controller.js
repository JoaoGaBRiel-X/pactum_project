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
exports.CorporateGroupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const corporate_group_service_1 = require("./corporate-group.service");
const create_corporate_group_dto_1 = require("./dto/create-corporate-group.dto");
const update_corporate_group_dto_1 = require("./dto/update-corporate-group.dto");
let CorporateGroupController = class CorporateGroupController {
    corporateGroupService;
    constructor(corporateGroupService) {
        this.corporateGroupService = corporateGroupService;
    }
    create(createCorporateGroupDto, req) {
        const userId = req.user.sub;
        return this.corporateGroupService.create(createCorporateGroupDto, userId);
    }
    findAll() {
        return this.corporateGroupService.findAll();
    }
    findOne(id) {
        return this.corporateGroupService.findOne(id);
    }
    update(id, updateCorporateGroupDto, req) {
        const userId = req.user.sub;
        return this.corporateGroupService.update(id, updateCorporateGroupDto, userId);
    }
    remove(id) {
        return this.corporateGroupService.remove(id);
    }
    getFinancialSummary(id) {
        return this.corporateGroupService.getFinancialSummary(id);
    }
    linkCustomers(id, body, req) {
        const userId = req.user.sub;
        return this.corporateGroupService.linkCustomers(id, body.customerIds, userId);
    }
    unlinkCustomer(id, customerId, req) {
        const userId = req.user.sub;
        return this.corporateGroupService.unlinkCustomer(id, customerId, userId);
    }
};
exports.CorporateGroupController = CorporateGroupController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar um novo Grupo Econômico' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_corporate_group_dto_1.CreateCorporateGroupDto, Object]),
    __metadata("design:returntype", void 0)
], CorporateGroupController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os Grupos Econômicos do locatário' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CorporateGroupController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar detalhes de um Grupo Econômico' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CorporateGroupController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar um Grupo Econômico' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_corporate_group_dto_1.UpdateCorporateGroupDto, Object]),
    __metadata("design:returntype", void 0)
], CorporateGroupController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir um Grupo Econômico' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CorporateGroupController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/financial-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar resumo financeiro do Grupo Econômico' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CorporateGroupController.prototype, "getFinancialSummary", null);
__decorate([
    (0, common_1.Post)(':id/customers'),
    (0, swagger_1.ApiOperation)({ summary: 'Vincular clientes ao Grupo Econômico' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CorporateGroupController.prototype, "linkCustomers", null);
__decorate([
    (0, common_1.Delete)(':id/customers/:customerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Desvincular cliente do Grupo Econômico' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('customerId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CorporateGroupController.prototype, "unlinkCustomer", null);
exports.CorporateGroupController = CorporateGroupController = __decorate([
    (0, swagger_1.ApiTags)('Corporate Groups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('corporate-groups'),
    __metadata("design:paramtypes", [corporate_group_service_1.CorporateGroupService])
], CorporateGroupController);
//# sourceMappingURL=corporate-group.controller.js.map