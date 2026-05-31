"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentModule = void 0;
const common_1 = require("@nestjs/common");
const document_controller_1 = require("./document.controller");
const webhook_controller_1 = require("./webhook.controller");
const document_service_1 = require("./document.service");
const template_service_1 = require("./template.service");
const gotenberg_service_1 = require("./gotenberg.service");
const clicksign_service_1 = require("./clicksign.service");
const tenant_module_1 = require("../../tenant/tenant.module");
let DocumentModule = class DocumentModule {
};
exports.DocumentModule = DocumentModule;
exports.DocumentModule = DocumentModule = __decorate([
    (0, common_1.Module)({
        imports: [tenant_module_1.TenantModule],
        controllers: [document_controller_1.DocumentController, webhook_controller_1.WebhookController],
        providers: [document_service_1.DocumentService, template_service_1.TemplateService, gotenberg_service_1.GotenbergService, clicksign_service_1.ClicksignService],
        exports: [document_service_1.DocumentService]
    })
], DocumentModule);
//# sourceMappingURL=document.module.js.map