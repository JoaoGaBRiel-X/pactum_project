"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalFinancialModule = void 0;
const common_1 = require("@nestjs/common");
const portal_financial_service_1 = require("./portal-financial.service");
const portal_financial_controller_1 = require("./portal-financial.controller");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PortalFinancialModule = class PortalFinancialModule {
};
exports.PortalFinancialModule = PortalFinancialModule;
exports.PortalFinancialModule = PortalFinancialModule = __decorate([
    (0, common_1.Module)({
        controllers: [portal_financial_controller_1.PortalFinancialController],
        providers: [portal_financial_service_1.PortalFinancialService, prisma_service_1.PrismaService],
    })
], PortalFinancialModule);
//# sourceMappingURL=portal-financial.module.js.map