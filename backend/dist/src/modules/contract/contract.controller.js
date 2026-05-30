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
exports.ContractController = void 0;
const common_1 = require("@nestjs/common");
const contract_service_1 = require("./contract.service");
const document_service_1 = require("./document/document.service");
const create_contract_dto_1 = require("./dto/create-contract.dto");
const swagger_1 = require("@nestjs/swagger");
let ContractController = class ContractController {
    contractService;
    documentService;
    constructor(contractService, documentService) {
        this.contractService = contractService;
        this.documentService = documentService;
    }
    async generateDocument(id, req) {
        const userId = req.user?.id || 'system-user';
        const path = await this.documentService.generateContractDocument(id, userId);
        return { message: 'Document generated successfully', path };
    }
    create(createContractDto, req) {
        const userId = req.user?.id || 'system-user';
        return this.contractService.create(createContractDto, userId);
    }
    findAll() {
        return this.contractService.findAll();
    }
    findOne(id) {
        return this.contractService.findOne(id);
    }
};
exports.ContractController = ContractController;
__decorate([
    (0, common_1.Post)(':id/generate-document'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate DOCX for the contract' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "generateDocument", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new contract' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contract_dto_1.CreateContractDto, Object]),
    __metadata("design:returntype", void 0)
], ContractController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all contracts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContractController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get contract details by id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractController.prototype, "findOne", null);
exports.ContractController = ContractController = __decorate([
    (0, swagger_1.ApiTags)('Contracts'),
    (0, common_1.Controller)('contracts'),
    __metadata("design:paramtypes", [contract_service_1.ContractService,
        document_service_1.DocumentService])
], ContractController);
//# sourceMappingURL=contract.controller.js.map