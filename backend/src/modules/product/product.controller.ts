import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateSoftwareProductDto } from './dto/create-product.dto';
import { UpdateSoftwareProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo Produto de Software com seus Módulos' })
  create(@Body() createProductDto: CreateSoftwareProductDto, @Req() req: any) {
    const userId = req.user?.id || 'system-user';
    return this.productService.create(createProductDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos de software' })
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um produto' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um produto e seus módulos' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateSoftwareProductDto, @Req() req: any) {
    const userId = req.user?.id || 'system-user';
    return this.productService.update(id, updateProductDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um produto' })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
