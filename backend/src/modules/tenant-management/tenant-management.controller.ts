import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { TenantManagementService } from './tenant-management.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { BackofficeGuard } from '../../iam/guards/backoffice.guard';
import { Public } from '../../iam/decorators/public.decorator';

@ApiTags('Tenant Management')
@Controller('tenants')
@Public()
@UseGuards(BackofficeGuard)
@ApiSecurity('x-api-key')
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
