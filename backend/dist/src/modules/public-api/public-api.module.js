"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicApiModule = void 0;
const common_1 = require("@nestjs/common");
const oauth_controller_1 = require("./oauth/oauth.controller");
const oauth_service_1 = require("./oauth/oauth.service");
const public_customers_controller_1 = require("./customers/public-customers.controller");
const public_contracts_controller_1 = require("./contracts/public-contracts.controller");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
let PublicApiModule = class PublicApiModule {
};
exports.PublicApiModule = PublicApiModule;
exports.PublicApiModule = PublicApiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'super-secret',
                signOptions: { expiresIn: '1h' },
            }),
        ],
        controllers: [oauth_controller_1.OAuthController, public_customers_controller_1.PublicCustomersController, public_contracts_controller_1.PublicContractsController],
        providers: [oauth_service_1.OAuthService, prisma_service_1.PrismaService],
    })
], PublicApiModule);
//# sourceMappingURL=public-api.module.js.map