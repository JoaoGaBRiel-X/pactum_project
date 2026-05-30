import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente (Customer)' })
  create(@Body() createCustomerDto: CreateCustomerDto, @Req() req: any) {
    // Mock user id until JWT is fully integrated
    const userId = req.user?.id || 'system-user';
    return this.customerService.create(createCustomerDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um cliente' })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }
}
