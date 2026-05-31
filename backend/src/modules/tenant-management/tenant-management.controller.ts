import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { TenantManagementService } from './tenant-management.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

// Para simplificar no momento, não adicionaremos AuthGuard nesta rota específica, 
// pois ela pode ser acessada externamente via "Sign Up" de SaaS, ou poderíamos 
// restringir apenas para SuperAdmins no futuro.
// @UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantManagementController {
  constructor(private readonly tenantService: TenantManagementService) {}

  @Post()
  async create(@Body() createDto: CreateTenantDto) {
    return this.tenantService.createTenant(createDto);
  }

  @Get()
  async findAll() {
    return this.tenantService.listTenants();
  }
}
