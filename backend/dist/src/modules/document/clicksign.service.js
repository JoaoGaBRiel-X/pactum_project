"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ClicksignService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClicksignService = void 0;
const common_1 = require("@nestjs/common");
let ClicksignService = ClicksignService_1 = class ClicksignService {
    logger = new common_1.Logger(ClicksignService_1.name);
    async sendDocumentForSignature(documentBuffer, fileName, signerInfo) {
        this.logger.log(`Simulating sending ${fileName} to Clicksign for ${signerInfo.name} (${signerInfo.email})`);
        return {
            documentKey: `mock-doc-key-${Date.now()}`,
            signerKey: `mock-signer-key-${Date.now()}`,
            status: 'pending'
        };
    }
};
exports.ClicksignService = ClicksignService;
exports.ClicksignService = ClicksignService = ClicksignService_1 = __decorate([
    (0, common_1.Injectable)()
], ClicksignService);
//# sourceMappingURL=clicksign.service.js.map