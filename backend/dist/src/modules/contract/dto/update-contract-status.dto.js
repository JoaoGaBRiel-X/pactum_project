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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContractStatusDto = exports.ContractStatus = void 0;
const class_validator_1 = require("class-validator");
var ContractStatus;
(function (ContractStatus) {
    ContractStatus["DRAFT"] = "DRAFT";
    ContractStatus["PENDING_SIGNATURE"] = "PENDING_SIGNATURE";
    ContractStatus["ACTIVE"] = "ACTIVE";
    ContractStatus["SUSPENDED"] = "SUSPENDED";
    ContractStatus["RENEWAL_PENDING"] = "RENEWAL_PENDING";
    ContractStatus["RENEGOTIATED"] = "RENEGOTIATED";
    ContractStatus["CANCELLED"] = "CANCELLED";
    ContractStatus["EXPIRED"] = "EXPIRED";
})(ContractStatus || (exports.ContractStatus = ContractStatus = {}));
class UpdateContractStatusDto {
    status;
    reason;
}
exports.UpdateContractStatusDto = UpdateContractStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(ContractStatus),
    __metadata("design:type", String)
], UpdateContractStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateContractStatusDto.prototype, "reason", void 0);
//# sourceMappingURL=update-contract-status.dto.js.map