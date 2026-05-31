"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustmentModule = void 0;
const common_1 = require("@nestjs/common");
const adjustment_controller_1 = require("./adjustment.controller");
const adjustment_service_1 = require("./adjustment.service");
const bacen_service_1 = require("./bacen.service");
const tenant_module_1 = require("../../tenant/tenant.module");
let AdjustmentModule = class AdjustmentModule {
};
exports.AdjustmentModule = AdjustmentModule;
exports.AdjustmentModule = AdjustmentModule = __decorate([
    (0, common_1.Module)({
        imports: [tenant_module_1.TenantModule],
        controllers: [adjustment_controller_1.AdjustmentController],
        providers: [adjustment_service_1.AdjustmentService, bacen_service_1.BacenService],
        exports: [adjustment_service_1.AdjustmentService, bacen_service_1.BacenService]
    })
], AdjustmentModule);
//# sourceMappingURL=adjustment.module.js.map