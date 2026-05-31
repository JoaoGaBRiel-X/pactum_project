"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSoftwareProductDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_product_dto_1 = require("./create-product.dto");
class UpdateSoftwareProductDto extends (0, swagger_1.PartialType)(create_product_dto_1.CreateSoftwareProductDto) {
}
exports.UpdateSoftwareProductDto = UpdateSoftwareProductDto;
//# sourceMappingURL=update-product.dto.js.map