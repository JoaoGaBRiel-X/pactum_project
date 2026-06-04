import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../../iam/decorators/permissions.decorator';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @RequirePermissions('customers:create')
  @ApiOperation({ summary: 'Criar um novo cliente (Customer)' })
  create(@Body() createCustomerDto: CreateCustomerDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.customerService.create(createCustomerDto, userId);
  }

  @Get()
  @RequirePermissions('customers:read', 'customers:read_own')
  @ApiOperation({ summary: 'Listar todos os clientes' })
  findAll(@Req() req: any) {
    const userId = req.user?.userId;
    const permissions = req.tenantContext?.permissions || [];
    return this.customerService.findAll(userId, permissions);
  }

  @Get(':id')
  @RequirePermissions('customers:read', 'customers:read_own')
  @ApiOperation({ summary: 'Obter detalhes de um cliente' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    const permissions = req.tenantContext?.permissions || [];
    return this.customerService.findOne(id, userId, permissions);
  }

  @Put(':id')
  @RequirePermissions('customers:update')
  @ApiOperation({ summary: 'Atualizar um cliente' })
  update(@Param('id') id: string, @Body() updateCustomerDto: any, @Req() req: any) {
    const userId = req.user?.userId;
    const permissions = req.tenantContext?.permissions || [];
    const tenantSlug = req.tenantContext?.schema || req.headers['x-tenant-id'];
    return this.customerService.update(id, updateCustomerDto, userId, tenantSlug, permissions);
  }

  @Delete(':id')
  @RequirePermissions('customers:delete')
  @ApiOperation({ summary: 'Excluir um cliente' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    const permissions = req.tenantContext?.permissions || [];
    return this.customerService.remove(id, userId, permissions);
  }
}

