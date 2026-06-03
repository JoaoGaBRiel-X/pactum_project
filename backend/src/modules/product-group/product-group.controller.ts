import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { ProductGroupService } from './product-group.service';
import { CreateProductGroupDto } from './dto/create-product-group.dto';
import { UpdateProductGroupDto } from './dto/update-product-group.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('Product Groups')
@Controller('product-groups')
export class ProductGroupController {
  constructor(private readonly productGroupService: ProductGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product group' })
  create(@Body() createProductGroupDto: CreateProductGroupDto, @Req() req: any) {
    return this.productGroupService.create(createProductGroupDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List all product groups' })
  findAll() {
    return this.productGroupService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product group by ID' })
  findOne(@Param('id') id: string) {
    return this.productGroupService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product group' })
  update(@Param('id') id: string, @Body() updateProductGroupDto: UpdateProductGroupDto, @Req() req: any) {
    return this.productGroupService.update(id, updateProductGroupDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product group' })
  remove(@Param('id') id: string) {
    return this.productGroupService.remove(id);
  }
}
