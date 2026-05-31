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
exports.AdjustmentController = void 0;
const common_1 = require("@nestjs/common");
const adjustment_service_1 = require("./adjustment.service");
let AdjustmentController = class AdjustmentController {
    adjustmentService;
    constructor(adjustmentService) {
        this.adjustmentService = adjustmentService;
    }
    createIndex(data, req) {
        const userId = req.headers['x-user-id'] || 'system-user';
        return this.adjustmentService.createIndex(data, userId);
    }
    findAllIndexes() {
        return this.adjustmentService.findAllIndexes();
    }
    addRate(data) {
        return this.adjustmentService.addRate(data.indexId, data.competence, data.accumulatedRate);
    }
    applyManualAdjustment(id, data, req) {
        const userId = req.headers['x-user-id'] || 'system-user';
        return this.adjustmentService.applyManualAdjustment(id, data.percentage, userId);
    }
    runAutomaticAdjustments(req) {
        const userId = req.headers['x-user-id'] || 'system-user';
        return this.adjustmentService.runAutomaticAdjustmentsForTenant(userId);
    }
    syncBacenRates(req) {
        const userId = req.headers['x-user-id'] || 'system-user';
        return this.adjustmentService.syncBacenRatesForTenant(userId);
    }
};
exports.AdjustmentController = AdjustmentController;
__decorate([
    (0, common_1.Post)('indexes'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdjustmentController.prototype, "createIndex", null);
__decorate([
    (0, common_1.Get)('indexes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdjustmentController.prototype, "findAllIndexes", null);
__decorate([
    (0, common_1.Post)('rates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdjustmentController.prototype, "addRate", null);
__decorate([
    (0, common_1.Post)('contracts/:id/manual'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdjustmentController.prototype, "applyManualAdjustment", null);
__decorate([
    (0, common_1.Post)('run-automatic'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdjustmentController.prototype, "runAutomaticAdjustments", null);
__decorate([
    (0, common_1.Post)('sync-bacen'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdjustmentController.prototype, "syncBacenRates", null);
exports.AdjustmentController = AdjustmentController = __decorate([
    (0, common_1.Controller)('adjustments'),
    __metadata("design:paramtypes", [adjustment_service_1.AdjustmentService])
], AdjustmentController);
//# sourceMappingURL=adjustment.controller.js.map