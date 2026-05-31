"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BacenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BacenService = void 0;
const common_1 = require("@nestjs/common");
let BacenService = BacenService_1 = class BacenService {
    logger = new common_1.Logger(BacenService_1.name);
    async fetchAccumulatedRate(seriesCode) {
        try {
            const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados/ultimos/12?formato=json`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro na API do Bacen: ${response.statusText}`);
            }
            const data = await response.json();
            if (!data || data.length === 0) {
                throw new Error(`Série ${seriesCode} vazia.`);
            }
            let product = 1;
            for (const item of data) {
                const rate = parseFloat(item.valor) / 100;
                product *= (1 + rate);
            }
            const accumulatedRate = (product - 1) * 100;
            this.logger.log(`BACEN Série ${seriesCode}: Calculado acumulado de ${accumulatedRate.toFixed(4)}% em ${data.length} meses.`);
            return accumulatedRate;
        }
        catch (error) {
            this.logger.error(`Falha ao buscar/calcular série ${seriesCode} do Bacen`, error);
            throw error;
        }
    }
};
exports.BacenService = BacenService;
exports.BacenService = BacenService = BacenService_1 = __decorate([
    (0, common_1.Injectable)()
], BacenService);
//# sourceMappingURL=bacen.service.js.map