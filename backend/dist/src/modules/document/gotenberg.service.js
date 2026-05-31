"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var GotenbergService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GotenbergService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const FormData = require('form-data');
let GotenbergService = GotenbergService_1 = class GotenbergService {
    logger = new common_1.Logger(GotenbergService_1.name);
    gotenbergUrl = process.env.GOTENBERG_URL || 'http://localhost:3001';
    async convertDocxToPdf(buffer, filename) {
        try {
            const form = new FormData();
            form.append('files', buffer, { filename });
            const response = await axios_1.default.post(`${this.gotenbergUrl}/forms/libreoffice/convert`, form, {
                headers: form.getHeaders(),
                responseType: 'arraybuffer'
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            this.logger.error(`Failed to convert ${filename} to PDF`, error);
            throw error;
        }
    }
};
exports.GotenbergService = GotenbergService;
exports.GotenbergService = GotenbergService = GotenbergService_1 = __decorate([
    (0, common_1.Injectable)()
], GotenbergService);
//# sourceMappingURL=gotenberg.service.js.map