"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductGroupDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_product_group_dto_1 = require("./create-product-group.dto");
class UpdateProductGroupDto extends (0, swagger_1.PartialType)(create_product_group_dto_1.CreateProductGroupDto) {
}
exports.UpdateProductGroupDto = UpdateProductGroupDto;
//# sourceMappingURL=update-product-group.dto.js.map