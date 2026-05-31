"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorporateGroupModule = void 0;
const common_1 = require("@nestjs/common");
const corporate_group_service_1 = require("./corporate-group.service");
const corporate_group_controller_1 = require("./corporate-group.controller");
const tenant_module_1 = require("../../tenant/tenant.module");
let CorporateGroupModule = class CorporateGroupModule {
};
exports.CorporateGroupModule = CorporateGroupModule;
exports.CorporateGroupModule = CorporateGroupModule = __decorate([
    (0, common_1.Module)({
        imports: [tenant_module_1.TenantModule],
        controllers: [corporate_group_controller_1.CorporateGroupController],
        providers: [corporate_group_service_1.CorporateGroupService],
        exports: [corporate_group_service_1.CorporateGroupService],
    })
], CorporateGroupModule);
//# sourceMappingURL=corporate-group.module.js.map