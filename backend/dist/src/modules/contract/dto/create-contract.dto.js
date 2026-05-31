"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateContractDto = exports.CreateContractItemDto = void 0;
class CreateContractItemDto {
    moduleId;
    quantity;
    discount;
}
exports.CreateContractItemDto = CreateContractItemDto;
class CreateContractDto {
    customerId;
    productId;
    globalDiscount;
    renewalMode;
    adjustmentIndexId;
    items;
}
exports.CreateContractDto = CreateContractDto;
//# sourceMappingURL=create-contract.dto.js.map